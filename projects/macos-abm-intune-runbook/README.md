# Project 5 — Simulated macOS ABM to Intune Runbook

**Status:** COMPLETE  
**Project type:** FREE WITH SIMULATION  
**Microsoft-side implementation:** REAL CONFIGURATION where validated  
**Apple Business Manager / ADE:** SIMULATED / DOCUMENTED

## Objective

Demonstrate an enterprise macOS management design spanning Apple Business Manager (ABM), Microsoft Intune, Automated Device Enrollment (ADE), Microsoft Entra authentication, Platform SSO, enterprise Wi-Fi, certificates, FileVault, compliance, application deployment, inventory, and lifecycle administration.

The project deliberately separates what was actually configured in the Microsoft Intune tenant from Apple- and endpoint-dependent workflows that could not be executed legitimately in the lab.

## What was actually configured

The following work was performed in the real Microsoft Intune tenant:

- Apple MDM Push (APNs) certificate created through Apple's Push Certificates Portal and uploaded to Intune.
- APNs certificate validated as active in Intune; renewal due **2027-09-26**.
- macOS compliance policy created:
  - System Integrity Protection required.
  - Password required to unlock.
  - Storage encryption required.
  - Firewall enabled.
  - Stealth Mode enabled.
  - Gatekeeper limited to the Mac App Store and identified developers.
  - Noncompliance marked immediately.
- macOS FileVault Settings Catalog profile created:
  - FileVault enabled.
  - Users prevented from disabling FileVault.
  - Recovery-key escrow location guidance configured.
- Intune macOS enrollment restrictions reviewed and validated.
- Platform SSO configuration capability reviewed in the Settings Catalog.
- Enterprise Wi-Fi capability reviewed, including WPA/WPA2-Enterprise and EAP methods.
- SCEP certificate profile capability reviewed.
- macOS app deployment types reviewed.
- macOS inventory and bulk lifecycle actions reviewed.

## What remains simulated/documented

The following workflows are documented but were **not** represented as implemented:

- Apple Business Manager organization enrollment and verification.
- Reseller/device assignment into ABM.
- Intune Enrollment Program Token exchange with ABM.
- Automated Device Enrollment synchronization.
- ADE enrollment profile deployment.
- macOS Setup Assistant ADE experience.
- Platform SSO registration on a managed Mac.
- Certificate issuance through a live enterprise PKI/SCEP path.
- Enterprise RADIUS authentication.
- FileVault recovery-key escrow from an enrolled Mac.
- Compliance evaluation on an enrolled Mac.
- App installation on a managed Mac.
- Device reassignment, retire, wipe, and lost/stolen execution against a real Mac.

## Architecture

```text
Apple procurement / reseller
        ↓
Apple Business Manager
        ↓
Intune Enrollment Program Token
        ↓
Automated Device Enrollment profile
        ↓
macOS Setup Assistant
        ↓
Microsoft Entra authentication
        ↓
Microsoft Intune enrollment
        ↓
Configuration + applications + compliance
        ↓
FileVault + recovery-key escrow
        ↓
Inventory + lifecycle administration
```

See [architecture.md](architecture.md) for the full real-versus-simulated boundary.

## Evidence

The evidence gallery is available at:

- [Project 5 evidence index](evidence/)
- [Live case study](../../macos-abm-intune-runbook.html)

Screenshots are direct captures from the real Intune tenant or Apple Push Certificates Portal. No simulated screenshot is presented as real administration.

## Documentation

- [Architecture](architecture.md)
- [Implementation](implementation.md)
- [Validation](validation.md)
- [Troubleshooting](troubleshooting.md)
- [Lessons learned](lessons-learned.md)
- [Renewal calendar](renewal-calendar.md)
- [Device lifecycle](device-lifecycle.md)
- [Simulated deployment scenario](simulated-deployment-scenario.md)
- [Portfolio summary](portfolio-summary.md)

## Security and evidence handling

The repository does not publish Apple credentials, private keys, enrollment tokens, bearer tokens, FileVault recovery keys, passwords, MFA secrets, or session cookies. Screenshots selected for publication avoid personal Apple-account identifiers and sensitive certificate material.

## Technologies demonstrated

Apple Business Manager architecture, Apple Push Notification service, Microsoft Intune, Microsoft Entra ID, Automated Device Enrollment concepts, Platform SSO, Settings Catalog, FileVault, macOS compliance, enterprise Wi-Fi, EAP-TLS, SCEP/PKCS concepts, macOS application deployment, inventory, device lifecycle, renewal operations, and evidence-based administration.
