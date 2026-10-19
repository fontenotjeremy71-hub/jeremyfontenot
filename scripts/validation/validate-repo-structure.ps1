Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host 'Validating repository structure...'

$RequiredPaths = @(
  '.github',
  'assets',
  'docs',
  'scripts',
  'evidence-library'
)

$Missing = [System.Collections.Generic.List[string]]::new()

foreach ($Path in $RequiredPaths) {
  if (-not (Test-Path -Path $Path)) {
    $Missing.Add($Path)
  }
}

if ($Missing.Count -gt 0) {
  Write-Host ''
  Write-Host 'Missing required paths:' -ForegroundColor Red
  $Missing | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
  exit 1
}

Write-Host ''
Write-Host 'Repository structure validation passed.' -ForegroundColor Green
