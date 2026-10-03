<#
.SYNOPSIS
    Reports Microsoft 365 license capacity and user license assignments.
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$ReportsPath = Join-Path $ProjectRoot "reports"
if (-not (Test-Path $ReportsPath)) { New-Item -ItemType Directory -Path $ReportsPath -Force | Out-Null }

Import-Module Microsoft.Graph.Authentication -ErrorAction Stop

$RequiredScopes = @("User.Read.All","Organization.Read.All")
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

$SkuResponse = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/v1.0/subscribedSkus"
$Skus = @($SkuResponse["value"])
$SkuLookup = @{}

$LicenseCapacity = @(
    foreach($Sku in $Skus){
        $SkuId=$Sku["skuId"].ToString()
        $SkuLookup[$SkuId]=$Sku["skuPartNumber"]
        [PSCustomObject]@{
            SkuPartNumber=$Sku["skuPartNumber"]; SkuId=$SkuId
            Enabled=[int]$Sku["prepaidUnits"]["enabled"]; Consumed=[int]$Sku["consumedUnits"]
            Available=([int]$Sku["prepaidUnits"]["enabled"]-[int]$Sku["consumedUnits"])
        }
    }
)

$Users = @(Get-GraphCollection -Uri "https://graph.microsoft.com/v1.0/users?`$select=id,displayName,userPrincipalName,accountEnabled,userType,onPremisesSyncEnabled,assignedLicenses&`$top=999")

$LicenseAssignments = @()
foreach($User in $Users){
    $AssignedLicenses=@($User["assignedLicenses"])
    if($AssignedLicenses.Count -eq 0){
        $LicenseAssignments += [PSCustomObject]@{
            DisplayName=$User["displayName"]; UserPrincipalName=$User["userPrincipalName"]
            AccountEnabled=$User["accountEnabled"]; UserType=$User["userType"]
            OnPremisesSyncEnabled=$User["onPremisesSyncEnabled"]; Licensed=$false
            SkuPartNumber=""; SkuId=""; UserId=$User["id"]
        }
        continue
    }
    foreach($AssignedLicense in $AssignedLicenses){
        $SkuId=$AssignedLicense["skuId"].ToString()
        $LicenseAssignments += [PSCustomObject]@{
            DisplayName=$User["displayName"]; UserPrincipalName=$User["userPrincipalName"]
            AccountEnabled=$User["accountEnabled"]; UserType=$User["userType"]
            OnPremisesSyncEnabled=$User["onPremisesSyncEnabled"]; Licensed=$true
            SkuPartNumber=$(if($SkuLookup.ContainsKey($SkuId)){$SkuLookup[$SkuId]}else{"Unknown"})
            SkuId=$SkuId; UserId=$User["id"]
        }
    }
}

$LicenseCapacity | Export-Csv (Join-Path $ReportsPath "M365-License-Capacity.csv") -NoTypeInformation -Encoding UTF8
$LicenseAssignments | Sort-Object DisplayName,SkuPartNumber | Export-Csv (Join-Path $ReportsPath "M365-License-Assignments.csv") -NoTypeInformation -Encoding UTF8

Write-Host "Subscribed SKUs:  $($LicenseCapacity.Count)"
Write-Host "Total Users:      $($Users.Count)"
Write-Host "Licensed Users:   $(@($Users | Where-Object { @($_["assignedLicenses"]).Count -gt 0 }).Count)"
Write-Host "Unlicensed Users: $(@($Users | Where-Object { @($_["assignedLicenses"]).Count -eq 0 }).Count)"
