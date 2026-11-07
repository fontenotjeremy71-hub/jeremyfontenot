# Microsoft Graph Development — Project 13 Extension

**Status:** Validated locally: 8 Pester tests passed (3 function tests and 5 JSON report tests); a separate live delegated Graph session retrieved 24 users. The live result is a point-in-time observation, not a CI result.

This extension complements the seven previously validated, read-only Project 13 administration scripts without replacing them.

## Requirements

- PowerShell 7
- Microsoft.Graph.Authentication and Microsoft.Graph.Users modules
- Pester 6+ for testing
- An authorized Microsoft Entra account with consent for delegated `User.Read.All`

## Run a live read-only export

From the `graph-development` directory in PowerShell:

```powershell
Import-Module Microsoft.Graph.Authentication
Import-Module Microsoft.Graph.Users
Connect-MgGraph -Scopes "User.Read.All"
. ./src/Export-JFGraphUsers.ps1
Export-JFGraphUsers
```

The script verifies an active Graph session and the `User.Read.All` delegated scope before retrieving users. By default, it writes JSON to `reports/GraphUsers.json`; the reports directory is Git-ignored. Use `-OutputPath` to choose another location. Review any output before sharing: user names, UPNs, IDs, and tenant identifiers may be present.

## Run the offline test suite

```powershell
Import-Module Pester -MinimumVersion 6.0
Invoke-Pester -Path ./tests -Output Detailed
```

The eight tests use synthetic records and mocked Microsoft Graph commands. They do **not** connect to the tenant, prove live authentication, or establish that a current tenant has 24 users.

## Security and boundaries

- Interactive delegated authentication; no client secret is required.
- Read-only user inventory; no tenant writes.
- No generated reports or credentials are committed.
- This activity does not guarantee Microsoft 365 Developer Program renewal.
