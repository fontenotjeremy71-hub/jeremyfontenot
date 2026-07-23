[CmdletBinding()]
param(
  [string]$BaseUrl = 'https://jeremyfontenot.online/',
  [string]$SiteOnePath = 'C:\siteone-crawler\siteone-crawler.exe',
  [string]$OutputDirectory = 'artifacts/audits/siteone-evidence-integrity/crawls/full'
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
$Stem = Join-Path $ResolvedOutput "siteone-evidence-integrity.$Timestamp"
$UrlList = Join-Path ([IO.Path]::GetTempPath()) "siteone-evidence-$Timestamp.urls.txt"
try {
  $M365 = Get-Content -LiteralPath (Join-Path $RepositoryRoot 'assets/data/m365-evidence-catalog.json') -Raw | ConvertFrom-Json -Depth 100
  $HomeLab = Get-Content -LiteralPath (Join-Path $RepositoryRoot 'assets/data/home-lab-evidence-catalog.json') -Raw | ConvertFrom-Json -Depth 100
  [xml]$Sitemap = Get-Content -LiteralPath (Join-Path $RepositoryRoot 'sitemap.xml') -Raw
  $Namespace = [Xml.XmlNamespaceManager]::new($Sitemap.NameTable)
  $Namespace.AddNamespace('sm', 'http://www.sitemaps.org/schemas/sitemap/0.9')
  $Origin = ([Uri]$BaseUrl).GetLeftPart([UriPartial]::Authority)
  $Paths = @(
    $Sitemap.SelectNodes('//sm:loc', $Namespace) | ForEach-Object { ([Uri]$_.InnerText).AbsolutePath }
    $M365.records | ForEach-Object {
      $_.publicRoute
      if ($_.PSObject.Properties.Name -contains 'wrapperRoute') { $_.wrapperRoute }
    } | Where-Object { $_ }
    $HomeLab.records | ForEach-Object { $_.publicRoute } | Where-Object { $_ }
  ) | Sort-Object -Unique
  $Urls = @($Paths | Where-Object { $_ -notlike '/cdn-cgi/*' } | ForEach-Object { ([Uri]::new([Uri]($Origin + '/'), $_)).AbsoluteUri })
  [IO.File]::WriteAllLines($UrlList, $Urls, [Text.UTF8Encoding]::new($false))
  $Arguments = @(
    "--url=$BaseUrl", "--url-list=$UrlList", '--no-cache', '--ignore-robots-txt', '--workers=3', '--max-reqs-per-sec=10', '--rows-limit=10000',
    '--ignore-regex=~^https?://[^/]+/cdn-cgi/~',
    "--output-html-report=$Stem.html", "--output-json-file=$Stem.json", "--output-text-file=$Stem.txt"
  )
  & $SiteOnePath @Arguments
  if ($LASTEXITCODE -ne 0) { throw "SiteOne evidence-integrity crawl exited with code $LASTEXITCODE." }
  node (Join-Path $RepositoryRoot 'scripts/audits/classify-siteone-report.js') --report "$Stem.json" --site-origin $Origin --output-dir $ResolvedOutput --fail-unclassified-internal
  if ($LASTEXITCODE -ne 0) { throw 'SiteOne classification found unclassified first-party internal 404 responses.' }
  $Report = Get-Content -LiteralPath "$Stem.json" -Raw | ConvertFrom-Json -Depth 100
  [ordered]@{ profile='full-evidence-integrity'; version=$Report.crawler.version; score=$Report.qualityScores.overall.score; visitedUrls=$Report.stats.totalUrls; seededPublicEvidenceRoutes=$Urls.Count; html="$Stem.html"; json="$Stem.json"; text="$Stem.txt" } | ConvertTo-Json -Depth 5
}
finally {
  if (Test-Path -LiteralPath $UrlList) { Remove-Item -LiteralPath $UrlList -Force }
}
