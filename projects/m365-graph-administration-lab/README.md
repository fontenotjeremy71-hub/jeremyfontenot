# Microsoft 365 Graph Administration Lab

**Status:** COMPLETE — validated read-only Microsoft Graph administration and reporting automation.

Portfolio case study: https://jeremyfontenot.online/m365-graph-administration-lab.html

This lab demonstrates Microsoft 365, Microsoft Entra ID, Microsoft Intune, Microsoft Graph, and PowerShell administration using a Microsoft 365 E5 Developer tenant.

## Objectives

- Build reusable Microsoft Graph administration tooling.
- Prefer read-only validation before configuration changes.
- Use delegated permissions with least-privilege scope selection.
- Exercise both Graph REST endpoints and PowerShell automation.
- Document authentication, permissions, API behavior, troubleshooting, and validation.
- Produce portfolio-quality evidence without creating meaningless tenant activity.

## Validated administration scripts

The original administration/reporting set contains seven read-only scripts:

| Script | Purpose | Status |
|---|---|---|
| `Get-M365TenantInventory.ps1` | Tenant, domain, user, group, SKU, role, and Entra-device inventory | Previously validated |
| `Get-M365UserInventory.ps1` | Detailed Entra/M365 user and licensing inventory | Previously validated |
| `Get-M365GroupMembership.ps1` | Group and direct-membership reporting | Previously validated |
| `Get-M365LicenseAssignment.ps1` | License capacity and assignment reporting | Previously validated |
| `Get-EntraRoleInventory.ps1` | Activated Entra directory roles and membership | Previously validated |
| `Get-EntraStaleAccounts.ps1` | Potentially stale account analysis using sign-in activity | Previously validated |
| `Get-IntuneManagedDeviceInventory.ps1` | Intune managed-device inventory | Previously validated |

The seven scripts remain the original project baseline. Their prior validation is retained in the project record; the newer Pester test run described below does not rerun these seven scripts.

## Additional tested extension — Graph JSON user export

The `graph-development/` directory contains a separate PowerShell 7 application that complements, rather than replaces, the seven administration scripts.

- Source: [`Export-JFGraphUsers.ps1`](graph-development/src/Export-JFGraphUsers.ps1)
- Runbook and requirements: [Graph development README](graph-development/README.md)
- Function tests: [`GraphFunction.Tests.ps1`](graph-development/tests/GraphFunction.Tests.ps1)
- JSON report tests: [`GraphReport.Tests.ps1`](graph-development/tests/GraphReport.Tests.ps1)

The export function checks for an active delegated Microsoft Graph session and the `User.Read.All` scope, retrieves users with `Get-MgUser -All`, and writes a structured JSON report. The default `reports/` output directory is Git-ignored. Review any generated report before sharing because it may contain user names, UPNs, object IDs, and tenant identifiers.

### Extension validation and evidence boundary

- **Automated tests:** 8/8 Pester tests passed locally with Pester 6.2.0: three function tests and five JSON report checks.
- **Test method:** The Pester suite uses mocked Microsoft Graph commands and synthetic records. It does not connect to the tenant or prove live authentication.
- **Separate live check:** A delegated Graph session using `User.Read.All` retrieved 24 users at the time of testing. This is a point-in-time observation, not a current tenant count or a Pester result.
- **Access model:** Interactive delegated authentication and read-only retrieval; no tenant writes.
- **Security:** Generated reports and credentials are not committed.

The test suite validates the export function's guards and report structure. It must not be presented as live-tenant testing of all seven original scripts.

## Validated environment snapshot

The original seven-script inventory retained this point-in-time lab snapshot:

- Verified domains: 3
- Users: 22
- Groups: 12
- Subscribed SKUs: 1
- Activated directory roles: 4
- Entra devices: 2
- Licensed users: 19
- Unlicensed users: 3
- Intune managed devices: 1

These values are a historical snapshot from the original inventory validation and will change as the environment evolves. The separate 24-user JSON-export retrieval is a later point-in-time observation; neither figure should be treated as the tenant's current count.

## Graph permissions exercised

Original administration scripts:

- `Organization.Read.All`
- `User.Read.All`
- `Group.Read.All`
- `Directory.Read.All`
- `AuditLog.Read.All`
- `DeviceManagementManagedDevices.Read.All`

JSON export extension:

- `User.Read.All` (delegated)

## Graph endpoints exercised

Original administration/reporting scripts:

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

The JSON export extension uses the Microsoft Graph PowerShell user retrieval command `Get-MgUser -All` with delegated `User.Read.All`.

## Validation highlights

- Device Code delegated authentication validated for the original administration scripts.
- Existing Graph sessions are checked for required scopes before reuse.
- Graph collection pagination is handled where supported.
- Windows PowerShell 5.1 hashtable behavior is handled explicitly.
- CSV reporting was validated for tenant, user, group, licensing, role, stale-account, and Intune inventory.
- A `400 Bad Request` on directory-role membership was traced to an unsupported `$top` query parameter and corrected.
- A `403 Forbidden` on `signInActivity` was traced to a missing `AuditLog.Read.All` scope and corrected.
- The separate PowerShell 7 JSON export extension passed its eight mocked-data Pester tests and had a separate live delegated retrieval of 24 users.

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
├── docs/
│   └── Troubleshooting.md
└── graph-development/
    ├── README.md
    ├── src/
    │   └── Export-JFGraphUsers.ps1
    └── tests/
        ├── GraphFunction.Tests.ps1
        └── GraphReport.Tests.ps1
```

## Completion and claim boundary

The intended portfolio scope is complete: seven read-only administration/reporting scripts were previously validated across Microsoft 365, Entra ID, and Intune. A separate PowerShell 7 JSON export extension adds eight passing mocked-data Pester tests and a separately documented live delegated retrieval. The project demonstrates delegated Microsoft Graph authentication, required-scope handling, read-only administration/reporting, CSV and JSON output, pagination where supported, and documented troubleshooting.

It does not claim Graph write automation, live-tenant validation from the mocked Pester suite, or broader Graph coverage that has not been validated. The eight extension tests do not replace or expand the original seven-script validation record.

## Security and publication notes

Live CSV and JSON exports are intentionally not published because they can contain user principal names, object IDs, device identifiers, and other tenant-specific information. The public repository contains reusable code and sanitized validation documentation only.
