# Implementation

## 1. Apple MDM Push certificate — REAL CONFIGURATION

The Intune Apple enrollment page initially showed the Apple MDM Push Certificate as **Not set up**.

Implementation sequence:

1. Accepted Microsoft's Apple data-sharing permission prompt in Intune.
2. Downloaded the Intune certificate signing request (CSR).
3. Opened Apple's Push Certificates Portal.
4. Accepted Apple's MDM certificate terms.
5. Uploaded the Intune-generated CSR.
6. Apple issued a new Mobile Device Management push certificate for Microsoft Corporation.
7. Downloaded the resulting PEM certificate.
8. Returned to Intune.
9. Entered the Apple account used to create the certificate.
10. Uploaded the PEM certificate.
11. Intune reported successful MDM push certificate creation.
12. Final Intune state showed the certificate as active.

Validated expiration: **2027-09-26**.

No Apple credentials, PEM file, private key material, certificate serial number, or Apple account identifier are published.

## 2. Enrollment Program Token / ADE — SIMULATED / DOCUMENTED

The real Intune tenant was used to inspect the Enrollment Program Token workflow.

Intune exposes the expected sequence:

1. Grant Microsoft permission to exchange device/user information with Apple.
2. Download the Intune public-key certificate.
3. Open Apple Business Manager.
4. Create the ABM MDM server relationship.
5. Upload the Intune public key in ABM.
6. Download the ABM server token.
7. Enter the Apple ID used for token ownership.
8. Upload the token to Intune.
9. Sync assigned devices.
10. Create and assign ADE profiles.

The lab has no Apple Business Manager organization, so no token was created and no device was synchronized.

## 3. macOS compliance baseline — REAL CONFIGURATION

Policy:

`Project 5 - macOS Enterprise Compliance`

Configured settings:

- Require System Integrity Protection.
- Require a password to unlock devices.
- Require encryption of data storage.
- Enable Firewall.
- Enable Stealth Mode.
- Gatekeeper: allow apps from the Mac App Store and identified developers.
- Mark device noncompliant immediately.

Assignment:

- intentionally unassigned because there is no managed macOS test endpoint.

Result:

- policy object created successfully in the real Intune tenant;
- monitoring showed 0 devices, which matches the known lab inventory.

## 4. FileVault baseline — REAL CONFIGURATION

Policy:

`Project 5 - macOS FileVault Baseline`

Profile type:

- macOS Settings Catalog.

Configured controls:

- `FileVault > Enable = On`
- `FileVault Options > Prevent FileVault From Being Disabled = True`
- recovery-key escrow `Location` guidance configured.

The profile was intentionally left unassigned because there is no managed macOS endpoint.

What is proven:

- the policy exists;
- the configured settings are visible in the real Intune tenant.

What is not proven:

- FileVault was enabled on a Mac;
- a recovery key was successfully escrowed;
- the recovery key was rotated or recovered.

## 5. Platform SSO — REAL CAPABILITY, DOCUMENTED DEPLOYMENT

A macOS Settings Catalog review confirmed:

`Authentication > Extensible Single Sign On (SSO) > Platform SSO`

The review profile was canceled after capability inspection to avoid leaving a nonfunctional placeholder policy.

A production deployment would also require a managed macOS endpoint, Company Portal / Microsoft Enterprise SSO plug-in prerequisites, supported macOS version, and actual registration validation.

## 6. Enterprise Wi-Fi — REAL CAPABILITY, DOCUMENTED DEPLOYMENT

The macOS Wi-Fi template exposes:

- Device Channel deployment;
- Basic and Enterprise profile types;
- WPA-Enterprise;
- WPA2-Enterprise;
- EAP-FAST;
- EAP-SIM;
- EAP-TLS;
- EAP-TTLS;
- LEAP;
- PEAP;
- proxy options;
- MAC address randomization controls.

The portfolio design uses **WPA2-Enterprise + EAP-TLS** with trusted-root and client-certificate deployment.

No fake SSID, RADIUS server, or certificate authority was created.

## 7. Certificate deployment — REAL CAPABILITY, DOCUMENTED ISSUANCE

The macOS SCEP certificate template exposes:

- deployment channel;
- certificate type;
- subject name format;
- subject alternative names;
- validity period;
- key usage;
- key size;
- trusted root certificate;
- extended key usage.

No certificate was issued because the lab does not have a configured enterprise SCEP/PKI path for macOS.

## 8. Application deployment — REAL CAPABILITY

The real Intune macOS app surface exposes:

- Microsoft Edge for macOS;
- Microsoft 365 Apps for macOS;
- Microsoft Defender for Endpoint (macOS);
- macOS web clip;
- web link;
- line-of-business app;
- macOS app (DMG);
- macOS app (PKG).

No placeholder application was created because there is no managed Mac on which to validate installation.

## 9. Enrollment restrictions — REAL VALIDATION

Default macOS enrollment restrictions were reviewed.

Observed state:

- macOS enrollment: Allow.
- personally owned macOS devices: Allow.
- minimum OS: not configured.
- maximum OS: not configured.

The default tenant-wide restriction was not modified merely for portfolio appearance.

## 10. Inventory and lifecycle — REAL CAPABILITY

The macOS inventory page showed **0 devices**.

The bulk action workflow exposed these macOS actions:

- Delete
- Retire
- Wipe
- Restart
- Rename
- Sync

No destructive action was executed.
