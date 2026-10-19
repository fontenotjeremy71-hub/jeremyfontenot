# Restored entry point; current shared audit handles static and rendered routes.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Push-Location ([IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..')))
try {
  & node './scripts/audits/validate-button-targets.js'
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  & node './scripts/audits/validate-cta-semantics.js'
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally { Pop-Location }
