function Export-JFGraphUsers {
    [CmdletBinding()]
    param(
        [Parameter()]
        [string]$OutputPath = (
            Join-Path $PSScriptRoot "..\reports\GraphUsers.json"
        )
    )

    $ErrorActionPreference = "Stop"

    $Context = Get-MgContext

    if (-not $Context) {
        throw "Microsoft Graph is not connected. Run Connect-MgGraph first."
    }

    if ("User.Read.All" -notin $Context.Scopes) {
        throw "The current Microsoft Graph session requires User.Read.All."
    }

    $Users = @(
        Get-MgUser -All `
            -Property Id,DisplayName,UserPrincipalName,AccountEnabled |
            Select-Object Id,DisplayName,UserPrincipalName,AccountEnabled
    )

    $Report = [PSCustomObject]@{
        Application = "JF-M365-Graph-Development"
        TenantId    = $Context.TenantId
        GeneratedAt = (Get-Date).ToUniversalTime().ToString("o")
        UserCount   = $Users.Count
        Users       = $Users
    }

    $Directory = Split-Path -Path $OutputPath -Parent

    if (-not (Test-Path -LiteralPath $Directory)) {
        New-Item -Path $Directory -ItemType Directory -Force |
            Out-Null
    }

    $Report |
        ConvertTo-Json -Depth 5 |
        Set-Content -LiteralPath $OutputPath -Encoding utf8

    Write-Verbose "Exported $($Users.Count) users to $OutputPath"

    return [PSCustomObject]@{
        Status     = "Success"
        UserCount  = $Users.Count
        OutputPath = $OutputPath
        TenantId   = $Context.TenantId
    }
}
