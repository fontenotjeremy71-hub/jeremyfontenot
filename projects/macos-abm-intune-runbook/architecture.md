# Architecture — macOS ABM to Intune

## Status boundary

This project uses three explicit implementation states:

- **REAL CONFIGURATION** — actually configured or directly validated in the real Microsoft Intune tenant.
- **SIMULATED / DOCUMENTED** — accurately designed and documented, but not executed because the required Apple infrastructure or managed macOS endpoint is unavailable.
- **NOT VALIDATED** — a Microsoft-side policy may exist, but endpoint behavior was not tested on an enrolled Mac.

## Intended enterprise flow

```text
Authorized reseller / Apple procurement
        │
        ▼
Apple Business Manager
        │
        │ device assignment to MDM server
        ▼
Microsoft Intune MDM server
        │
        │ Enrollment Program Token
        ▼
Automated Device Enrollment
        │
        ▼
macOS Setup Assistant
        │
        ▼
Microsoft Entra authentication
        │
        ▼
Microsoft Intune enrollment
        │
        ├───────────────┬────────────────┬────────────────┐
        ▼               ▼                ▼                ▼
Configuration       Applications      Compliance       Security
profiles                                                controls
        │               │                │                │
        ├─ Platform SSO │                │                ├─ FileVault
        ├─ Wi-Fi / PKI  │                │                └─ Firewall
        └─ restrictions │                │
        └───────────────┴────────────────┴────────────────┘
                                │
                                ▼
                    Inventory + lifecycle
                                │
                  ┌─────────────┼─────────────┐
                  ▼             ▼             ▼
                Retire         Wipe       Reassignment
```

## Apple service boundary

### Apple Push Notification service — REAL CONFIGURATION

A real Apple MDM Push certificate was created in Apple's Push Certificates Portal using the Intune-generated CSR and uploaded back to the Intune tenant.

Validated state:

- Vendor: Microsoft Corporation.
- APNs certificate created successfully.
- Intune upload completed successfully.
- Certificate expiration: **2027-09-26**.

The Apple account used to own the certificate is intentionally excluded from public evidence.

### Apple Business Manager — SIMULATED / DOCUMENTED

No Apple Business Manager organization is available in the lab. Therefore, the following are not represented as implemented:

- organization verification;
- reseller/device assignment;
- MDM server creation in ABM;
- ABM server token issuance;
- Enrollment Program Token import;
- ADE device sync;
- ADE profile assignment;
- Setup Assistant ADE behavior.

## Microsoft service boundary

### Microsoft Intune — REAL CONFIGURATION

The real tenant was used to create or inspect:

- Apple enrollment administration;
- macOS compliance policy;
- macOS FileVault Settings Catalog profile;
- macOS enrollment restrictions;
- Platform SSO settings;
- enterprise Wi-Fi settings;
- SCEP certificate settings;
- macOS application types;
- macOS inventory;
- macOS bulk device lifecycle actions.

### Microsoft Entra ID

Microsoft Entra is the intended identity provider for Company Portal enrollment and Platform SSO. Endpoint Platform SSO registration is **NOT VALIDATED** because there is no enrolled macOS endpoint.

## Real vs. simulated matrix

| Component | Classification | Evidence / boundary |
|---|---|---|
| Intune tenant access | REAL CONFIGURATION | Real portal configuration captured |
| APNs certificate | REAL CONFIGURATION — COMPLETE | Created in Apple portal; uploaded to Intune |
| ABM organization | SIMULATED / DOCUMENTED | No ABM organization available |
| Enrollment Program Token | SIMULATED / DOCUMENTED | Intune creation workflow inspected only |
| ADE | SIMULATED / DOCUMENTED | Requires ABM + eligible device |
| macOS compliance policy | REAL CONFIGURATION — COMPLETE | Policy created in Intune |
| Compliance enforcement | NOT VALIDATED | No enrolled macOS endpoint |
| FileVault policy | REAL CONFIGURATION — COMPLETE | Settings Catalog profile created |
| FileVault encryption on endpoint | NOT VALIDATED | No enrolled macOS endpoint |
| Recovery-key escrow | NOT VALIDATED | No enrolled macOS endpoint |
| Platform SSO capability | REAL CONFIGURATION — VALIDATED | Settings exposed in Intune |
| Platform SSO endpoint registration | SIMULATED / DOCUMENTED | No managed Mac |
| Enterprise Wi-Fi capability | REAL CONFIGURATION — VALIDATED | Enterprise profile surface inspected |
| WPA2-Enterprise + EAP-TLS | SIMULATED / DOCUMENTED DESIGN | No RADIUS/PKI deployment |
| SCEP certificate capability | REAL CONFIGURATION — VALIDATED | SCEP profile surface inspected |
| Certificate issuance | SIMULATED / DOCUMENTED | No live enterprise PKI/SCEP service |
| macOS application deployment capability | REAL CONFIGURATION — VALIDATED | Supported app types inspected |
| Application installation | NOT VALIDATED | No managed Mac |
| macOS inventory | REAL CONFIGURATION — VALIDATED | Inventory page available; 0 Macs enrolled |
| Retire / Wipe / Delete / Restart / Rename / Sync | REAL CONFIGURATION — VALIDATED CAPABILITY | Actions exposed; none executed |
| Device reassignment | SIMULATED / DOCUMENTED | No enrolled Mac |
| Lost/stolen workflow | SIMULATED / DOCUMENTED | Operational procedure only |

## Enterprise Wi-Fi design

The intended secure WLAN model is:

```text
macOS device
   │
   ├─ trusted root certificate
   ├─ SCEP/PKCS device certificate
   │
   ▼
WPA2-Enterprise / EAP-TLS
   │
   ▼
RADIUS / network policy service
   │
   ▼
Enterprise wireless network
```

The Intune tenant exposed WPA-Enterprise, WPA2-Enterprise, EAP-FAST, EAP-SIM, EAP-TLS, EAP-TTLS, LEAP, and PEAP. EAP-TLS is the documented design because it supports certificate-based device authentication without depending on user passwords for Wi-Fi access.

## Security design principles

- Require FileVault encryption.
- Prevent users from disabling FileVault after policy enforcement.
- Escrow the personal recovery key to the management service when a managed Mac exists.
- Require System Integrity Protection.
- Require password-protected unlock.
- Enable firewall and Stealth Mode.
- Preserve Gatekeeper restrictions.
- Prefer certificate-based enterprise Wi-Fi.
- Keep APNs renewal ownership documented.
- Separate destructive lifecycle operations from routine sync/restart actions.
- Never publish recovery keys, token contents, credentials, or certificate private material.
