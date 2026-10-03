<#
.SYNOPSIS
    Reports Microsoft Intune managed devices using Microsoft Graph.
#>

$ErrorActionPreference = "Stop"
$ProjectRoot=Split-Path $PSScriptRoot -Parent
$ReportsPath=Join-Path $ProjectRoot "reports"
if(-not(Test-Path $ReportsPath)){New-Item -ItemType Directory -Path $ReportsPath -Force|Out-Null}

Import-Module Microsoft.Graph.Authentication -ErrorAction Stop
$RequiredScopes=@("DeviceManagementManagedDevices.Read.All")

$Context=Get-MgContext
$ReconnectRequired=$false
if(-not $Context){$ReconnectRequired=$true}
else{
    $MissingScopes=@($RequiredScopes | Where-Object {$_ -notin @($Context.Scopes)})
    if($MissingScopes.Count -gt 0){$ReconnectRequired=$true}
}

if($ReconnectRequired){
    if($Context){try{Disconnect-MgGraph|Out-Null}catch{}}
    Connect-MgGraph -Scopes $RequiredScopes -UseDeviceCode -NoWelcome
    $Context=Get-MgContext
}
if(-not $Context){throw "Microsoft Graph authentication could not be established."}

$MissingScopes=@($RequiredScopes | Where-Object {$_ -notin @($Context.Scopes)})
if($MissingScopes.Count -gt 0){throw "Required scopes are still missing: $($MissingScopes -join ', ')"}

function Get-GraphCollection {
    param([Parameter(Mandatory=$true)][string]$Uri)
    $Results=@();$NextUri=$Uri
    while($NextUri){
        $Response=Invoke-MgGraphRequest -Method GET -Uri $NextUri
        if($Response["value"]){$Results+=@($Response["value"])}
        $NextUri=$Response["@odata.nextLink"]
    }
    return $Results
}

$GraphDevices=@(Get-GraphCollection -Uri "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?`$top=999")

$Devices=@(
    foreach($Device in $GraphDevices){
        [PSCustomObject]@{
            DeviceName=$Device["deviceName"];ManagedDeviceId=$Device["id"];AzureAdDeviceId=$Device["azureADDeviceId"]
            UserPrincipalName=$Device["userPrincipalName"];OperatingSystem=$Device["operatingSystem"]
            OSVersion=$Device["osVersion"];Manufacturer=$Device["manufacturer"];Model=$Device["model"]
            SerialNumber=$Device["serialNumber"];ComplianceState=$Device["complianceState"]
            ManagementAgent=$Device["managementAgent"];EnrollmentType=$Device["deviceEnrollmentType"]
            LastSyncDateTime=$Device["lastSyncDateTime"];EnrolledDateTime=$Device["enrolledDateTime"]
            IsEncrypted=$Device["isEncrypted"];DeviceRegistrationState=$Device["deviceRegistrationState"]
            ManagedDeviceOwnerType=$Device["managedDeviceOwnerType"]
        }
    }
)

$ReportPath=Join-Path $ReportsPath "Intune-Managed-Device-Inventory.csv"
$Devices|Sort-Object DeviceName|Export-Csv -Path $ReportPath -NoTypeInformation -Encoding UTF8

Write-Host "Total Managed Devices: $($Devices.Count)"
Write-Host "Compliant:             $(@($Devices|Where-Object ComplianceState -eq 'compliant').Count)"
Write-Host "Noncompliant:          $(@($Devices|Where-Object ComplianceState -eq 'noncompliant').Count)"
Write-Host "Encrypted:             $(@($Devices|Where-Object IsEncrypted -eq $true).Count)"
Write-Host "Report exported to: $ReportPath" -ForegroundColor Green
