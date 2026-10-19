# Restored XML and route validation without requiring an optional XSL stylesheet.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Push-Location ([IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..')))
try {
  [xml]$Sitemap = Get-Content -LiteralPath './sitemap.xml' -Raw
  if ($Sitemap.DocumentElement.LocalName -ne 'urlset' -or $Sitemap.DocumentElement.NamespaceURI -ne 'http://www.sitemaps.org/schemas/sitemap/0.9') { throw 'Invalid sitemap root or namespace.' }
  & node './scripts/audits/validate-sitemap.js'
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally { Pop-Location }
