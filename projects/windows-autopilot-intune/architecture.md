# Architecture

## Logical design

The pilot separates user-scoped enrollment enablement from device-scoped Autopilot configuration.

### User scope
`SG-Intune-Autopilot-Pilot-Users` scopes automatic Intune MDM enrollment to the pilot.

### Device scope
`SG-Intune-Autopilot-Pilot-Devices` targets the Autopilot deployment profile, Enrollment Status Page, Microsoft 365 Apps required deployment, compliance policy, and Windows Settings Catalog security configuration.

## Runtime flow

1. Device hardware identity is registered with Windows Autopilot.
2. The device receives the user-driven Microsoft Entra join profile.
3. Tenant branding is displayed during OOBE.
4. The pilot user authenticates and the device joins Microsoft Entra ID.
5. Automatic Intune MDM enrollment occurs.
6. Enrollment Status Page blocks completion while required configuration and Microsoft 365 Apps are processed.
7. The device reaches the Windows desktop.
8. Endpoint-side PowerShell and Intune portal evidence validate the resulting security state and compliance.

## Security controls

The compliance policy evaluates BitLocker, Secure Boot, code integrity, storage encryption, Windows Firewall, TPM, antivirus, antispyware, Microsoft Defender Antimalware, current security intelligence, and real-time protection.

The Settings Catalog profile applies BitLocker/device encryption settings, Defender protections, PUA blocking, VBS, and Windows Firewall enablement for Domain, Private, and Public profiles.

The enrolled pilot user remains a standard user. Administrative elevation is provided separately through the Microsoft Entra Device Administrators role.
