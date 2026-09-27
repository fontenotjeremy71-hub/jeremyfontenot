# Project 5 Evidence Index

The public evidence in this folder is deliberately sanitized and narrowly captioned. It proves Microsoft-side configuration and capability without implying that Apple Business Manager, Automated Device Enrollment, or a managed macOS endpoint exists in this lab.

## Published screenshot evidence

### Security and management proof board

[Open the screenshot proof board](evidence-board-security.webp)

The board is a derived composite built from four screenshots captured during this Project 5 session:

1. **Apple Push Certificates Portal confirmation** — proves Apple issued a new Mobile Device Management push certificate for Microsoft Corporation with expiration **September 26, 2027**.
2. **macOS compliance policy review** — proves the real Intune policy was configured with System Integrity Protection, password, storage encryption, firewall, Stealth Mode, and Gatekeeper requirements before creation.
3. **macOS FileVault Settings Catalog configuration** — proves FileVault was set to On, users were prevented from disabling it, and recovery-key escrow location guidance was configured.
4. **Platform SSO settings discovery** — proves the real Intune Settings Catalog exposes the Platform SSO configuration surface.

The board proves only the states described above. It does **not** prove macOS endpoint enforcement, recovery-key escrow, Platform SSO registration, or ADE enrollment.

## Additional validated observations

The following real Intune capability observations are documented in the project runbook and were captured during the same session:

- macOS app deployment types included Microsoft Edge, Microsoft 365 Apps, Microsoft Defender for Endpoint, web clips, web links, line-of-business apps, DMG, and PKG.
- macOS inventory was available and showed **0 devices**.
- macOS bulk device actions exposed Delete, Retire, Wipe, Restart, Rename, and Sync.
- Enterprise Wi-Fi exposed WPA-Enterprise and WPA2-Enterprise.
- EAP methods included EAP-FAST, EAP-SIM, EAP-TLS, EAP-TTLS, LEAP, and PEAP.
- macOS SCEP configuration exposed certificate type, subject/SAN, validity, key usage, key size, root certificate, and EKU controls.

These observations are classified as **REAL CAPABILITY VALIDATION**, not endpoint implementation.

## Why only a sanitized derivative is published

Source screenshots from the working session are retained in the conversation/evidence workflow, but only the sanitized composite is published here. This prevents unnecessary exposure of Apple account identifiers, certificate identifiers, or other tenant-specific details while preserving direct visual proof of the configuration work.

## Evidence handling rules

- No Apple account identifier is intentionally published.
- No APNs PEM file, certificate private key, recovery key, enrollment token, ABM token, password, bearer token, session cookie, or MFA secret is stored here.
- No simulated ABM/ADE screenshot is used.
- Documentation, not fabricated portal evidence, is used for simulated Apple Business Manager and Automated Device Enrollment workflows.
