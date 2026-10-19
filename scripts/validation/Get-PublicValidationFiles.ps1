Set-StrictMode -Version Latest

function Get-PublicValidationHtmlFiles {
  $RepositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
  Push-Location $RepositoryRoot
  try {
    $Inventory = & node -e "process.stdout.write(JSON.stringify(require('./scripts/lib/publication-inventory.js').publicHtmlFiles()))"
    if ($LASTEXITCODE -ne 0) { throw 'Unable to load the publication inventory.' }
    foreach ($RelativePath in ($Inventory | ConvertFrom-Json)) {
      Get-Item -LiteralPath (Join-Path $RepositoryRoot $RelativePath)
    }
  } finally { Pop-Location }
}
