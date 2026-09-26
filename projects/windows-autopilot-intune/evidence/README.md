# Project 1 Evidence Index

Public evidence is sanitized. Passwords, recovery keys, MFA codes, private keys, VPN configuration contents, browser password exports, recovery codes, device IDs, certificate thumbprints, and hardware serial numbers are excluded or redacted.

## Screenshots

1. `screenshots/01-autopilot-branded-oobe.webp` — Autopilot retrieved the tenant experience and displayed custom work/school branding.
2. `screenshots/02-esp-device-preparation.webp` — Enrollment Status Page began device preparation.
3. `screenshots/03-esp-device-setup-complete.webp` — Device preparation and device setup completed while account setup continued.
4. `screenshots/04-compliance-before-remediation.webp` — Compliance policy identified BitLocker and Secure Boot as not compliant; device identifier redacted.
5. `screenshots/05-intune-final-compliant.webp` — Final Intune inventory showed the corporate device compliant; device identifier and UPN redacted.
6. `screenshots/06-settings-catalog-success.webp` — Settings Catalog check-in reported 2 succeeded, 0 errors, 0 conflicts, 0 not applicable, 0 in progress.

## Command evidence

- `01-dsregcmd-sanitized.txt`
- `02-intune-enterprisemgmt-tasks-sanitized.txt`
- `03-m365-apps-validation.txt`
- `04-bitlocker-validation.txt`
- `05-defender-validation.txt`
- `06-firewall-vbs-secureboot-validation.txt`

## Post-project lifecycle evidence

The endpoint's later AD DS transition is documented in [`../validation.md`](../validation.md#post-project-lifecycle-validation--2026-09-26). It is intentionally separated from the historical Autopilot state.

See [validation.md](../validation.md) for the consolidated validation matrix.
