<#
.SYNOPSIS
    Reports potentially stale Microsoft Entra user accounts.
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$ReportsPath = Join-Path $ProjectRoot "reports"
if (-not (Test-Path $ReportsPath)) { New-Item -ItemType Directory -Path $ReportsPath -Force | Out-Null }

Import-Module Microsoft.Graph.Authentication -ErrorAction Stop
$RequiredScopes = @("User.Read.All","AuditLog.Read.All")

$Context=Get-MgContext
$ReconnectRequired=$false
if(-not $Context){$ReconnectRequired=$true}
else{
    $CurrentScopes=@($Context.Scopes)
    $MissingScopes=@($RequiredScopes | Where-Object {$_ -notin $CurrentScopes})
    if($MissingScopes.Count -gt 0){$ReconnectRequired=$true}
}

if($ReconnectRequired){
    if($Context){ try{Disconnect-MgGraph | Out-Null}catch{} }
    Connect-MgGraph -Scopes $RequiredScopes -UseDeviceCode -NoWelcome
    $Context=Get-MgContext
}
if(-not $Context){throw "Microsoft Graph authentication could not be established."}

$MissingScopes=@($RequiredScopes | Where-Object {$_ -notin @($Context.Scopes)})
if($MissingScopes.Count -gt 0){throw "Required scopes are missing: $($MissingScopes -join ', ')"}

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

$UserUri="https://graph.microsoft.com/v1.0/users?`$select=id,displayName,userPrincipalName,accountEnabled,userType,createdDateTime,onPremisesSyncEnabled,signInActivity&`$top=999"
$Users=@(Get-GraphCollection -Uri $UserUri)

$Now=Get-Date
$StaleThresholdDays=90

$AccountInventory=@(
    foreach($User in $Users){
        $CreatedDate=$null;$LastSignIn=$null;$DaysSinceLastSignIn=$null;$AccountAgeDays=$null

        if($User["createdDateTime"]){
            $CreatedDate=[datetime]$User["createdDateTime"]
            $AccountAgeDays=[int](New-TimeSpan -Start $CreatedDate -End $Now).TotalDays
        }

        if($User["signInActivity"] -and $User["signInActivity"]["lastSignInDateTime"]){
            $LastSignIn=[datetime]$User["signInActivity"]["lastSignInDateTime"]
            $DaysSinceLastSignIn=[int](New-TimeSpan -Start $LastSignIn -End $Now).TotalDays
        }

        $StaleReason=@()
        if($User["accountEnabled"] -eq $false){$StaleReason+="Account disabled"}
        if($null -ne $DaysSinceLastSignIn -and $DaysSinceLastSignIn -ge $StaleThresholdDays){
            $StaleReason+="No sign-in for $DaysSinceLastSignIn days"
        }
        if($null -eq $LastSignIn -and $null -ne $AccountAgeDays -and $AccountAgeDays -ge $StaleThresholdDays){
            $StaleReason+="No recorded sign-in and account older than $StaleThresholdDays days"
        }

        [PSCustomObject]@{
            DisplayName=$User["displayName"];UserPrincipalName=$User["userPrincipalName"]
            AccountEnabled=$User["accountEnabled"];UserType=$User["userType"]
            CreatedDateTime=$CreatedDate;AccountAgeDays=$AccountAgeDays
            LastSignInDateTime=$LastSignIn;DaysSinceLastSignIn=$DaysSinceLastSignIn
            OnPremisesSyncEnabled=$User["onPremisesSyncEnabled"]
            PotentiallyStale=($StaleReason.Count -gt 0);StaleReason=($StaleReason -join "; ")
            UserId=$User["id"]
        }
    }
)

$ReportPath=Join-Path $ReportsPath "Entra-Stale-Accounts.csv"
$AccountInventory | Sort-Object DisplayName | Export-Csv -Path $ReportPath -NoTypeInformation -Encoding UTF8

Write-Host "Total Users:            $($AccountInventory.Count)"
Write-Host "Potentially Stale:      $(@($AccountInventory | Where-Object PotentiallyStale -eq $true).Count)"
Write-Host "Disabled Accounts:      $(@($AccountInventory | Where-Object AccountEnabled -eq $false).Count)"
Write-Host "No Recorded Sign-In:    $(@($AccountInventory | Where-Object {$null -eq $_.LastSignInDateTime}).Count)"
Write-Host "Stale Threshold (Days): $StaleThresholdDays"
Write-Host "Report exported to: $ReportPath" -ForegroundColor Green
