# Restored from c4afad9a6a97a1165a724412433188aed5dfb5b9 and adapted
# to current canonical pages, retained evidence context, and static navigation.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$RepositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
Push-Location $RepositoryRoot
try {
  & node './scripts/validation/validate-public-presentation.mjs' seo
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally { Pop-Location }
