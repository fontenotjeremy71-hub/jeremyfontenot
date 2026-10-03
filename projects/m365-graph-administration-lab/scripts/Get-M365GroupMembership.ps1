<#
.SYNOPSIS
    Collects Microsoft 365 and Entra group membership information.
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$ReportsPath = Join-Path $ProjectRoot "reports"
if (-not (Test-Path $ReportsPath)) { New-Item -ItemType Directory -Path $ReportsPath -Force | Out-Null }

Import-Module Microsoft.Graph.Authentication -ErrorAction Stop

$RequiredScopes = @("Group.Read.All","User.Read.All","Directory.Read.All")
$Context = Get-MgContext
if (-not $Context) {
    Connect-MgGraph -Scopes $RequiredScopes -UseDeviceCode -NoWelcome
    $Context = Get-MgContext
}
if (-not $Context) { throw "Microsoft Graph authentication could not be established." }

function Get-GraphCollection {
    param([Parameter(Mandatory=$true)][string]$Uri)
    $Results = @(); $NextUri = $Uri
    while ($NextUri) {
        $Response = Invoke-MgGraphRequest -Method GET -Uri $NextUri
        if ($Response["value"]) { $Results += @($Response["value"]) }
        $NextUri = $Response["@odata.nextLink"]
    }
    return $Results
}

$Groups = @(Get-GraphCollection -Uri "https://graph.microsoft.com/v1.0/groups?`$select=id,displayName,mail,mailEnabled,securityEnabled,groupTypes&`$top=999")
$MembershipReport = @()

foreach ($Group in $Groups) {
    $GroupId = $Group["id"]
    $Members = @(Get-GraphCollection -Uri "https://graph.microsoft.com/v1.0/groups/$GroupId/members?`$select=id,displayName,userPrincipalName,mail&`$top=999")

    if ($Members.Count -eq 0) {
        $MembershipReport += [PSCustomObject]@{
            GroupDisplayName=$Group["displayName"]; GroupId=$GroupId; GroupMail=$Group["mail"]
            MailEnabled=$Group["mailEnabled"]; SecurityEnabled=$Group["securityEnabled"]
            GroupTypes=(@($Group["groupTypes"]) -join "; "); MemberDisplayName=""; MemberUPN=""
            MemberMail=""; MemberId=""; MemberType=""
        }
        continue
    }

    foreach ($Member in $Members) {
        $MembershipReport += [PSCustomObject]@{
            GroupDisplayName=$Group["displayName"]; GroupId=$GroupId; GroupMail=$Group["mail"]
            MailEnabled=$Group["mailEnabled"]; SecurityEnabled=$Group["securityEnabled"]
            GroupTypes=(@($Group["groupTypes"]) -join "; "); MemberDisplayName=$Member["displayName"]
            MemberUPN=$Member["userPrincipalName"]; MemberMail=$Member["mail"]; MemberId=$Member["id"]
            MemberType=$Member["@odata.type"]
        }
    }
}

$ReportPath = Join-Path $ReportsPath "M365-Group-Membership.csv"
$MembershipReport | Sort-Object GroupDisplayName,MemberDisplayName | Export-Csv -Path $ReportPath -NoTypeInformation -Encoding UTF8

Write-Host "Total Groups:           $($Groups.Count)"
Write-Host "Groups With Members:    $(@($MembershipReport | Where-Object MemberId -ne '' | Select-Object -ExpandProperty GroupId -Unique).Count)"
Write-Host "Groups Without Members: $(@($MembershipReport | Where-Object MemberId -eq '' | Select-Object -ExpandProperty GroupId -Unique).Count)"
Write-Host "Membership Rows:        $(@($MembershipReport | Where-Object MemberId -ne '').Count)"
Write-Host "Report exported to: $ReportPath" -ForegroundColor Green
