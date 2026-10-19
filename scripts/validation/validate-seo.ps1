Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Validating SEO metadata..."

$HtmlFiles = Get-ChildItem -Path . -Recurse -Filter "*.html" -File | Where-Object {
  $_.DirectoryName -notmatch "node_modules" -and
  $_.DirectoryName -notmatch "\\.git" -and
  $_.FullName -notmatch '[\\/]artifacts[\\/]playwright[\\/]' -and
  # SiteOne HTML files are external audit-tool reports, not published site pages.
  $_.FullName -notmatch '[\\/]artifacts[\\/]audits[\\/]siteone-evidence-integrity[\\/]crawls[\\/]'
}

$Failures = @()

foreach ($File in $HtmlFiles) {
  $Content = Get-Content $File.FullName -Raw

  $Checks = @{
    "title tag" = "<title>.+</title>"
    "meta description" = '<meta\s+name="description"\s+content="[^"]+">'
    "canonical link" = '<link\s+rel="canonical"\s+href="[^"]+">'
    "Open Graph title" = '<meta\s+property="og:title"\s+content="[^"]+">'
    "Open Graph description" = '<meta\s+property="og:description"\s+content="[^"]+">'
  }

  foreach ($Check in $Checks.GetEnumerator()) {
    if ($Content -notmatch $Check.Value) {
      $Failures += "$($File.FullName) missing $($Check.Key)"
      Write-Host "Missing $($Check.Key): $($File.FullName)" -ForegroundColor Red
    }
  }

  Write-Host "Checked SEO metadata: $($File.FullName)"
}

if ($Failures.Count -gt 0) {
  Write-Host ""
  Write-Host "SEO validation failed." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "SEO validation passed." -ForegroundColor Green
