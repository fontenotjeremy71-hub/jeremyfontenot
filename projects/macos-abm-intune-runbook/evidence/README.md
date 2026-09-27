# Project 5 Evidence Index

All screenshots in this folder support narrow, explicit claims. No screenshot should be interpreted as proof of a managed macOS endpoint unless the caption says so.

| File | What it proves | Classification |
|---|---|---|
| 01-apns-apple-confirmation.webp | Apple issued a Microsoft MDM push certificate with a one-year expiration | REAL CONFIGURATION |
| 02-apns-intune-upload.webp | Intune accepted the MDM push certificate upload | REAL CONFIGURATION |
| 03-compliance-review.webp | The configured macOS compliance controls before creation | REAL CONFIGURATION |
| 04-compliance-created.webp | The macOS compliance policy exists; 0 devices are assigned/evaluated | REAL CONFIGURATION |
| 05-filevault-settings.webp | FileVault enablement, anti-disable control, and escrow guidance are configured | REAL CONFIGURATION |
| 06-filevault-created.webp | The macOS FileVault Settings Catalog policy exists in Intune | REAL CONFIGURATION |
| 07-platform-sso-capability.webp | Platform SSO settings are available in the real Intune Settings Catalog | REAL CAPABILITY |
| 08-app-deployment-types.webp | Intune exposes multiple macOS application deployment types | REAL CAPABILITY |
| 09-macos-inventory-zero.webp | macOS inventory is available and currently contains 0 enrolled Macs | REAL CAPABILITY / BOUNDARY |
| 10-lifecycle-actions.webp | Delete, Retire, Wipe, Restart, Rename, and Sync actions are available for macOS | REAL CAPABILITY |
| 11-enterprise-wifi.webp | Intune exposes enterprise macOS Wi-Fi settings | REAL CAPABILITY |
| 12-eap-methods.webp | EAP methods include EAP-TLS and other enterprise authentication choices | REAL CAPABILITY |
| 13-scep-capability.webp | Intune exposes macOS SCEP certificate configuration controls | REAL CAPABILITY |

## Evidence handling

- Apple account identifiers are not published.
- Certificate private material is not published.
- No APNs PEM, private key, recovery key, ABM token, password, session cookie, or bearer token is stored here.
- Simulated ABM/ADE workflows use documentation and architecture diagrams, not fabricated portal screenshots.
