# Renewal Calendar and Operational Ownership

## Renewal schedule

| Item | Cadence | Current / planned date | Owner responsibility | Validation |
|---|---|---|---|---|
| Apple MDM Push certificate (APNs) | Annual | Expires **2027-09-26** | Renew with the same Apple account before expiration | Confirm Intune status and expiration |
| ABM / Intune Enrollment Program Token | Annual | Not created in this lab | Renew existing ABM server token before expiration | Sync devices and confirm token state |
| SCEP/PKCS issuing certificate chain | Based on PKI policy | SIMULATED / DOCUMENTED | Track CA and connector certificate expiration | Test issuance before renewal window |
| Wi-Fi/RADIUS server certificates | Based on PKI policy | SIMULATED / DOCUMENTED | Renew before trust expires | EAP-TLS test from pilot Mac |
| Application packages | Continuous | N/A | Review new versions, signing, compatibility | Pilot deployment |
| macOS compliance baseline | At least quarterly + OS release | N/A | Review minimum OS/security requirements | Test on pilot group |
| Platform SSO profile | At OS/Company Portal changes | N/A | Review supported settings and registration behavior | Pilot sign-in validation |
| FileVault policy | At security baseline review | N/A | Confirm policy and recovery workflow | Escrow + recovery test on pilot Mac |

## APNs renewal procedure

1. Start renewal well before expiration.
2. Identify the Apple account that owns the existing certificate.
3. In Intune, confirm the existing APNs certificate identity.
4. Open Apple's Push Certificates Portal using the same owning Apple account.
5. Renew the existing certificate.
6. Download the renewed certificate.
7. Upload it into the existing Intune APNs configuration.
8. Confirm status and new expiration.
9. Record the renewal date and next renewal deadline.
10. Do not publish certificate material or Apple-account identifiers.

## ABM token renewal procedure

**SIMULATED / DOCUMENTED**

1. Confirm the existing Intune Enrollment Program Token and corresponding ABM MDM server.
2. Sign in to ABM with an authorized account.
3. Download a renewed server token for the same MDM server.
4. Upload it to the existing Intune token object.
5. Synchronize devices.
6. Confirm device count and token expiration.
7. Record renewal ownership.

## Operational rule

Renew existing trust relationships whenever continuity is required. Replacing APNs certificates or recreating ABM MDM server relationships without a change reason can break management continuity.
