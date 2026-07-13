Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Validating accessibility basics..."

$HtmlFiles = Get-ChildItem -Path . -Recurse -Filter "*.html" -File | Where-Object {
  $_.DirectoryName -notmatch "node_modules" -and
  $_.DirectoryName -notmatch "\\.git" -and
  $_.FullName -notmatch '[\\/]artifacts[\\/]playwright[\\/]'
}

$Failures = @()

foreach ($File in $HtmlFiles) {
  $Content = Get-Content $File.FullName -Raw

  if ($Content -notmatch "<title>.*</title>") {
    $Failures += "$($File.FullName) is missing a title tag."
    Write-Host "Missing title: $($File.FullName)" -ForegroundColor Red
  }

  if ($Content -notmatch '<html[^>]+lang=') {
    $Failures += "$($File.FullName) is missing html lang attribute."
    Write-Host "Missing html lang: $($File.FullName)" -ForegroundColor Red
  }

  $ImageMatches = Select-String -Path $File.FullName -Pattern '<img\b(?![^>]*\balt=)' -AllMatches
  if ($ImageMatches -and $ImageMatches.Matches.Count -gt 0) {
    $Failures += "$($File.FullName) has image tags without alt attributes."
    Write-Host "Image missing alt: $($File.FullName)" -ForegroundColor Red
  }

  $ButtonMatches = Select-String -Path $File.FullName -Pattern '<button\b(?![^>]*(aria-label|>[^<]+</button>))' -AllMatches
  if ($ButtonMatches -and $ButtonMatches.Matches.Count -gt 0) {
    $Failures += "$($File.FullName) has buttons without visible text or aria-label."
    Write-Host "Button missing label: $($File.FullName)" -ForegroundColor Red
  }

  Write-Host "Checked accessibility basics: $($File.FullName)"
}

if ($Failures.Count -gt 0) {
  Write-Host ""
  Write-Host "Accessibility validation failed." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Accessibility validation passed." -ForegroundColor Green
