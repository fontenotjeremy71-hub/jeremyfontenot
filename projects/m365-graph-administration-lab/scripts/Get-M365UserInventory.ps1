<#
.SYNOPSIS
    Collects a detailed Microsoft 365 / Entra user inventory.
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
    $Results = @()
    $NextUri = $Uri
    while ($NextUri) {
        $Response = Invoke-MgGraphRequest -Method GET -Uri $NextUri
        if ($Response["value"]) { $Results += @($Response["value"]) }
        $NextUri = $Response["@odata.nextLink"]
    }
    return $Results
}

$SkuResponse = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/v1.0/subscribedSkus"
$SkuLookup = @{}
foreach ($Sku in @($SkuResponse["value"])) {
    $SkuLookup[$Sku["skuId"].ToString()] = $Sku["skuPartNumber"]
}

$UserUri = "https://graph.microsoft.com/v1.0/users?`$select=id,displayName,userPrincipalName,mail,accountEnabled,userType,createdDateTime,onPremisesSyncEnabled,usageLocation,assignedLicenses&`$top=999"
$GraphUsers = @(Get-GraphCollection -Uri $UserUri)

$Users = @(
    $GraphUsers | ForEach-Object {
        $AssignedSkuNames = @()
        foreach ($AssignedLicense in @($_["assignedLicenses"])) {
            $SkuId = $AssignedLicense["skuId"].ToString()
            if ($SkuLookup.ContainsKey($SkuId)) { $AssignedSkuNames += $SkuLookup[$SkuId] }
            else { $AssignedSkuNames += $SkuId }
        }

        [PSCustomObject]@{
            DisplayName           = $_["displayName"]
            UserPrincipalName     = $_["userPrincipalName"]
            Mail                  = $_["mail"]
            AccountEnabled        = $_["accountEnabled"]
            UserType              = $_["userType"]
            CreatedDateTime       = $_["createdDateTime"]
            OnPremisesSyncEnabled = $_["onPremisesSyncEnabled"]
            UsageLocation         = $_["usageLocation"]
            LicenseCount          = @($_["assignedLicenses"]).Count
            AssignedLicenses      = ($AssignedSkuNames -join "; ")
            UserId                = $_["id"]
        }
    }
)

$ReportPath = Join-Path $ReportsPath "M365-User-Inventory.csv"
$Users | Sort-Object DisplayName | Export-Csv -Path $ReportPath -NoTypeInformation -Encoding UTF8

Write-Host "Total Users:      $($Users.Count)"
Write-Host "Enabled Users:    $(@($Users | Where-Object AccountEnabled -eq $true).Count)"
Write-Host "Disabled Users:   $(@($Users | Where-Object AccountEnabled -eq $false).Count)"
Write-Host "Synced Users:     $(@($Users | Where-Object OnPremisesSyncEnabled -eq $true).Count)"
Write-Host "Licensed Users:   $(@($Users | Where-Object LicenseCount -gt 0).Count)"
Write-Host "Unlicensed Users: $(@($Users | Where-Object LicenseCount -eq 0).Count)"
Write-Host "Report exported to: $ReportPath" -ForegroundColor Green
