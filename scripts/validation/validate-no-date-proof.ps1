Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host 'Validating date-free public presentation content...'

$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$SitemapPath = Join-Path $RepositoryRoot 'sitemap.xml'
$SiteOrigin = 'https://jeremyfontenot.online'
$Failures = [System.Collections.Generic.List[string]]::new()

function Get-AttributeValue {
  param([string]$Tag, [string]$Name)
  $Match = [regex]::Match($Tag, ('(?is)\b{0}\s*=\s*(["''])(?<value>.*?)\1' -f [regex]::Escape($Name)))
  if ($Match.Success) { return [System.Net.WebUtility]::HtmlDecode($Match.Groups['value'].Value) }
  return $null
}

function Get-LocalPathForUrl {
  param([string]$Url)
  $Uri = [Uri]$Url
  $Relative = [Uri]::UnescapeDataString($Uri.AbsolutePath).TrimStart('/')
  if ([string]::IsNullOrWhiteSpace($Relative)) { $Relative = 'index.html' }
  elseif ($Relative.EndsWith('/')) { $Relative = Join-Path $Relative 'index.html' }
  return Join-Path $RepositoryRoot ($Relative -replace '/', [IO.Path]::DirectorySeparatorChar)
}

$Rules = @(
  [pscustomobject]@{ Name = 'month name'; Pattern = '(?-i:\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b)' },
  [pscustomobject]@{ Name = 'month abbreviation'; Pattern = '(?-i:\b(?:Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\b)' },
  [pscustomobject]@{ Name = 'four-digit year'; Pattern = '\b(?:19|20)\d{2}\b' },
  [pscustomobject]@{ Name = 'numeric date'; Pattern = '\b(?:\d{1,2}[/-]\d{1,2}[/-](?:\d{2}|\d{4})|(?:19|20)\d{2}-\d{1,2}(?:-\d{1,2})?)\b' },
  [pscustomobject]@{ Name = 'timestamp'; Pattern = '\b(?:19|20)\d{2}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?\b' },
  [pscustomobject]@{ Name = 'recency language'; Pattern = '(?i)\b(?:recent|recently|latest|newest|fresh|freshness)\b' },
  [pscustomobject]@{ Name = 'generated or updated time language'; Pattern = '(?i)\b(?:last\s+(?:updated|generated)|current\s+as\s+of|as\s+of|validated\s+on|captured\s+on|generated\s+on|collected\s+on)\b' },
  [pscustomobject]@{ Name = 'date-based current language'; Pattern = '(?i)\bcurrent(?:-|\s+)(?:evidence|manifest|proof|status|state|snapshot|version|year)\b' },
  [pscustomobject]@{ Name = 'date terminology'; Pattern = '(?i)\b(?:date|dates|dated|year|years|month|months|timestamp|timestamps)\b' }
)

