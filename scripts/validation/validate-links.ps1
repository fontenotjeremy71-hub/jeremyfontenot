Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host 'Validating internal links...'

$RepositoryRoot = (Resolve-Path -Path (Join-Path -Path $PSScriptRoot -ChildPath '..\..')).Path

$HtmlFiles = Get-ChildItem -Path . -Recurse -Filter '*.html' -File | Where-Object {
  $_.FullName -notmatch '[\\/]node_modules[\\/]' -and
  $_.FullName -notmatch '[\\/]archive[\\/]' -and
  $_.FullName -notmatch '[\\/]artifacts[\\/]playwright[\\/]' -and
  $_.FullName -notmatch '[\\/]evidence-library[\\/]preserved-sharepoint[\\/]source[\\/]'
}

if (-not $HtmlFiles) {
  Write-Host 'No HTML files found for link validation.' -ForegroundColor Red
  exit 1
}

$Failures = [System.Collections.Generic.List[string]]::new()

foreach ($File in $HtmlFiles) {
  $Matches = Select-String -Path $File.FullName -Pattern '(?:href|src)="([^"]+)"' -AllMatches

  foreach ($Match in $Matches.Matches) {
    $RelativePath = ($Match.Groups[1].Value -split '[?#]')[0]

    if (
      [string]::IsNullOrWhiteSpace($RelativePath) -or
      $RelativePath.StartsWith('http') -or
      $RelativePath.StartsWith('#') -or
      $RelativePath.StartsWith('mailto:') -or
      $RelativePath.StartsWith('tel:') -or
      $RelativePath.StartsWith('//')
    ) {
      continue
    }

    if ($RelativePath.StartsWith('/')) {
      $ResolvedPath = Join-Path -Path $RepositoryRoot -ChildPath $RelativePath.TrimStart('/')
    } else {
      $ResolvedPath = Join-Path -Path $File.DirectoryName -ChildPath $RelativePath
    }

    if (-not (Test-Path -Path $ResolvedPath)) {
      $Failures.Add("$($File.FullName) => $RelativePath")
      Write-Host "Missing reference in $($File.FullName): $RelativePath" -ForegroundColor Red
    }
  }
}

if ($Failures.Count -gt 0) {
  Write-Host ''
  Write-Host ("Link validation failed for {0} reference(s)." -f $Failures.Count) -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host 'Link validation passed.' -ForegroundColor Green
