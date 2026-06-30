Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path -Path (Join-Path -Path $PSScriptRoot -ChildPath '..')).Path
$ReportRoot = Join-Path -Path $RepoRoot -ChildPath 'logs/hiring-manager-review'
$AllowedReportRoot = (Join-Path -Path $RepoRoot -ChildPath 'logs/hiring-manager-review')

if (-not $ReportRoot.StartsWith($AllowedReportRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to write outside logs/hiring-manager-review: $ReportRoot"
}

if (Test-Path -Path $ReportRoot) {
  Remove-Item -Path $ReportRoot -Recurse -Force
}
New-Item -Path $ReportRoot -ItemType Directory -Force | Out-Null

$ActivePages = @(
  'index.html',
  'projects.html',
  'on-prem-home-lab.html',
  'home-lab-operations-proof.html',
  'proof.html',
  'dashboard.html',
  'resume.html',
  'contact.html'
)

$Results = [System.Collections.Generic.List[object]]::new()
$PageData = @{}

function Add-ReviewResult {
  param(
    [Parameter(Mandatory)][string]$Category,
    [Parameter(Mandatory)][string]$Check,
    [Parameter(Mandatory)][ValidateSet('PASS', 'WARNING', 'FAIL')][string]$Status,
    [Parameter(Mandatory)][string]$Message,
    [string]$Page = '',
    [string]$Target = '',
    [bool]$Critical = $true
  )

  $Results.Add([pscustomobject][ordered]@{
    status = $Status
    category = $Category
    check = $Check
    page = $Page
    target = $Target
    critical = ($Status -eq 'FAIL' -and $Critical)
    message = $Message
  })
}

function ConvertTo-VisibleText {
  param([Parameter(Mandatory)][string]$Html)

  $withoutScript = [regex]::Replace($Html, '(?is)<script\b.*?</script>', ' ')
  $withoutStyle = [regex]::Replace($withoutScript, '(?is)<style\b.*?</style>', ' ')
  $withSpaces = [regex]::Replace($withoutStyle, '(?is)<(br|p|li|tr|div|section|article|h[1-6])\b[^>]*>', ' ')
  $withoutTags = [regex]::Replace($withSpaces, '(?is)<[^>]+>', ' ')
  $decoded = [System.Net.WebUtility]::HtmlDecode($withoutTags)
  return ([regex]::Replace($decoded, '\s+', ' ').Trim())
}

function ConvertTo-LinkText {
  param([Parameter(Mandatory)][string]$Html)

  return (ConvertTo-VisibleText -Html $Html)
}

function Get-HtmlLinks {
  param(
    [Parameter(Mandatory)][string]$Page,
    [Parameter(Mandatory)][string]$Html
  )

  $Links = [System.Collections.Generic.List[object]]::new()
  $AnchorPattern = '(?is)<a\b(?<attrs>[^>]*)>(?<body>.*?)</a>'
  foreach ($Match in [regex]::Matches($Html, $AnchorPattern)) {
    $Attrs = $Match.Groups['attrs'].Value
    $HrefMatch = [regex]::Match($Attrs, '(?i)\bhref\s*=\s*["''](?<href>[^"'']+)["'']')
    if (-not $HrefMatch.Success) {
      continue
    }

    $Links.Add([pscustomobject]@{
      page = $Page
      attribute = 'href'
      url = $HrefMatch.Groups['href'].Value
      text = (ConvertTo-LinkText -Html $Match.Groups['body'].Value)
    })
  }

  foreach ($Match in [regex]::Matches($Html, '(?i)\bsrc\s*=\s*["''](?<src>[^"'']+)["'']')) {
    $Links.Add([pscustomobject]@{
      page = $Page
      attribute = 'src'
      url = $Match.Groups['src'].Value
      text = ''
    })
  }

  return @($Links)
}

function Get-PageIds {
  param([Parameter(Mandatory)][string]$Html)

  $Ids = [System.Collections.Generic.List[string]]::new()
  foreach ($Match in [regex]::Matches($Html, '(?i)\bid\s*=\s*["''](?<id>[^"'']+)["'']')) {
    $Ids.Add($Match.Groups['id'].Value)
  }
  return @($Ids)
}

function Test-ExternalUrl {
  param([Parameter(Mandatory)][string]$Url)

  return (
    $Url -match '^(?i:https?:|mailto:|tel:|sms:|//)' -or
    $Url -match '^(?i:javascript:)'
  )
}

function Resolve-InternalTarget {
  param(
    [Parameter(Mandatory)][string]$SourcePage,
    [Parameter(Mandatory)][string]$Url
  )

  $PathPart = ($Url -split '#', 2)[0]
  $Fragment = ''
  if ($Url.Contains('#')) {
    $Fragment = ($Url -split '#', 2)[1]
  }
  $PathPart = ($PathPart -split '\?', 2)[0]

  if ([string]::IsNullOrWhiteSpace($PathPart)) {
    $PathPart = $SourcePage
  } elseif ($PathPart -eq '/') {
    $PathPart = 'index.html'
  } elseif ($PathPart.StartsWith('/')) {
    $PathPart = $PathPart.TrimStart('/')
  }

  $SourceDirectory = Split-Path -Path (Join-Path -Path $RepoRoot -ChildPath $SourcePage) -Parent
  $Resolved = if ($PathPart -eq $SourcePage) {
    Join-Path -Path $RepoRoot -ChildPath $SourcePage
  } elseif ($PathPart -match '^(?i)[a-z]:[\\/]') {
    $PathPart
  } elseif ($PathPart.StartsWith('.')) {
    Join-Path -Path $SourceDirectory -ChildPath $PathPart
  } else {
    Join-Path -Path $RepoRoot -ChildPath $PathPart
  }

  $NormalizedRelative = $PathPart.Replace('\', '/')
  if ($NormalizedRelative.StartsWith('./')) {
    $NormalizedRelative = $NormalizedRelative.Substring(2)
  }

  return [pscustomobject]@{
    pathPart = $PathPart
    fragment = $Fragment
    fullPath = $Resolved
    relativePath = $NormalizedRelative
  }
}

function Get-PrimaryNavigationLinks {
  param([Parameter(Mandatory)][string]$Html)

  $NavMatch = [regex]::Match($Html, '(?is)<nav\b[^>]*aria-label=["'']Primary navigation["''][^>]*>(?<nav>.*?)</nav>')
  if (-not $NavMatch.Success) {
    return @()
  }
  return @(Get-HtmlLinks -Page 'index.html' -Html $NavMatch.Groups['nav'].Value | Where-Object { $_.attribute -eq 'href' })
}

function Get-InternalPageName {
  param([Parameter(Mandatory)][string]$Url)

  if (Test-ExternalUrl -Url $Url) {
    return $null
  }

  $Target = Resolve-InternalTarget -SourcePage 'index.html' -Url $Url
  $Relative = $Target.relativePath
  if ([string]::IsNullOrWhiteSpace($Relative) -or $Relative -eq '/') {
    return 'index.html'
  }
  if ($Relative.EndsWith('.html')) {
    return $Relative
  }
  return $null
}

function Test-NegatedSentence {
  param([Parameter(Mandatory)][string]$Sentence)

  return ($Sentence -match '(?i)\b(no|not|does not|do not|without|excluded|not presented|not claimed|intentionally excluded|no [^.?!]* claim)\b')
}

function Get-ContainingSentences {
  param(
    [Parameter(Mandatory)][string]$Text,
    [Parameter(Mandatory)][string]$Pattern
  )

  $Sentences = [regex]::Split($Text, '(?<=[.!?])\s+')
  return @($Sentences | Where-Object { $_ -match $Pattern })
}

function Get-EvidenceTargetType {
  param([Parameter(Mandatory)][string]$Target)

  $Normalized = $Target.Replace('\', '/').ToLowerInvariant()
  if ($Normalized -match '/current-validated-state/direct-evidence/') {
    return 'direct-infrastructure-evidence'
  }
  if ($Normalized -match '/skills-validation/') {
    return 'skills-validation'
  }
  if ($Normalized -match 'source-summaries|summary|readme\.md|operations-validation-summary\.json') {
    return 'summary'
  }
  if ($Normalized -match 'manifest|claim-map|proof-map|inventory|provenance') {
    return 'manifest-or-index'
  }
  if ($Normalized -match '\.(png|jpg|jpeg|gif|webp)$|screenshot') {
    return 'screenshot'
  }
  return 'other'
}

foreach ($Page in $ActivePages) {
  $Path = Join-Path -Path $RepoRoot -ChildPath $Page
  if (-not (Test-Path -Path $Path)) {
    Add-ReviewResult -Category 'Page integrity' -Check 'Required active page exists' -Status 'FAIL' -Page $Page -Message "Required active page is missing: $Page"
    continue
  }

  $Html = Get-Content -Path $Path -Raw
  $PageData[$Page] = [pscustomobject]@{
    path = $Path
    html = $Html
    text = (ConvertTo-VisibleText -Html $Html)
    links = @(Get-HtmlLinks -Page $Page -Html $Html)
    ids = @(Get-PageIds -Html $Html)
  }
}

if ($PageData.Count -eq $ActivePages.Count) {
  Add-ReviewResult -Category 'Page integrity' -Check 'All required active pages exist' -Status 'PASS' -Message "All $($ActivePages.Count) required active pages exist."
}

$AllText = (($ActivePages | Where-Object { $PageData.ContainsKey($_) } | ForEach-Object { $PageData[$_].text }) -join ' ')
$AllLinks = @($ActivePages | Where-Object { $PageData.ContainsKey($_) } | ForEach-Object { $PageData[$_].links })

$HomeText = if ($PageData.ContainsKey('index.html')) { $PageData['index.html'].text } else { '' }
if ($HomeText -match '(?i)\b(Service Desk|IT Support)\b') {
  Add-ReviewResult -Category 'Homepage positioning' -Check 'Support experience visible' -Status 'PASS' -Page 'index.html' -Message 'Service Desk or IT Support positioning is visible on the homepage.'
} else {
  Add-ReviewResult -Category 'Homepage positioning' -Check 'Support experience visible' -Status 'FAIL' -Page 'index.html' -Message 'Service Desk or IT Support positioning is not visible on the homepage.'
}

if ($HomeText -match '(?i)\b(Systems Administration|Infrastructure Operations)\b') {
  Add-ReviewResult -Category 'Homepage positioning' -Check 'Infrastructure direction visible' -Status 'PASS' -Page 'index.html' -Message 'Systems Administration or Infrastructure Operations direction is visible on the homepage.'
} else {
  Add-ReviewResult -Category 'Homepage positioning' -Check 'Infrastructure direction visible' -Status 'FAIL' -Page 'index.html' -Message 'Systems Administration or Infrastructure Operations direction is not visible on the homepage.'
}

$PrimaryNavLinks = if ($PageData.ContainsKey('index.html')) { @(Get-PrimaryNavigationLinks -Html $PageData['index.html'].html) } else { @() }
$PrimaryNavMap = @{}
foreach ($Link in $PrimaryNavLinks) {
  $PrimaryNavMap[$Link.text.Trim().ToLowerInvariant()] = $Link.url
}

$RequiredNav = @(
  @{ label = 'Projects'; target = 'projects.html' },
  @{ label = 'Proof'; target = 'proof.html' },
  @{ label = 'Resume'; target = 'resume.html' },
  @{ label = 'Contact'; target = 'contact.html' },
  @{ label = 'Home Lab'; target = 'on-prem-home-lab.html' }
)

foreach ($Item in $RequiredNav) {
  $Key = $Item.label.ToLowerInvariant()
  $NavTarget = if ($PrimaryNavMap.ContainsKey($Key)) { Get-InternalPageName -Url $PrimaryNavMap[$Key] } else { $null }
  if ($NavTarget -eq $Item.target) {
    Add-ReviewResult -Category 'Navigation' -Check "$($Item.label) linked from primary navigation" -Status 'PASS' -Page 'index.html' -Target $Item.target -Message "$($Item.label) is linked from the homepage primary navigation."
  } else {
    Add-ReviewResult -Category 'Navigation' -Check "$($Item.label) linked from primary navigation" -Status 'FAIL' -Page 'index.html' -Target $Item.target -Message "$($Item.label) is missing or points to the wrong target in homepage primary navigation."
  }
}

$ResumeReachableFromNavigation = (($PrimaryNavLinks | Where-Object { (Get-InternalPageName -Url $_.url) -eq 'resume.html' }).Count -gt 0)
$ContactReachableFromNavigation = (($PrimaryNavLinks | Where-Object { (Get-InternalPageName -Url $_.url) -eq 'contact.html' }).Count -gt 0)

$HomeLabProofLinks = @($AllLinks | Where-Object {
  $_.url -match '(?i)(proof\.html#home-lab-proof|home-lab-operations-proof\.html|on-prem-home-lab\.html)'
})
if ($HomeLabProofLinks.Count -gt 0) {
  Add-ReviewResult -Category 'Homepage positioning' -Check 'Direct path to home-lab proof exists' -Status 'PASS' -Message "Found $($HomeLabProofLinks.Count) active home-lab proof path link(s)."
} else {
  Add-ReviewResult -Category 'Homepage positioning' -Check 'Direct path to home-lab proof exists' -Status 'FAIL' -Message 'No direct active path to home-lab proof was found.'
}

$DirectInfrastructureLinks = @($AllLinks | Where-Object {
  $Type = Get-EvidenceTargetType -Target $_.url
  $Type -eq 'direct-infrastructure-evidence'
})
$UniqueDirectInfrastructureTargets = @($DirectInfrastructureLinks | ForEach-Object {
  (Resolve-InternalTarget -SourcePage $_.page -Url $_.url).relativePath
} | Sort-Object -Unique)

if ($UniqueDirectInfrastructureTargets.Count -ge 8) {
  Add-ReviewResult -Category 'Evidence link quality' -Check 'Eight direct infrastructure evidence links exist' -Status 'PASS' -Message "Found $($UniqueDirectInfrastructureTargets.Count) unique direct infrastructure evidence targets."
} else {
  Add-ReviewResult -Category 'Evidence link quality' -Check 'Eight direct infrastructure evidence links exist' -Status 'FAIL' -Message "Found $($UniqueDirectInfrastructureTargets.Count) unique direct infrastructure evidence targets; expected at least 8."
}

$SkillsValidationLinks = @($AllLinks | Where-Object { (Get-EvidenceTargetType -Target $_.url) -eq 'skills-validation' })
$UniqueSkillsValidationTargets = @($SkillsValidationLinks | ForEach-Object {
  (Resolve-InternalTarget -SourcePage $_.page -Url $_.url).relativePath
} | Sort-Object -Unique)
if ($UniqueSkillsValidationTargets.Count -ge 3) {
  Add-ReviewResult -Category 'Evidence link quality' -Check 'Three skills-validation links exist' -Status 'PASS' -Message "Found $($UniqueSkillsValidationTargets.Count) unique skills-validation targets."
} else {
  Add-ReviewResult -Category 'Evidence link quality' -Check 'Three skills-validation links exist' -Status 'FAIL' -Message "Found $($UniqueSkillsValidationTargets.Count) unique skills-validation targets; expected at least 3."
}

$EvidenceTerms = @(
  'Proxmox',
  'DC01',
  'WS01',
  'Linux01',
  'SSSD',
  'backup',
  'restore',
  'PowerShell validation'
)
foreach ($Term in $EvidenceTerms) {
  if ($AllText -match [regex]::Escape($Term)) {
    Add-ReviewResult -Category 'Evidence discoverability' -Check "$Term visible" -Status 'PASS' -Message "$Term is discoverable on active pages."
  } else {
    Add-ReviewResult -Category 'Evidence discoverability' -Check "$Term visible" -Status 'FAIL' -Message "$Term is not discoverable on active pages."
  }
}

$LinkLabelFailures = @()
foreach ($Link in $AllLinks) {
  $Type = Get-EvidenceTargetType -Target $Link.url
  $Text = $Link.text.Trim()
  if ($Type -in @('summary', 'manifest-or-index', 'screenshot') -and $Text -match '(?i)\bfull evidence\b') {
    $LinkLabelFailures += "$($Link.page): '$Text' -> $($Link.url)"
  }
  if ($Type -ne 'direct-infrastructure-evidence' -and $Text -match '(?i)\bdirect\b' -and $Link.url -match '(?i)(manifest|claim-map|source-summaries|summary|screenshot)') {
    $LinkLabelFailures += "$($Link.page): direct wording used for non-direct target '$Text' -> $($Link.url)"
  }
}

if ($LinkLabelFailures.Count -eq 0) {
  Add-ReviewResult -Category 'Evidence link quality' -Check 'Evidence labels match target strength' -Status 'PASS' -Message 'No direct/full-evidence label conflicts were found on summary, manifest, screenshot, or claim-map links.'
} else {
  foreach ($Failure in $LinkLabelFailures) {
    Add-ReviewResult -Category 'Evidence link quality' -Check 'Evidence labels match target strength' -Status 'FAIL' -Message $Failure
  }
}

$VagueLinks = @($AllLinks | Where-Object { $_.text.Trim() -match '^(?i)(learn more|read more|click here|more info|more)$' })
if ($VagueLinks.Count -gt 0) {
  foreach ($Link in $VagueLinks) {
    Add-ReviewResult -Category 'Evidence link quality' -Check 'Vague link label' -Status 'WARNING' -Page $Link.page -Target $Link.url -Message "Vague link label found: '$($Link.text)'." -Critical $false
  }
} else {
  Add-ReviewResult -Category 'Evidence link quality' -Check 'No vague link labels' -Status 'PASS' -Message 'No vague labels such as Learn more, Read more, or Click here were found.'
}

foreach ($Page in $ActivePages | Where-Object { $PageData.ContainsKey($_) }) {
  $DuplicateIds = @($PageData[$Page].ids | Group-Object | Where-Object { $_.Count -gt 1 })
  if ($DuplicateIds.Count -eq 0) {
    Add-ReviewResult -Category 'Page integrity' -Check 'No duplicate HTML IDs' -Status 'PASS' -Page $Page -Message 'No duplicate HTML IDs were found.'
  } else {
    foreach ($Duplicate in $DuplicateIds) {
      Add-ReviewResult -Category 'Page integrity' -Check 'No duplicate HTML IDs' -Status 'FAIL' -Page $Page -Message "Duplicate HTML ID '$($Duplicate.Name)' appears $($Duplicate.Count) times."
    }
  }
}

$InternalLinkFailures = @()
foreach ($Link in $AllLinks) {
  if (Test-ExternalUrl -Url $Link.url) {
    continue
  }
  $Target = Resolve-InternalTarget -SourcePage $Link.page -Url $Link.url
  if (-not (Test-Path -Path $Target.fullPath)) {
    $InternalLinkFailures += "$($Link.page): $($Link.url) missing target path $($Target.relativePath)"
    continue
  }

  if (-not [string]::IsNullOrWhiteSpace($Target.fragment) -and $Target.relativePath.EndsWith('.html')) {
    $TargetPage = if ($Target.relativePath -eq '/') { 'index.html' } else { $Target.relativePath }
    if ($PageData.ContainsKey($TargetPage)) {
      if ($PageData[$TargetPage].ids -notcontains $Target.fragment) {
        $InternalLinkFailures += "$($Link.page): $($Link.url) missing anchor #$($Target.fragment)"
      }
    } else {
      $TargetHtml = Get-Content -Path $Target.fullPath -Raw
      if ((Get-PageIds -Html $TargetHtml) -notcontains $Target.fragment) {
        $InternalLinkFailures += "$($Link.page): $($Link.url) missing anchor #$($Target.fragment)"
      }
    }
  }
}

if ($InternalLinkFailures.Count -eq 0) {
  Add-ReviewResult -Category 'Page integrity' -Check 'All local internal link targets exist' -Status 'PASS' -Message 'Every local href/src target referenced by active pages exists, including checked HTML anchors.'
} else {
  foreach ($Failure in $InternalLinkFailures) {
    Add-ReviewResult -Category 'Page integrity' -Check 'All local internal link targets exist' -Status 'FAIL' -Message $Failure
  }
}

$Graph = @{}
foreach ($Page in $ActivePages | Where-Object { $PageData.ContainsKey($_) }) {
  $Graph[$Page] = @($PageData[$Page].links | ForEach-Object { Get-InternalPageName -Url $_.url } | Where-Object { $_ -and ($ActivePages -contains $_) } | Sort-Object -Unique)
}

$ReachablePages = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$Queue = [System.Collections.Generic.Queue[object]]::new()
$ReachablePages.Add('index.html') | Out-Null
$Queue.Enqueue([pscustomobject]@{ page = 'index.html'; depth = 0 })
while ($Queue.Count -gt 0) {
  $Current = $Queue.Dequeue()
  if ($Current.depth -ge 2 -or -not $Graph.ContainsKey($Current.page)) {
    continue
  }
  foreach ($Next in $Graph[$Current.page]) {
    if ($ReachablePages.Add($Next)) {
      $Queue.Enqueue([pscustomobject]@{ page = $Next; depth = ($Current.depth + 1) })
    }
  }
}

$ProofPages = @('proof.html', 'home-lab-operations-proof.html')
foreach ($ProofPage in $ProofPages) {
  if ($ReachablePages.Contains($ProofPage)) {
    Add-ReviewResult -Category 'Navigation' -Check 'Active proof page is not orphaned' -Status 'PASS' -Page $ProofPage -Message "$ProofPage is reachable from the homepage within active-page navigation."
  } else {
    Add-ReviewResult -Category 'Navigation' -Check 'Active proof page is not orphaned' -Status 'FAIL' -Page $ProofPage -Message "$ProofPage is not reachable from the homepage active-page graph."
  }
}

$TwoClickDirectInfrastructureTargets = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$TwoClickPowerShellTargets = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
foreach ($ReachablePage in $ReachablePages) {
  if (-not $PageData.ContainsKey($ReachablePage)) {
    continue
  }
  foreach ($Link in $PageData[$ReachablePage].links) {
    $Type = Get-EvidenceTargetType -Target $Link.url
    $Target = Resolve-InternalTarget -SourcePage $ReachablePage -Url $Link.url
    if ($Type -eq 'direct-infrastructure-evidence') {
      $TwoClickDirectInfrastructureTargets.Add($Target.relativePath) | Out-Null
    }
    if ($Type -eq 'skills-validation') {
      $TwoClickPowerShellTargets.Add($Target.relativePath) | Out-Null
    }
  }
}

$DirectInfrastructureEvidenceWithinTwoClicks = $TwoClickDirectInfrastructureTargets.Count
$PowerShellValidationEvidenceWithinTwoClicks = ($TwoClickPowerShellTargets.Count -gt 0)

if ($DirectInfrastructureEvidenceWithinTwoClicks -gt 0) {
  Add-ReviewResult -Category 'Homepage positioning' -Check 'Infrastructure proof within two internal clicks' -Status 'PASS' -Message "Found $DirectInfrastructureEvidenceWithinTwoClicks direct infrastructure evidence target(s) reachable within two internal clicks."
} else {
  Add-ReviewResult -Category 'Homepage positioning' -Check 'Infrastructure proof within two internal clicks' -Status 'FAIL' -Message 'No direct infrastructure evidence target is reachable within two internal clicks.'
}

if ($PowerShellValidationEvidenceWithinTwoClicks) {
  Add-ReviewResult -Category 'Homepage positioning' -Check 'PowerShell validation within two internal clicks' -Status 'PASS' -Message "Found $($TwoClickPowerShellTargets.Count) PowerShell validation target(s) reachable within two internal clicks."
} else {
  Add-ReviewResult -Category 'Homepage positioning' -Check 'PowerShell validation within two internal clicks' -Status 'FAIL' -Message 'No PowerShell validation evidence target is reachable within two internal clicks.'
}

$ForbiddenPatterns = @(
  @{ name = 'drift validation passed with no drift'; pattern = '(?i)\bdrift validation passed with no drift\b' },
  @{ name = 'all drift checks passed'; pattern = '(?i)\ball drift checks passed\b' },
  @{ name = 'all drift validation passed'; pattern = '(?i)\ball drift validation passed\b' },
  @{ name = 'full disaster recovery'; pattern = '(?i)\bfull disaster recovery\b' },
  @{ name = 'guaranteed RTO'; pattern = '(?i)\bguaranteed\s+RTO\b' },
  @{ name = 'guaranteed RPO'; pattern = '(?i)\bguaranteed\s+RPO\b' },
  @{ name = 'production administration'; pattern = '(?i)\bproduction administration\b' },
  @{ name = 'employer administration'; pattern = '(?i)\bemployer administration\b' }
)

$ForbiddenFindings = @()
foreach ($Forbidden in $ForbiddenPatterns) {
  foreach ($Sentence in (Get-ContainingSentences -Text $AllText -Pattern $Forbidden.pattern)) {
    if (-not (Test-NegatedSentence -Sentence $Sentence)) {
      $ForbiddenFindings += "$($Forbidden.name): $Sentence"
    }
  }
}

if ($ForbiddenFindings.Count -eq 0) {
  Add-ReviewResult -Category 'Claim boundaries' -Check 'No prohibited claim wording' -Status 'PASS' -Message 'No unsupported drift, disaster recovery, RTO/RPO, production, or employer-administration claim wording was found.'
} else {
  foreach ($Finding in $ForbiddenFindings) {
    Add-ReviewResult -Category 'Claim boundaries' -Check 'No prohibited claim wording' -Status 'FAIL' -Message $Finding
  }
}

$LimitationChecks = @(
  @{ name = 'Personal or nonproduction home-lab scope visible'; pattern = '(?i)\b(personal\b.{0,80}\bnonproduction|nonproduction\b.{0,80}\bhome lab|personal\b.{0,80}\bhome lab)\b' },
  @{ name = 'One isolated restore drill bounded'; pattern = '(?i)\bone isolated Linux01 restore drill\b.{0,220}\b(does not claim|does not establish|not recurring|RTO|RPO|recurring restore assurance)\b' },
  @{ name = 'No recurring restore assurance claimed'; pattern = '(?i)\b(no recurring restore assurance|does not establish recurring disaster-recovery assurance|does not claim .{0,80}recurring restore assurance)\b' },
  @{ name = 'RTO/RPO limitations visible'; pattern = '(?i)\b(no RTO/RPO|does not claim RTO, RPO|does not establish .{0,80}RTO, RPO|RTO/RPO.{0,80}excluded)\b' },
  @{ name = 'Timeout handling is not service availability proof'; pattern = '(?i)\bTimeout-handling validation does not prove service availability\b' },
  @{ name = 'SSSD validation remains Linux01-specific'; pattern = '(?i)\b(Linux01-only SSSD|Linux01-specific SSSD)\b' }
)

foreach ($Check in $LimitationChecks) {
  if ($AllText -match $Check.pattern) {
    Add-ReviewResult -Category 'Visible limitations' -Check $Check.name -Status 'PASS' -Message "$($Check.name) is visible on active pages."
  } else {
    Add-ReviewResult -Category 'Visible limitations' -Check $Check.name -Status 'FAIL' -Message "$($Check.name) is not visible on active pages."
  }
}

$TotalChecks = $Results.Count
$Passed = @($Results | Where-Object { $_.status -eq 'PASS' }).Count
$Warnings = @($Results | Where-Object { $_.status -eq 'WARNING' }).Count
$Failed = @($Results | Where-Object { $_.status -eq 'FAIL' }).Count
$CriticalFailures = @($Results | Where-Object { $_.status -eq 'FAIL' -and $_.critical }).Count
$OverallStatus = if ($CriticalFailures -gt 0) { 'FAIL' } elseif ($Warnings -gt 0) { 'PASS_WITH_WARNINGS' } else { 'PASS' }

$RepositoryCommit = (& git -C $RepoRoot rev-parse HEAD).Trim()
$Summary = [pscustomobject][ordered]@{
  reviewTimestampUtc = (Get-Date).ToUniversalTime().ToString('o')
  repositoryCommit = $RepositoryCommit
  totalChecks = $TotalChecks
  passed = $Passed
  warnings = $Warnings
  failed = $Failed
  criticalFailures = $CriticalFailures
  directInfrastructureEvidenceWithinTwoClicks = $DirectInfrastructureEvidenceWithinTwoClicks
  powerShellValidationEvidenceWithinTwoClicks = $PowerShellValidationEvidenceWithinTwoClicks
  resumeReachableFromNavigation = $ResumeReachableFromNavigation
  contactReachableFromNavigation = $ContactReachableFromNavigation
  overallStatus = $OverallStatus
  results = @($Results)
}

$JsonPath = Join-Path -Path $ReportRoot -ChildPath 'hiring-manager-review.json'
$CsvPath = Join-Path -Path $ReportRoot -ChildPath 'hiring-manager-review.csv'
$MarkdownPath = Join-Path -Path $ReportRoot -ChildPath 'hiring-manager-review.md'

$Summary | ConvertTo-Json -Depth 8 | Set-Content -Path $JsonPath -Encoding UTF8
$Results | ConvertTo-Csv -NoTypeInformation | Set-Content -Path $CsvPath -Encoding UTF8

$Markdown = [System.Collections.Generic.List[string]]::new()
$Markdown.Add('# Hiring Manager Portfolio Discoverability Review')
$Markdown.Add('')
$Markdown.Add("- Generated UTC: $($Summary.reviewTimestampUtc)")
$Markdown.Add("- Repository commit: $RepositoryCommit")
$Markdown.Add("- Overall status: $OverallStatus")
$Markdown.Add("- Total checks: $TotalChecks")
$Markdown.Add("- Passed: $Passed")
$Markdown.Add("- Warnings: $Warnings")
$Markdown.Add("- Failed: $Failed")
$Markdown.Add("- Critical failures: $CriticalFailures")
$Markdown.Add("- Direct infrastructure evidence within two clicks: $DirectInfrastructureEvidenceWithinTwoClicks")
$Markdown.Add("- PowerShell validation evidence within two clicks: $PowerShellValidationEvidenceWithinTwoClicks")
$Markdown.Add("- Resume reachable from navigation: $ResumeReachableFromNavigation")
$Markdown.Add("- Contact reachable from navigation: $ContactReachableFromNavigation")
$Markdown.Add('')
$Markdown.Add('| Status | Category | Check | Page | Target | Message |')
$Markdown.Add('|---|---|---|---|---|---|')
foreach ($Result in $Results) {
  $Message = ($Result.message -replace '\|', '\|')
  $Markdown.Add("| $($Result.status) | $($Result.category) | $($Result.check) | $($Result.page) | $($Result.target) | $Message |")
}
$Markdown | Set-Content -Path $MarkdownPath -Encoding UTF8

Write-Host ''
Write-Host 'Hiring Manager Portfolio Discoverability Review'
Write-Host ''
Write-Host ('{0,-7} | {1,-25} | {2,-48} | {3}' -f 'Status', 'Category', 'Check', 'Detail')
Write-Host ('{0,-7}-+-{1,-25}-+-{2,-48}-+-{3}' -f ('-' * 7), ('-' * 25), ('-' * 48), ('-' * 40))
foreach ($Result in $Results) {
  $DetailParts = @()
  if (-not [string]::IsNullOrWhiteSpace($Result.page)) {
    $DetailParts += "page=$($Result.page)"
  }
  if (-not [string]::IsNullOrWhiteSpace($Result.target)) {
    $DetailParts += "target=$($Result.target)"
  }
  $DetailParts += $Result.message
  Write-Host ('{0,-7} | {1,-25} | {2,-48} | {3}' -f $Result.status, $Result.category, $Result.check, ($DetailParts -join '; '))
}

Write-Host ''
Write-Host "Overall status: $OverallStatus"
Write-Host "Totals: $Passed PASS, $Warnings WARNING, $Failed FAIL, $CriticalFailures critical failure(s)"
Write-Host ''
Write-Host 'Report paths:'
Write-Host "  JSON: $JsonPath"
Write-Host "  CSV:  $CsvPath"
Write-Host "  MD:   $MarkdownPath"

if ($CriticalFailures -gt 0) {
  exit 1
}

exit 0
