Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host 'Validating JSON files...'

function Test-JsonSyntax {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Json
  )

  $JsonDocumentType = [System.Type]::GetType('System.Text.Json.JsonDocument, System.Text.Json')
  if ($JsonDocumentType) {
    $Document = $JsonDocumentType::Parse($Json)
    $Document.Dispose()
    return
  }

  Add-Type -AssemblyName System.Web.Extensions
  $Serializer = [System.Web.Script.Serialization.JavaScriptSerializer]::new()
  $Serializer.MaxJsonLength = [int]::MaxValue
  $Serializer.DeserializeObject($Json) | Out-Null
}

$JsonFiles = Get-ChildItem -Path . -Recurse -Filter '*.json' -File | Where-Object {
  $_.FullName -notmatch '[\\/]node_modules[\\/]'
}

if (-not $JsonFiles) {
  Write-Host 'No JSON files found.' -ForegroundColor Yellow
  exit 0
}

$Failures = [System.Collections.Generic.List[string]]::new()

foreach ($File in $JsonFiles) {
  try {
    $RawJson = Get-Content -Path $File.FullName -Raw -ErrorAction Stop
    Test-JsonSyntax -Json $RawJson
    Write-Host "Valid: $($File.FullName)"
  } catch {
    $Failures.Add($File.FullName)
    Write-Host "Invalid JSON: $($File.FullName)" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
  }
}

if ($Failures.Count -gt 0) {
  Write-Host ''
  Write-Host ("JSON validation failed for {0} file(s)." -f $Failures.Count) -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host 'JSON validation passed.' -ForegroundColor Green
