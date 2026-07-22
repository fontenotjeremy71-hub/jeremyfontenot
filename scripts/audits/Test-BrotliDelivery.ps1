[CmdletBinding()]
param(
  [string]$BaseUrl = 'https://jeremyfontenot.online/',
  [string]$OutputPath = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if (-not $OutputPath) { $OutputPath = "artifacts/audits/siteone-evidence-integrity/brotli-verification.$(Get-Date -Format 'yyyyMMdd-HHmmss').json" }
$ResolvedOutput = [IO.Path]::GetFullPath((Join-Path $RepositoryRoot $OutputPath))
if (-not $ResolvedOutput.StartsWith($RepositoryRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Brotli output must remain inside the repository.' }
[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($ResolvedOutput)) | Out-Null

$Samples = @(
  @{ Path='/'; Category='homepage-html' },
  @{ Path='/systems-administration.html'; Category='recruiter-facing-html' },
  @{ Path='/evidence-library/projects/on-prem-home-lab/current-validated-state/README.html'; Category='generated-evidence-html' },
  @{ Path='/evidence-library/preserved-sharepoint/wrappers/projects/collaboration-sharepoint.html'; Category='sharepoint-wrapper-html' },
  @{ Path='/evidence-library/preserved-sharepoint/source/projects/collaboration-sharepoint.html'; Category='preserved-sharepoint-derivative-html' },
  @{ Path='/assets/css/site.css'; Category='css' },
  @{ Path='/assets/js/site.js'; Category='javascript' },
  @{ Path='/assets/data/m365-evidence-catalog.json'; Category='json' },
  @{ Path='/sitemap.xml'; Category='xml' },
  @{ Path='/evidence-library/projects/on-prem-home-lab/validated-2026-06-21/text/linux01-maintenance-agent-validation.txt'; Category='text-evidence' }
)
$Results = [Collections.Generic.List[object]]::new()
$TempRoot = Join-Path ([IO.Path]::GetTempPath()) "brotli-verification-$([guid]::NewGuid().ToString('N'))"
[IO.Directory]::CreateDirectory($TempRoot) | Out-Null
try {
  foreach ($Sample in $Samples) {
    foreach ($Attempt in 1..2) {
      $HeadersPath = Join-Path $TempRoot "headers-$($Results.Count).txt"
      $BodyPath = Join-Path $TempRoot "body-$($Results.Count).bin"
      $Uri = [Uri]::new([Uri]$BaseUrl, $Sample.Path).AbsoluteUri
      & curl.exe -sS -L -D $HeadersPath -o $BodyPath -H 'Accept-Encoding: br' $Uri
      if ($LASTEXITCODE -ne 0) { throw "curl failed for $Uri" }
      $HeaderText = [IO.File]::ReadAllText($HeadersPath)
      $Blocks = @($HeaderText -split "(?:`r?`n){2,}" | Where-Object { $_ -match '^HTTP/' })
      $Final = $Blocks[-1]
      $Map = @{}
      foreach ($Line in $Final -split "`r?`n" | Select-Object -Skip 1) {
        $Pair = $Line -split ':', 2
        if ($Pair.Count -eq 2) { $Map[$Pair[0].Trim().ToLowerInvariant()] = $Pair[1].Trim() }
      }
      $Status = [int]([regex]::Match($Final, '^HTTP/\S+\s+(?<status>\d{3})').Groups['status'].Value)
      $Results.Add([pscustomobject][ordered]@{
        routeCategory=$Sample.Category; url=$Uri; attempt=$Attempt; status=$Status;
        contentType=$Map['content-type']; contentEncoding=$Map['content-encoding']; rawContentLength=(Get-Item -LiteralPath $BodyPath).Length;
        cacheStatus=$Map['cf-cache-status']; vary=$Map['vary']; cacheControl=$Map['cache-control']
      })
    }
  }
}
finally {
  if (Test-Path -LiteralPath $TempRoot) { Remove-Item -LiteralPath $TempRoot -Recurse -Force }
}
$ByType = @($Results | Group-Object routeCategory | ForEach-Object {
  [pscustomobject]@{ routeCategory=$_.Name; attempts=$_.Count; brotliResponses=@($_.Group | Where-Object contentEncoding -eq 'br').Count; encodings=@($_.Group.contentEncoding | Where-Object { $_ } | Sort-Object -Unique); cacheStatuses=@($_.Group.cacheStatus | Where-Object { $_ } | Sort-Object -Unique) }
})
$Report = [ordered]@{ schemaVersion=1; requestedEncoding='br'; baseUrl=$BaseUrl; samples=$Results; summaryByRouteCategory=$ByType; conclusion='Measured results only. Missing Brotli on a sample may reflect MIME type, response size, cache state, or edge configuration and is not generalized to untested routes.' }
[IO.File]::WriteAllText($ResolvedOutput, ($Report | ConvertTo-Json -Depth 10) + "`n", [Text.UTF8Encoding]::new($false))
$Report | ConvertTo-Json -Depth 10
