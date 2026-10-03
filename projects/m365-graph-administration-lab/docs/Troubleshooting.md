# Troubleshooting Notes

## Microsoft.Graph.Authentication missing

Installed the authentication module:

```powershell
Install-Module Microsoft.Graph.Authentication -Scope CurrentUser -Force
```

Validated module version during the lab: `2.41.0`.

## PowerShell execution policy blocked module loading

Corrected the current-user policy:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Windows PowerShell 5.1 Graph response behavior

`Invoke-MgGraphRequest` responses behaved as hashtables in this environment, so key indexing was used where appropriate:

```powershell
$Org["displayName"]
```

## Single-object count behavior

Graph collections were explicitly wrapped with `@(...)` so `.Count` remained reliable when only one object was returned.

## Session-scoped project root

Reusable scripts determine the project root from their own location:

```powershell
$ProjectRoot = Split-Path $PSScriptRoot -Parent
```

## Directory-role members returned 400 Bad Request

The role list succeeded, but calls shaped like:

```text
GET /v1.0/directoryRoles/{id}/members?$top=999
```

returned `400 Bad Request`.

Removing `$top` corrected the query:

```text
GET /v1.0/directoryRoles/{id}/members
```

All activated roles were then processed successfully.

## signInActivity returned 403 Forbidden

An existing Graph session lacked `AuditLog.Read.All`. The stale-account script was changed to compare the required scopes with `Get-MgContext.Scopes` and reconnect when a required scope was missing.

After reauthentication with:

```text
User.Read.All
AuditLog.Read.All
```

the user sign-in activity query completed successfully.

## Disconnect-MgGraph MSAL cache warning

`Disconnect-MgGraph` displayed an authority-format warning while clearing the persisted MSAL token cache. The warning did not prevent a successful new Device Code authentication session.

## Intune managed-device permission

The Intune inventory required:

```text
DeviceManagementManagedDevices.Read.All
```

The script detected the missing scope, reauthenticated, and successfully retrieved the managed-device inventory.
