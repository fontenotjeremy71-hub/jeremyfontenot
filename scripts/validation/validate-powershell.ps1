Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host 'Validating PowerShell script syntax...'

$PowerShellFiles = Get-ChildItem -Path . -Recurse -Filter '*.ps1' -File | Where-Object {
  $_.FullName -notmatch '[\\/]node_modules[\\/]'
}

if (-not $PowerShellFiles) {
  Write-Host 'No PowerShell files found to validate.' -ForegroundColor Yellow
  exit 0
}

$Failures = [System.Collections.Generic.List[string]]::new()

foreach ($File in $PowerShellFiles) {
  $tokens = $null
  $parseErrors = $null
  [void][System.Management.Automation.Language.Parser]::ParseFile($File.FullName, [ref]$tokens, [ref]$parseErrors)

  if ($parseErrors -and $parseErrors.Count -gt 0) {
    $Failures.Add($File.FullName)
    Write-Host "Syntax errors in: $($File.FullName)" -ForegroundColor Red

    foreach ($parseError in $parseErrors) {
      $line = $parseError.Extent.StartLineNumber
      $column = $parseError.Extent.StartColumnNumber
      Write-Host ("  Line {0}, Col {1}: {2}" -f $line, $column, $parseError.Message) -ForegroundColor Red
    }

    continue
  }

  Write-Host "Valid: $($File.FullName)"
}

if ($Failures.Count -gt 0) {
  Write-Host ''
  Write-Host ("PowerShell syntax validation failed for {0} file(s)." -f $Failures.Count) -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host 'PowerShell syntax validation passed.' -ForegroundColor Green
