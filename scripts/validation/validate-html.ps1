Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host 'Validating HTML files...'

$HtmlFiles = Get-ChildItem -Path . -Recurse -Filter '*.html' -File | Where-Object {
  $_.FullName -notmatch '[\\/]node_modules[\\/]' -and
  $_.FullName -notmatch '[\\/]artifacts[\\/]playwright[\\/]'
}

if (-not $HtmlFiles) {
  Write-Host 'No HTML files found.' -ForegroundColor Red
  exit 1
}

$Failures = [System.Collections.Generic.List[string]]::new()

foreach ($File in $HtmlFiles) {
  try {
    $Content = Get-Content -Path $File.FullName -Raw -ErrorAction Stop
  } catch {
    $Failures.Add($File.FullName)
    Write-Host "Unable to read file: $($File.FullName)" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    continue
  }

  if ($Content -notmatch '<html') {
    $Failures.Add($File.FullName)
    Write-Host "Missing <html tag in: $($File.FullName)" -ForegroundColor Red
    continue
  }

  if ($Content -notmatch '</html>') {
    $Failures.Add($File.FullName)
    Write-Host "Missing </html> tag in: $($File.FullName)" -ForegroundColor Red
    continue
  }

  Write-Host "Valid: $($File.FullName)"
}

if ($Failures.Count -gt 0) {
  Write-Host ''
  Write-Host ("HTML validation failed for {0} file(s)." -f $Failures.Count) -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host 'HTML validation passed.' -ForegroundColor Green
