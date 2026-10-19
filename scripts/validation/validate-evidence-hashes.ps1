Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Validating evidence hash integrity..."

$HashInventory = ".\evidence-library\integrity\evidence-hashes.json"

$TextExtensions = @(
  ".md", ".txt", ".csv", ".json", ".yaml", ".yml", ".ps1", ".svg", ".html", ".xml", ".gitkeep"
)

function Get-NormalizedSha256 {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  $ResolvedPath = (Resolve-Path -LiteralPath $Path).Path
  $Extension = [System.IO.Path]::GetExtension($ResolvedPath).ToLowerInvariant()

  if ($TextExtensions -contains $Extension) {
    $Text = Get-Content -LiteralPath $ResolvedPath -Raw
    $Normalized = $Text -replace "`r`n", "`n"
    $Bytes = [System.Text.Encoding]::UTF8.GetBytes($Normalized)
  } else {
    $Bytes = [System.IO.File]::ReadAllBytes($ResolvedPath)
  }

  $Sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    return ([System.BitConverter]::ToString($Sha.ComputeHash($Bytes))).Replace("-", "")
  } finally {
    $Sha.Dispose()
  }
}

if (-not (Test-Path $HashInventory)) {
  Write-Host "Missing evidence hash inventory." -ForegroundColor Red
  exit 1
}

$Entries = Get-Content $HashInventory -Raw | ConvertFrom-Json
$Failures = @()

foreach ($Entry in $Entries) {
  if (-not (Test-Path $Entry.path)) {
    $Failures += "Missing file: $($Entry.path)"
    Write-Host "Missing file: $($Entry.path)" -ForegroundColor Red
    continue
  }

  $CurrentHash = Get-NormalizedSha256 -Path $Entry.path

  if ($CurrentHash -ne $Entry.sha256) {
    $Failures += "Hash mismatch: $($Entry.path)"
    Write-Host "Hash mismatch: $($Entry.path)" -ForegroundColor Red
    continue
  }

  Write-Host "Hash verified: $($Entry.path)"
}

if ($Failures.Count -gt 0) {
  Write-Host ""
  Write-Host "Evidence hash validation failed." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Evidence hash validation passed." -ForegroundColor Green
