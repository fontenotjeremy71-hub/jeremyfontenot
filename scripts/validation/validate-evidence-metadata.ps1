Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Validating evidence metadata consistency..."

$CsvPath = ".\evidence-library\evidence-source-map.csv"

if (-not (Test-Path $CsvPath)) {
  Write-Host "Missing evidence-source-map.csv" -ForegroundColor Red
  exit 1
}

$Rows = Import-Csv $CsvPath

if (-not $Rows) {
  Write-Host "Evidence source map is empty." -ForegroundColor Red
  exit 1
}

$Failures = @()

foreach ($Row in $Rows) {

  $RequiredFields = @(
    "path",
    "title",
    "status",
    "proofType",
    "relatedProject"
  )

  foreach ($Field in $RequiredFields) {
    if (-not $Row.$Field -or [string]::IsNullOrWhiteSpace($Row.$Field)) {
      $Failures += "Missing field [$Field] for path [$($Row.path)]"
      Write-Host "Missing metadata field [$Field] -> $($Row.path)" -ForegroundColor Red
    }
  }

  if (-not (Test-Path $Row.path)) {
    $Failures += "Missing artifact file [$($Row.path)]"
    Write-Host "Missing artifact file: $($Row.path)" -ForegroundColor Red
  } else {
    Write-Host "Verified artifact metadata: $($Row.path)"
  }
}

if ($Failures.Count -gt 0) {
  Write-Host ""
  Write-Host "Evidence metadata validation failed." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Evidence metadata validation passed." -ForegroundColor Green
