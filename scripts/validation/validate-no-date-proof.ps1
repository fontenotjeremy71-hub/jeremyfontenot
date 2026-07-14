Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host 'Validating no-date proof policy...'

$Files = @(
  'index.html', 'projects.html', 'on-prem-home-lab.html', 'proof.html', 'dashboard.html',
  'contact.html', 'home-lab-operations-proof.html', 'evidence-library/index.html',
  'assets/sitemap.xsl', 'assets/js/site.js', 'scripts/build/generate-evidence-pages.js',
  'scripts/config/evidence-pages.json'
)

$Generated = Get-Content 'scripts/config/evidence-pages.json' -Raw | ConvertFrom-Json
$Files += @($Generated | ForEach-Object { $_.output })

$BlockedPhrases = @(
  'validated on', 'tested on', 'current as of', 'latest validation', 'recently verified',
  'evidence date', 'last updated', 'generated on', 'collected on', 'current-year proof',
  'last generated', 'evidence age', 'validation freshness', 'latest evidence',
  'recent evidence', 'current-year evidence'
)

$Failures = [System.Collections.Generic.List[string]]::new()
foreach ($File in $Files | Sort-Object -Unique) {
  if (-not (Test-Path -LiteralPath $File)) { continue }
  $Content = Get-Content -LiteralPath $File -Raw
  foreach ($Phrase in $BlockedPhrases) {
    if ($Content -match [regex]::Escape($Phrase)) {
      $Failures.Add("$File contains prohibited date-proof language: $Phrase")
    }
  }
}

if ($Failures.Count -gt 0) {
  $Failures | ForEach-Object { Write-Host $_ -ForegroundColor Red }
  exit 1
}

Write-Host 'No-date proof policy validation passed.' -ForegroundColor Green
