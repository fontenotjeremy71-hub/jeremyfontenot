[CmdletBinding()]
param(
  [string]$BaseUrl = 'https://jeremyfontenot.online/',
  [string]$SiteOnePath = 'C:\siteone-crawler\siteone-crawler.exe',
  [string]$OutputDirectory = 'artifacts/audits/siteone-evidence-integrity/crawls/recruiter'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$ResolvedOutput = [IO.Path]::GetFullPath((Join-Path $RepositoryRoot $OutputDirectory))
if (-not $ResolvedOutput.StartsWith($RepositoryRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Audit output must remain inside the repository.' }
if (-not (Test-Path -LiteralPath $SiteOnePath -PathType Leaf)) { throw "SiteOne executable not found: $SiteOnePath" }
$VersionText = (& $SiteOnePath --version 2>&1 | Out-String)
$VersionMatch = [regex]::Match($VersionText, '(?<version>\d+\.\d+\.\d+)')
if (-not $VersionMatch.Success -or [version]$VersionMatch.Groups['version'].Value -lt [version]'2.5.1') { throw "SiteOne 2.5.1 or newer is required. Reported output: $VersionText" }

$Timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
[IO.Directory]::CreateDirectory($ResolvedOutput) | Out-Null
$Stem = Join-Path $ResolvedOutput "siteone-recruiter.$Timestamp"
$UrlList = Join-Path ([IO.Path]::GetTempPath()) "siteone-recruiter-$Timestamp.urls.txt"
try {
  [xml]$Sitemap = Get-Content -LiteralPath (Join-Path $RepositoryRoot 'sitemap.xml') -Raw
  $Namespace = [Xml.XmlNamespaceManager]::new($Sitemap.NameTable)
  $Namespace.AddNamespace('sm', 'http://www.sitemaps.org/schemas/sitemap/0.9')
  $BaseUri = [Uri]$BaseUrl
  $Urls = @($Sitemap.SelectNodes('//sm:loc', $Namespace) | ForEach-Object {
    $PublishedUri = [Uri]$_.InnerText
    [Uri]::new($BaseUri, $PublishedUri.PathAndQuery).AbsoluteUri
  })
  [IO.File]::WriteAllLines($UrlList, $Urls, [Text.UTF8Encoding]::new($false))
  $Arguments = @(
    "--url=$BaseUrl", "--url-list=$UrlList", '--no-cache', '--workers=3', '--max-reqs-per-sec=10', '--rows-limit=10000',
    '--ignore-regex=~^https?://[^/]+/(?:cdn-cgi/|evidence-library/preserved-sharepoint/(?:source|docs)/)~',
    "--output-html-report=$Stem.html", "--output-json-file=$Stem.json", "--output-text-file=$Stem.txt"
  )
  & $SiteOnePath @Arguments
  if ($LASTEXITCODE -ne 0) { throw "SiteOne recruiter crawl exited with code $LASTEXITCODE." }
  $Report = Get-Content -LiteralPath "$Stem.json" -Raw | ConvertFrom-Json -Depth 100
  $Origin = ([Uri]$BaseUrl).GetLeftPart([UriPartial]::Authority)
  $FirstParty404s = @($Report.results | Where-Object { [int]$_.status -eq 404 -and ([Uri]$_.url).GetLeftPart([UriPartial]::Authority) -eq $Origin -and ([Uri]$_.url).AbsolutePath -notlike '/cdn-cgi/*' })
  $Core = [ordered]@{ profile='recruiter-facing'; version=$Report.crawler.version; score=$Report.qualityScores.overall.score; visitedUrls=$Report.stats.totalUrls; firstPartyCanonical404s=$FirstParty404s.Count; html="$Stem.html"; json="$Stem.json"; text="$Stem.txt" }
  $Core | ConvertTo-Json -Depth 5
  if ($FirstParty404s.Count -gt 0) { throw "Recruiter crawl found $($FirstParty404s.Count) first-party 404 response(s)." }
}
finally {
  if (Test-Path -LiteralPath $UrlList) { Remove-Item -LiteralPath $UrlList -Force }
}
