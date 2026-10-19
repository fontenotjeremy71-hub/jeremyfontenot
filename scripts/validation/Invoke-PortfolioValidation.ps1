Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$RepositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$PowerShell = Join-Path $PSHOME $(if ($IsWindows) { 'pwsh.exe' } else { 'pwsh' })
if ($PSVersionTable.PSVersion.Major -lt 7) { throw 'PowerShell 7 is required.' }
$Checks = @(
  'validate-no-date-proof.ps1',
  'validate-powershell.ps1',
  'validate-repo-structure.ps1',
  'validate-json.ps1',
  'validate-evidence-hashes.ps1',
  'validate-evidence-claims.ps1',
  'validate-evidence-metadata.ps1',
  'validate-accessibility.ps1',
  'validate-content.ps1',
  'validate-html.ps1',
  'validate-seo.ps1',
  'validate-sitemap.ps1',
  'validate-links.ps1'
)
$Failures = [Collections.Generic.List[string]]::new()
Push-Location $RepositoryRoot
try {
  foreach ($Check in $Checks) {
    Write-Host "=== $Check ==="
    & $PowerShell -NoLogo -NoProfile -File (Join-Path $PSScriptRoot $Check)
    if ($LASTEXITCODE -ne 0) { $Failures.Add($Check) }
  }
} finally { Pop-Location }
if ($Failures.Count -gt 0) { throw ('Validation failed: ' + ($Failures -join ', ')) }
Write-Host "All $($Checks.Count) repository validation scripts passed."
