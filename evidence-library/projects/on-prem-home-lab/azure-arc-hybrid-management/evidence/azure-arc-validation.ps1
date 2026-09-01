[CmdletBinding()]
param(
    [string[]]$ComputerName = @(
        'HVHOST01.ad.jeremyfontenot.online',
        'VMM01.ad.jeremyfontenot.online'
    )
)

$ErrorActionPreference = 'Stop'

foreach ($computer in $ComputerName) {
    Write-Output "=== $computer ==="

    try {
        Test-WSMan -ComputerName $computer -ErrorAction Stop | Out-Null
        Write-Output 'WinRM: reachable'

        Invoke-Command -ComputerName $computer -ScriptBlock {
            $agentPath = "$env:ProgramW6432\AzureConnectedMachineAgent\azcmagent.exe"
            if (Test-Path -LiteralPath $agentPath) {
                $agent = & $agentPath show --json | ConvertFrom-Json
                [pscustomobject]@{
                    ComputerName     = $env:COMPUTERNAME
                    ResourceName     = $agent.resourceName
                    ResourceGroup    = $agent.resourceGroup
                    Location         = $agent.location
                    AgentVersion     = $agent.agentVersion
                    AgentStatus      = $agent.status
                    LastHeartbeat    = $agent.lastHeartbeat
                    AgentAutoUpgrade = ($agent.agentAutoUpgradeTaskStatus -split ',')[0].Trim()
                }
            }

            Get-Service himds, ExtensionService, GCArcService, SqlServerExtension `
                -ErrorAction SilentlyContinue |
                Select-Object Name, Status, StartType

            Get-Service -Name 'MSSQL*', 'SQLAgent*' -ErrorAction SilentlyContinue |
                Select-Object Name, DisplayName, Status, StartType

            $instanceNames = Get-ItemProperty `
                'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL' `
                -ErrorAction SilentlyContinue

            if ($instanceNames.PSObject.Properties.Name -contains 'MSSQLSERVER') {
                $instanceId = $instanceNames.MSSQLSERVER
                Get-ItemProperty `
                    "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\$instanceId\Setup" |
                    Select-Object Edition, Version
            }

            Test-NetConnection gbl.his.arc.azure.com -Port 443 |
                Select-Object ComputerName, RemotePort, TcpTestSucceeded
        } | Select-Object * -ExcludeProperty PSComputerName, RunspaceId, PSShowComputerName
    }
    catch {
        Write-Output "Direct validation unavailable: $($_.Exception.Message)"
    }
}

