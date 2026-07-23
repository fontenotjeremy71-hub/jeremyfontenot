Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Generating repository health dashboard..."

$OutputPath = ".\artifacts\dashboard\repository-health.md"
$GeneratedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss UTC")

$ValidationScripts = Get-ChildItem .\scripts\validation -Filter "*.ps1" -File | Sort-Object Name
$LighthouseReports = Get-ChildItem .\artifacts\lighthouse -Filter "*.json" -File -ErrorAction SilentlyContinue
$EvidenceIndex = ".\evidence-library\evidence-search-index.json"
$HashInventory = ".\evidence-library\integrity\evidence-hashes.json"

$EvidenceCount = 0
if (Test-Path $EvidenceIndex) {
  $EvidenceCount = (Get-Content $EvidenceIndex -Raw | ConvertFrom-Json).Count
}

$HashCount = 0
if (Test-Path $HashInventory) {
  $HashCount = (Get-Content $HashInventory -Raw | ConvertFrom-Json).Count
}

$Lines = @()
$Lines += "# Repository Health Dashboard"
$Lines += ""
$Lines += "Generated: $GeneratedAt"
$Lines += ""
$Lines += "## Governance Coverage"
$Lines += ""
$Lines += "| Area | Count |"
$Lines += "|---|---:|"
$Lines += "| Validation scripts | $($ValidationScripts.Count) |"
$Lines += "| Lighthouse reports | $($LighthouseReports.Count) |"
$Lines += "| Evidence index entries | $EvidenceCount |"
$Lines += "| Evidence hash entries | $HashCount |"
$Lines += ""
$Lines += "## Validation Scripts"
$Lines += ""
foreach ($Script in $ValidationScripts) {
  $Lines += "- $($Script.Name)"
}
$Lines += ""
$Lines += "## Lighthouse Reports"
$Lines += ""
foreach ($Report in $LighthouseReports) {
  $Json = Get-Content $Report.FullName -Raw | ConvertFrom-Json
  $Perf = $Json.categories.performance.score
  $A11y = $Json.categories.accessibility.score
  $Best = $Json.categories."best-practices".score
  $Seo = $Json.categories.seo.score
  $Lines += "- $($Report.Name): performance=$Perf accessibility=$A11y best-practices=$Best seo=$Seo"
}
$Lines += ""
$Lines += "## Status"
$Lines += ""
$Lines += "Repository validation governance is active through GitHub Actions."

$OutputBytes = ($Lines -join "`n") + "`n"
[IO.File]::WriteAllText([IO.Path]::GetFullPath($OutputPath), $OutputBytes, [Text.UTF8Encoding]::new($false))

Write-Host "Dashboard generated: $OutputPath" -ForegroundColor Green
