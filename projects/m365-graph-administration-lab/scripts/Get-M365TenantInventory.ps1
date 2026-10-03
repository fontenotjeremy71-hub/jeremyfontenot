<#
.SYNOPSIS
    Collects a read-only Microsoft 365 tenant inventory using Microsoft Graph.
#>

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$ReportsPath = Join-Path $ProjectRoot "reports"
if (-not (Test-Path $ReportsPath)) {
    New-Item -ItemType Directory -Path $ReportsPath -Force | Out-Null
}

Import-Module Microsoft.Graph.Authentication -ErrorAction Stop

$RequiredScopes = @(
    "Organization.Read.All"
    "User.Read.All"
    "Group.Read.All"
    "Directory.Read.All"
)

$Context = Get-MgContext
if (-not $Context) {
    Connect-MgGraph -Scopes $RequiredScopes -UseDeviceCode -NoWelcome
    $Context = Get-MgContext
}
if (-not $Context) { throw "Microsoft Graph authentication could not be established." }

$OrgResponse = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/v1.0/organization"
$Org = $OrgResponse["value"][0]

$OrganizationSummary = [PSCustomObject]@{
    DisplayName           = $Org["displayName"]
    TenantId              = $Org["id"]
    TenantType            = $Org["tenantType"]
    CountryCode           = $Org["countryLetterCode"]
    OnPremisesSyncEnabled = $Org["onPremisesSyncEnabled"]
    OnPremisesLastSync    = $Org["onPremisesLastSyncDateTime"]
}

$VerifiedDomains = @(
    $Org["verifiedDomains"] | ForEach-Object {
        [PSCustomObject]@{
            Name      = $_["name"]
            IsDefault = $_["isDefault"]
            IsInitial = $_["isInitial"]
        }
    }
)

$UserResponse = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/v1.0/users?`$select=displayName,userPrincipalName,accountEnabled,userType,onPremisesSyncEnabled&`$top=999"
$Users = @($UserResponse["value"])

$GroupResponse = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/v1.0/groups?`$select=displayName,mailEnabled,securityEnabled,groupTypes&`$top=999"
$Groups = @($GroupResponse["value"])

$SkuResponse = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/v1.0/subscribedSkus"
$SubscribedSkus = @($SkuResponse["value"])

$RoleResponse = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/v1.0/directoryRoles?`$select=id,displayName"
$DirectoryRoles = @($RoleResponse["value"])

$DeviceResponse = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/v1.0/devices?`$select=id,displayName,operatingSystem,operatingSystemVersion,accountEnabled,trustType,approximateLastSignInDateTime&`$top=999"
$Devices = @($DeviceResponse["value"])

$TenantSummary = [PSCustomObject]@{
    GeneratedDate     = Get-Date
    TenantDisplayName = $OrganizationSummary.DisplayName
    TenantId          = $OrganizationSummary.TenantId
    TenantType        = $OrganizationSummary.TenantType
    CountryCode       = $OrganizationSummary.CountryCode
    OnPremisesSync    = $OrganizationSummary.OnPremisesSyncEnabled
    VerifiedDomains   = $VerifiedDomains.Count
    Users             = $Users.Count
    Groups            = $Groups.Count
    SubscribedSkus    = $SubscribedSkus.Count
    DirectoryRoles    = $DirectoryRoles.Count
    EntraDevices      = $Devices.Count
}

$ReportPath = Join-Path $ReportsPath "M365-Tenant-Summary.csv"
$TenantSummary | Export-Csv -Path $ReportPath -NoTypeInformation -Encoding UTF8

$TenantSummary | Format-List
Write-Host "Report exported successfully: $ReportPath" -ForegroundColor Green
