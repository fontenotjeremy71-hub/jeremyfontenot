Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Validating evidence integrity..."

$HtmlFiles = Get-ChildItem -Path . -Recurse -Filter "*.html" -File | Where-Object {
  $_.FullName -notmatch '[\\/]node_modules[\\/]' -and
  $_.FullName -notmatch '[\\/]archive[\\/]' -and
  $_.FullName -notmatch '[\\/]evidence-library[\\/]preserved-sharepoint[\\/]source[\\/]'
}

$Failures = @()

foreach ($File in $HtmlFiles) {
  $References = Select-String -Path $File.FullName -Pattern '(?:href|src)="([^"]*(?:evidence|proof)[^"]*)"' -AllMatches

  foreach ($Reference in $References) {
    foreach ($Match in $Reference.Matches) {
      $RawPath = $Match.Groups[1].Value
      $RelativePath = ($RawPath -split '[?#]')[0]

      if (
        [string]::IsNullOrWhiteSpace($RelativePath) -or
        $RelativePath.StartsWith("http") -or
        $RelativePath.StartsWith("#")
      ) {
        continue
      }

      $ResolvedPath = Join-Path $File.DirectoryName $RelativePath

      if (-not (Test-Path $ResolvedPath)) {
        $Failures += "$($File.FullName) references missing evidence artifact: $RawPath"
        Write-Host "Missing evidence artifact: $RawPath" -ForegroundColor Red
        Write-Host "Referenced by: $($File.FullName)" -ForegroundColor Red
      } else {
        Write-Host "Verified evidence artifact: $RawPath"
      }
    }
  }
}

if ($Failures.Count -gt 0) {
  Write-Host ""
  Write-Host "Evidence integrity validation failed." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Evidence integrity validation passed." -ForegroundColor Green
