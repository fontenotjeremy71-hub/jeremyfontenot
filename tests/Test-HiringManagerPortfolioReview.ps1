# Recovered entry point. The former raw-HTML review assumed a retired navigation
# layout and could not see JavaScript-rendered proof anchors. Review the current
# pages in Chromium instead, using the same published routes a reviewer visits.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Push-Location ([IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..')))
try {
  & npm run test:browser -- --grep 'hiring reviewer'
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally { Pop-Location }
