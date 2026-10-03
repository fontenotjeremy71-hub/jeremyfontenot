# Microsoft 365 Graph Administration Lab

**Status:** IN PROGRESS — seven read-only administration/reporting scripts validated.

Portfolio case study: https://jeremyfontenot.online/m365-graph-administration-lab.html

This lab demonstrates Microsoft 365, Microsoft Entra ID, Microsoft Intune, Microsoft Graph, and PowerShell administration using a Microsoft 365 E5 Developer tenant.

## Objectives

- Build reusable Microsoft Graph administration tooling.
- Prefer read-only validation before configuration changes.
- Use delegated permissions with least-privilege scope selection.
- Exercise both Graph REST endpoints and PowerShell automation.
- Document authentication, permissions, API behavior, troubleshooting, and validation.
- Produce portfolio-quality evidence without creating meaningless tenant activity.

## Validated scripts

| Script | Purpose | Status |
|---|---|---|
| `Get-M365TenantInventory.ps1` | Tenant, domain, user, group, SKU, role, and Entra-device inventory | Validated |
| `Get-M365UserInventory.ps1` | Detailed Entra/M365 user and licensing inventory | Validated |
| `Get-M365GroupMembership.ps1` | Group and direct-membership reporting | Validated |
| `Get-M365LicenseAssignment.ps1` | License capacity and assignment reporting | Validated |
| `Get-EntraRoleInventory.ps1` | Activated Entra directory roles and membership | Validated |
| `Get-EntraStaleAccounts.ps1` | Potentially stale account analysis using sign-in activity | Validated |
| `Get-IntuneManagedDeviceInventory.ps1` | Intune managed-device inventory | Validated |

## Validated environment snapshot

- Verified domains: 3
- Users: 22
- Groups: 12
- Subscribed SKUs: 1
- Activated directory roles: 4
- Entra devices: 2
- Licensed users: 19
- Unlicensed users: 3
- Intune managed devices: 1

These values are a point-in-time lab snapshot and will change as the environment evolves.

## Graph permissions exercised

- `Organization.Read.All`
- `User.Read.All`
- `Group.Read.All`
- `Directory.Read.All`
- `AuditLog.Read.All`
- `DeviceManagementManagedDevices.Read.All`

## Graph endpoints exercised

```text
GET /v1.0/organization
GET /v1.0/users
GET /v1.0/groups
GET /v1.0/groups/{id}/members
GET /v1.0/subscribedSkus
GET /v1.0/directoryRoles
GET /v1.0/directoryRoles/{id}/members
GET /v1.0/devices
GET /v1.0/deviceManagement/managedDevices
```

## Validation highlights

- Device Code delegated authentication validated.
- Existing Graph sessions are checked for required scopes before reuse.
- Graph collection pagination is handled where supported.
- Windows PowerShell 5.1 hashtable behavior is handled explicitly.
- CSV reporting was validated for tenant, user, group, licensing, role, stale-account, and Intune inventory.
- A `400 Bad Request` on directory-role membership was traced to an unsupported `$top` query parameter and corrected.
- A `403 Forbidden` on `signInActivity` was traced to a missing `AuditLog.Read.All` scope and corrected.

## Repository layout

```text
m365-graph-administration-lab/
├── README.md
├── scripts/
│   ├── Get-M365TenantInventory.ps1
│   ├── Get-M365UserInventory.ps1
│   ├── Get-M365GroupMembership.ps1
│   ├── Get-M365LicenseAssignment.ps1
│   ├── Get-EntraRoleInventory.ps1
│   ├── Get-EntraStaleAccounts.ps1
│   └── Get-IntuneManagedDeviceInventory.ps1
└── docs/
    └── Troubleshooting.md
```

## Security and publication notes

Live CSV exports are intentionally not published because they can contain user principal names, object IDs, device identifiers, and other tenant-specific information. The public repository contains the reusable code and sanitized validation documentation only.
