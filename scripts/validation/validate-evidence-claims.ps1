Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Validating evidence claim alignment..."

$IndexPath = ".\evidence-library\evidence-search-index.json"

if (-not (Test-Path $IndexPath)) {
  Write-Host "Missing evidence-search-index.json" -ForegroundColor Red
  exit 1
}

$Items = Get-Content $IndexPath -Raw | ConvertFrom-Json
$Failures = @()

foreach ($Item in $Items) {
  if (-not (Test-Path $Item.path)) {
    $Failures += "Missing indexed artifact: $($Item.path)"
    continue
  }

  $Extension = [System.IO.Path]::GetExtension($Item.path).ToLowerInvariant()

  $BinaryExtensions = @(".png", ".jpg", ".jpeg", ".webp", ".avif", ".pdf")

  if ($BinaryExtensions -contains $Extension) {
    Write-Host "Skipped binary artifact claim text check: $($Item.path)"
    continue
  }

  $Content = Get-Content $Item.path -Raw -ErrorAction SilentlyContinue

  $Terms = @()
  $Terms += $Item.title
  $Terms += $Item.relatedProject
  $Terms += $Item.relatedSkill
  $Terms += $Item.proofType
  $Terms += $Item.tags
  $Terms += "m365"
  $Terms += "conditional"
  $Terms += "baseline"
  $Terms += "pfsense"
  $Terms += "network"
  $Terms += "validation"

  $Terms = $Terms | Where-Object { $_ -and $_.ToString().Length -ge 4 } | Select-Object -Unique

  $Matched = $false

  foreach ($Term in $Terms) {
    if ($Content -match [regex]::Escape($Term.ToString())) {
      $Matched = $true
      break
    }
  }

  if (-not $Matched) {
    $Failures += "Artifact content does not appear to match metadata claim: $($Item.path)"
    Write-Host "Claim mismatch: $($Item.path)" -ForegroundColor Red
  } else {
    Write-Host "Claim aligned: $($Item.path)"
  }
}

if ($Failures.Count -gt 0) {
  Write-Host ""
  Write-Host "Evidence claim validation failed." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Evidence claim validation passed." -ForegroundColor Green
