Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host 'Validating sitemap.xml and its XSLT presentation...'

$RepositoryRoot = (Resolve-Path -Path (Join-Path -Path $PSScriptRoot -ChildPath '..\..')).Path
$SitemapPath = Join-Path -Path $RepositoryRoot -ChildPath 'sitemap.xml'
$XslPath = Join-Path -Path $RepositoryRoot -ChildPath 'assets\sitemap.xsl'
$ExpectedStylesheetInstruction = '<?xml-stylesheet type="text/xsl" href="/assets/sitemap.xsl"?>'
$SitemapNamespace = 'http://www.sitemaps.org/schemas/sitemap/0.9'
$SiteOrigin = 'https://jeremyfontenot.online'
$Failures = [System.Collections.Generic.List[string]]::new()

if (-not (Test-Path -LiteralPath $SitemapPath)) {
  Write-Host 'Missing sitemap.xml' -ForegroundColor Red
  exit 1
}

if (-not (Test-Path -LiteralPath $XslPath)) {
  Write-Host 'Missing assets/sitemap.xsl' -ForegroundColor Red
  exit 1
}

$SitemapBytes = [System.IO.File]::ReadAllBytes($SitemapPath)
if ($SitemapBytes.Length -ge 3 -and $SitemapBytes[0] -eq 0xEF -and $SitemapBytes[1] -eq 0xBB -and $SitemapBytes[2] -eq 0xBF) {
  $Failures.Add('sitemap.xml contains a UTF-8 byte-order mark.')
}

$RawSitemap = [System.IO.File]::ReadAllText($SitemapPath, [System.Text.UTF8Encoding]::new($false))
$ExpectedPrefix = "<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n$ExpectedStylesheetInstruction`n"
if (-not $RawSitemap.Replace("`r`n", "`n").StartsWith($ExpectedPrefix, [System.StringComparison]::Ordinal)) {
  $Failures.Add('sitemap.xml must begin with the XML declaration and same-origin stylesheet instruction with no leading content.')
}

try {
  [xml]$Sitemap = $RawSitemap
} catch {
  Write-Host 'sitemap.xml is not valid XML.' -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 1
}

if ($Sitemap.DocumentElement.NamespaceURI -ne $SitemapNamespace -or $Sitemap.DocumentElement.LocalName -ne 'urlset') {
  $Failures.Add('sitemap.xml does not use the standard sitemap urlset namespace.')
}

$NamespaceManager = [System.Xml.XmlNamespaceManager]::new($Sitemap.NameTable)
$NamespaceManager.AddNamespace('sm', $SitemapNamespace)
$UrlNodes = @($Sitemap.SelectNodes('/sm:urlset/sm:url', $NamespaceManager))
if ($UrlNodes.Count -eq 0) {
  $Failures.Add('sitemap.xml does not contain any URL entries.')
}

$Urls = @($UrlNodes | ForEach-Object { [string]$_.loc })
$Duplicates = @($Urls | Group-Object | Where-Object { $_.Count -gt 1 })
foreach ($Duplicate in $Duplicates) {
  $Failures.Add("Duplicate sitemap URL: $($Duplicate.Name)")
}