function Test-PresentationValue {
  param([string]$File, [string]$Surface, [AllowEmptyString()][string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { return }
  $Normalized = ($Value -replace '\s+', ' ').Trim()
  foreach ($Rule in $Rules) {
    $Match = [regex]::Match($Normalized, $Rule.Pattern)
    if ($Match.Success) {
      $Start = [Math]::Max(0, $Match.Index - 55)
      $Length = [Math]::Min(150, $Normalized.Length - $Start)
      $Excerpt = $Normalized.Substring($Start, $Length)
      $Failures.Add("$File [$Surface] contains $($Rule.Name): $Excerpt")
    }
  }
}

function Test-JsonLdNode {
  param([string]$File, [object]$Node, [string]$Path = '$')
  if ($null -eq $Node) { return }
  if ($Node -is [System.Collections.IEnumerable] -and $Node -isnot [string] -and $Node -isnot [pscustomobject]) {
    $Index = 0
    foreach ($Item in $Node) { Test-JsonLdNode -File $File -Node $Item -Path "$Path[$Index]"; $Index += 1 }
    return
  }
  if ($Node -is [pscustomobject]) {
    foreach ($Property in $Node.PSObject.Properties) {
      $ChildPath = "$Path.$($Property.Name)"
      if ($Property.Name -match '^(?i:name|headline|description|alternateName|caption|datePublished|dateModified)$') {
        Test-PresentationValue -File $File -Surface "JSON-LD $ChildPath" -Value ([string]$Property.Value)
      }
      Test-JsonLdNode -File $File -Node $Property.Value -Path $ChildPath
    }
  }
}

[xml]$Sitemap = Get-Content -LiteralPath $SitemapPath -Raw
$Namespace = [System.Xml.XmlNamespaceManager]::new($Sitemap.NameTable)
$Namespace.AddNamespace('sm', 'http://www.sitemaps.org/schemas/sitemap/0.9')
$PublicFiles = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($Location in $Sitemap.SelectNodes('//sm:loc', $Namespace)) {
  [void]$PublicFiles.Add((Get-LocalPathForUrl -Url $Location.InnerText))
}
foreach ($SupportingPath in @('home-lab-operations-proof.html', 'evidence-library/index.html')) {
  [void]$PublicFiles.Add((Join-Path $RepositoryRoot $SupportingPath))
}

foreach ($AbsolutePath in $PublicFiles | Sort-Object) {
  $RelativePath = [IO.Path]::GetRelativePath($RepositoryRoot, $AbsolutePath).Replace('\', '/')
  if (-not (Test-Path -LiteralPath $AbsolutePath)) {
    $Failures.Add("$RelativePath is listed as public but does not exist")
    continue
  }

  $Content = Get-Content -LiteralPath $AbsolutePath -Raw
  $IsGeneratedEvidence = $Content.Contains('GENERATED FILE — DO NOT EDIT DIRECTLY.')

  foreach ($MetaMatch in [regex]::Matches($Content, '(?is)<meta\b[^>]*>')) {
    $Tag = $MetaMatch.Value
    $Key = Get-AttributeValue -Tag $Tag -Name 'name'
    if (-not $Key) { $Key = Get-AttributeValue -Tag $Tag -Name 'property' }
    if ($Key -match '^(?i:description|og:title|og:description|og:image:alt|twitter:title|twitter:description)$') {
      Test-PresentationValue -File $RelativePath -Surface "meta $Key" -Value (Get-AttributeValue -Tag $Tag -Name 'content')
    }
  }

  foreach ($ScriptMatch in [regex]::Matches($Content, '(?is)<script\b[^>]*type\s*=\s*(["''])application/ld\+json\1[^>]*>(?<json>.*?)</script>')) {
    try {
      $Json = $ScriptMatch.Groups['json'].Value | ConvertFrom-Json
      Test-JsonLdNode -File $RelativePath -Node $Json
    } catch {
      $Failures.Add("$RelativePath [JSON-LD] could not be parsed: $($_.Exception.Message)")
    }
  }

  foreach ($TagMatch in [regex]::Matches($Content, '(?is)<(?:a|button|img|input|label|option|textarea|select|figure|figcaption|time)\b[^>]*>')) {
    foreach ($Attribute in @('alt', 'aria-label', 'title', 'value', 'placeholder', 'download')) {
      $AttributeValue = Get-AttributeValue -Tag $TagMatch.Value -Name $Attribute
      if ($null -ne $AttributeValue) {
        Test-PresentationValue -File $RelativePath -Surface "attribute $Attribute" -Value $AttributeValue
      }
    }
  }

  $Presentation = [regex]::Replace($Content, '(?is)<!--.*?-->', ' ')
  $Presentation = [regex]::Replace($Presentation, '(?is)<(?:script|style|noscript|template|svg)\b.*?</(?:script|style|noscript|template|svg)>', ' ')
  $Presentation = [regex]::Replace($Presentation, '(?is)<(?:pre|code)\b.*?</(?:pre|code)>', ' ')
  if ($IsGeneratedEvidence) {
    # The article is a rendered view of an immutable technical source. Its surrounding title,
    # metadata, breadcrumbs, actions, source labels, and footer remain in scope.
    $Presentation = [regex]::Replace($Presentation, '(?is)<article\b[^>]*class\s*=\s*(["''])[^"'']*\bevidence-document\b[^"'']*\1[^>]*>.*?</article>', ' ')
  }
  # Generated evidence wrappers may show an exact artifact title containing a material
  # source-record date. The exception is explicit and limited to the marked element.
  $Presentation = [regex]::Replace($Presentation, '(?is)<(?<tag>[a-z0-9]+)\b[^>]*\bdata-allow-evidence-date\b[^>]*>.*?</\k<tag>>', ' ')
  if ($RelativePath -eq 'resume.html') {
    # Employment and education chronology is an explicit resume-only exception.
    $Presentation = [regex]::Replace($Presentation, '(?is)<(?<tag>[a-z0-9]+)\b[^>]*\bdata-allow-resume-date\b[^>]*>.*?</\k<tag>>', ' ')
  }
  $Presentation = [regex]::Replace($Presentation, '(?is)<[^>]+>', "`n")
  $Presentation = [System.Net.WebUtility]::HtmlDecode($Presentation)
  Test-PresentationValue -File $RelativePath -Surface 'visible text' -Value $Presentation
}

if ($Failures.Count -gt 0) {
  $Failures | Sort-Object -Unique | ForEach-Object { Write-Host $_ -ForegroundColor Red }
  Write-Host "Date-free presentation validation failed with $($Failures.Count) finding(s)." -ForegroundColor Red
  exit 1
}

Write-Host "Date-free presentation validation passed for $($PublicFiles.Count) public pages." -ForegroundColor Green
