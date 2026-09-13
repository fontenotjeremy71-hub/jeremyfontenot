---
applyTo: "**/*.ps1,**/*.psm1,**/*.psd1"
---

# PowerShell Copilot Instructions

Write PowerShell for enterprise IT administration, automation, validation, and troubleshooting.

## General Standards

- Prefer readable, maintainable code over compact syntax.
- Use approved PowerShell verbs.
- Use descriptive variable and function names.
- Prefer parameterized scripts over hard-coded values.
- Use `Set-StrictMode` when appropriate.
- Use `-ErrorAction Stop` when failures must be caught.
- Use `try`, `catch`, and `finally` for operations that can fail.
- Avoid destructive actions unless explicitly requested.
- Prefer idempotent operations when practical.
- Do not expose credentials, passwords, tokens, API keys, or secrets.

## Output

For validation scripts, return useful structured objects whenever practical instead of only formatted console text.

Prefer:

```powershell
[PSCustomObject]@{
    ComputerName = $env:COMPUTERNAME
    Status       = "Passed"
    Timestamp    = Get-Date
}
```

over decorative text output.

## Administrative Requirements

Clearly identify when commands require:

- local administrator privileges
- domain administrator privileges
- Microsoft Graph permissions
- Azure RBAC permissions
- remote PowerShell
- WinRM
- PowerShell 7

Do not assume elevated access exists.

## Remote Administration

For PowerShell remoting:

- validate connectivity before assuming remoting works
- prefer FQDNs where appropriate
- account for WinRM authentication requirements
- avoid weakening security controls unnecessarily
- do not disable certificate validation or security protections merely to make a lab command work

## Active Directory

When working with Active Directory:

- validate target OUs, users, groups, and computers before modifying them
- use explicit search bases when practical
- avoid broad destructive operations
- preserve least privilege
- distinguish domain configuration from local computer configuration

## Microsoft 365 and Azure

When using Microsoft Graph, Azure PowerShell, or Azure CLI:

- do not assume modules are installed
- verify authentication context
- verify tenant and subscription context before making changes
- use least-privilege scopes and roles when practical
- never place tenant secrets or tokens in scripts

## Validation

After making configuration changes, include a validation command when practical.

Examples:

```powershell
Get-Service
Get-ADUser
Get-ADGroupMember
Get-NetIPConfiguration
Test-NetConnection
Get-WinEvent
Get-AzContext
Get-MgContext
```

Do not claim success solely because a configuration command returned without an error.

## Portfolio Scripts

Scripts stored in this repository may be reviewed by employers.

They should therefore demonstrate:

- safe administration
- clear logic
- error handling
- useful validation
- professional comments
- reusable design
- enterprise terminology

Avoid unnecessary complexity designed only to make a script appear advanced.

## Evidence Safety

Portfolio validation scripts must not reveal:

- passwords
- LAPS passwords
- tokens
- private keys
- authentication secrets
- sensitive user data

If validating a security feature, prove that the feature is configured without displaying the protected secret itself.