foreach ($Url in $Urls) {
  $Uri = $null
  if (-not [System.Uri]::TryCreate($Url, [System.UriKind]::Absolute, [ref]$Uri) -or $Uri.Scheme -ne 'https') {
    $Failures.Add("Sitemap URL is not absolute HTTPS: $Url")
    continue
  }
  if ($Uri.Host -ne 'jeremyfontenot.online') {
    $Failures.Add("Sitemap URL is not on the canonical host: $Url")
    continue
  }
  if ($Uri.AbsolutePath.EndsWith('.md', [System.StringComparison]::OrdinalIgnoreCase)) {
    $Failures.Add("Raw Markdown URL appears in sitemap: $Url")
  }

  $RelativePath = [System.Uri]::UnescapeDataString($Uri.AbsolutePath).TrimStart('/')
  if ([string]::IsNullOrEmpty($RelativePath)) {
    $RelativePath = 'index.html'
  } elseif ($RelativePath.EndsWith('/')) {
    $RelativePath = "${RelativePath}index.html"
  }
  $LocalPath = Join-Path -Path $RepositoryRoot -ChildPath $RelativePath
  if (-not (Test-Path -LiteralPath $LocalPath)) {
    $Failures.Add("Sitemap URL does not map to a public file: $Url")
    continue
  }
  if ([System.IO.Path]::GetExtension($LocalPath) -eq '.html') {
    $Html = Get-Content -LiteralPath $LocalPath -Raw
    if ($Html -match '<meta\s+name="robots"\s+content="[^"]*noindex') {
      $Failures.Add("Sitemap URL maps to a noindex page: $Url")
    }
  }
  Write-Host "Valid sitemap URL: $Url"
}

try {
  [xml]$XslDocument = Get-Content -LiteralPath $XslPath -Raw
  $XslNamespaceManager = [System.Xml.XmlNamespaceManager]::new($XslDocument.NameTable)
  $XslNamespaceManager.AddNamespace('xsl', 'http://www.w3.org/1999/XSL/Transform')
  $XslNamespaceManager.AddNamespace('sm', $SitemapNamespace)
  if (-not $XslDocument.SelectSingleNode('/xsl:stylesheet', $XslNamespaceManager)) {
    $Failures.Add('assets/sitemap.xsl is not an XSLT stylesheet.')
  }
  if (-not $XslDocument.SelectSingleNode('//xsl:for-each[@select="sm:urlset/sm:url"]', $XslNamespaceManager)) {
    $Failures.Add('assets/sitemap.xsl does not generate entries from sm:urlset/sm:url.')
  }
  if (-not $XslDocument.SelectSingleNode('//xsl:value-of[@select="count(sm:urlset/sm:url)"]', $XslNamespaceManager)) {
    $Failures.Add('assets/sitemap.xsl does not calculate the URL count dynamically.')
  }
} catch {
  $Failures.Add("assets/sitemap.xsl is not well-formed XML: $($_.Exception.Message)")
}

try {
  $Transform = [System.Xml.Xsl.XslCompiledTransform]::new()
  $Transform.Load($XslPath)
  $StringWriter = [System.IO.StringWriter]::new([System.Globalization.CultureInfo]::InvariantCulture)
  try {
    $XmlWriter = [System.Xml.XmlWriter]::Create($StringWriter, $Transform.OutputSettings)
    try {
      $Transform.Transform($SitemapPath, $XmlWriter)
    } finally {
      $XmlWriter.Dispose()
    }
    $TransformedHtml = $StringWriter.ToString()
  } finally {
    $StringWriter.Dispose()
  }

  $RenderedEntries = ([regex]::Matches($TransformedHtml, 'class="sitemap-entry"')).Count
  if ($RenderedEntries -ne $Urls.Count) {
    $Failures.Add("XSLT rendered $RenderedEntries sitemap entries; expected $($Urls.Count).")
  }
  foreach ($Url in $Urls) {
    if ($TransformedHtml -notmatch [regex]::Escape("href=`"$Url`"")) {
      $Failures.Add("XSLT output is missing a link for: $Url")
    }
  }
  Write-Host "XSLT transform rendered $RenderedEntries sitemap entries."
} catch {
  $Failures.Add("Sitemap XSLT transform failed: $($_.Exception.Message)")
}

if ($Failures.Count -gt 0) {
  Write-Host ''
  foreach ($Failure in $Failures) {
    Write-Host $Failure -ForegroundColor Red
  }
  Write-Host ''
  Write-Host "Sitemap validation failed for $($Failures.Count) issue(s)." -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host "Sitemap validation passed for $($Urls.Count) URL(s)." -ForegroundColor Green
