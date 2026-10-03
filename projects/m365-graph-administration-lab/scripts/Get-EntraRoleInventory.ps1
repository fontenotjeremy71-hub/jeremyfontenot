<#
.SYNOPSIS
    Reports activated Microsoft Entra directory roles and their members.
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$ReportsPath = Join-Path $ProjectRoot "reports"
if (-not (Test-Path $ReportsPath)) { New-Item -ItemType Directory -Path $ReportsPath -Force | Out-Null }

Import-Module Microsoft.Graph.Authentication -ErrorAction Stop
$RequiredScopes = @("Directory.Read.All","User.Read.All")
$Context = Get-MgContext
if (-not $Context) {
    Connect-MgGraph -Scopes $RequiredScopes -UseDeviceCode -NoWelcome
    $Context = Get-MgContext
}
if (-not $Context) { throw "Microsoft Graph authentication could not be established." }

function Get-GraphCollection {
    param([Parameter(Mandatory=$true)][string]$Uri)
    $Results=@(); $NextUri=$Uri
    while($NextUri){
        $Response=Invoke-MgGraphRequest -Method GET -Uri $NextUri
        if($Response["value"]){$Results+=@($Response["value"])}
        $NextUri=$Response["@odata.nextLink"]
    }
    return $Results
}

$Roles = @(Get-GraphCollection -Uri "https://graph.microsoft.com/v1.0/directoryRoles?`$select=id,displayName,description,roleTemplateId")
$RoleInventory=@()
$FailedRoleQueries=@()

foreach($Role in $Roles){
    $RoleId=$Role["id"]
    try{
        # The directoryRoles/{id}/members endpoint was validated without $top.
        $Members=@(Get-GraphCollection -Uri "https://graph.microsoft.com/v1.0/directoryRoles/$RoleId/members")

        if($Members.Count -eq 0){
            $RoleInventory += [PSCustomObject]@{
                RoleDisplayName=$Role["displayName"]; RoleDescription=$Role["description"]
                RoleTemplateId=$Role["roleTemplateId"]; RoleId=$RoleId
                MemberDisplayName=""; MemberUPN=""; MemberMail=""; MemberType=""; MemberId=""
            }
            continue
        }

        foreach($Member in $Members){
            $RoleInventory += [PSCustomObject]@{
                RoleDisplayName=$Role["displayName"]; RoleDescription=$Role["description"]
                RoleTemplateId=$Role["roleTemplateId"]; RoleId=$RoleId
                MemberDisplayName=$Member["displayName"]; MemberUPN=$Member["userPrincipalName"]
                MemberMail=$Member["mail"]; MemberType=$Member["@odata.type"]; MemberId=$Member["id"]
            }
        }
    } catch {
        $FailedRoleQueries += [PSCustomObject]@{RoleDisplayName=$Role["displayName"];RoleId=$RoleId;Error=$_.Exception.Message}
    }
}

if($FailedRoleQueries.Count -gt 0){ throw "$($FailedRoleQueries.Count) role member query or queries failed." }

$ReportPath=Join-Path $ReportsPath "Entra-Role-Inventory.csv"
$RoleInventory | Sort-Object RoleDisplayName,MemberDisplayName | Export-Csv -Path $ReportPath -NoTypeInformation -Encoding UTF8

Write-Host "Activated Roles:       $($Roles.Count)"
Write-Host "Roles With Members:    $(@($RoleInventory | Where-Object MemberId -ne '' | Select-Object -ExpandProperty RoleId -Unique).Count)"
Write-Host "Roles Without Members: $(@($RoleInventory | Where-Object MemberId -eq '' | Select-Object -ExpandProperty RoleId -Unique).Count)"
Write-Host "Role Membership Rows:  $(@($RoleInventory | Where-Object MemberId -ne '').Count)"
Write-Host "Report exported to: $ReportPath" -ForegroundColor Green
