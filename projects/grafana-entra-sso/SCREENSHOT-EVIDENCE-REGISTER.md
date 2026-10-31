# Project 14 — Screenshot Evidence Register

**Publication state:** Ten reviewed original PNGs included in this release. Production availability is recorded separately in the final production report.

**Source:** `Project-14-Public-Evidence-Review(1).zip`, supplied by the owner. Original filename means the received archive member name; earlier chat-upload filenames were not available. No unsupported rename mapping is asserted.

All ten images were visually inspected and reviewed with OCR. Identifiers and private IP addresses are included with explicit owner permission. No passwords, secrets, private keys, cookies, reusable tokens, or recovery codes were observed. No images were edited or redacted.

| Evidence ID | Filename | Technical claim | Verification status | Published URL |
| --- | --- | --- | --- | --- |
| P14-09 | P14-09-Grafana-Microsoft-Entra-SSO-Login-Option.png | Grafana login displays Sign in with Microsoft Entra ID at the HTTPS application address. | PASS — visual inspection | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-09-Grafana-Microsoft-Entra-SSO-Login-Option.png) |
| P14-10 | P14-10-Grafana-Microsoft-Entra-SSO-Authentication-Success.png | Grafana home is displayed in an authenticated application view. | PASS — visual inspection | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-10-Grafana-Microsoft-Entra-SSO-Authentication-Success.png) |
| P14-11 | P14-11-Grafana-Entra-User-Identity-Verified.png | The Grafana account menu displays Jeremy Fontenot (Admin) and the expected Entra UPN. | PASS — visual inspection | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-11-Grafana-Entra-User-Identity-Verified.png) |
| P14-12 | P14-12-Grafana-Entra-Role-Assignment-Verified.png | Profile fields are labeled Synced via AzureAD; Main Org. role is Viewer and the session provider is AzureAD. | PASS — visual inspection | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-12-Grafana-Entra-Role-Assignment-Verified.png) |
| P14-13 | P14-13-Entra-Grafana-Authorized-User-Assignment.png | Grafana-OSS-SSO-Lab lists Jeremy Fontenot (Admin) as User with Default Access. | PASS — visual inspection | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-13-Entra-Grafana-Authorized-User-Assignment.png) |
| P14-14 | P14-14-Entra-Grafana-Assignment-Required-Enabled.png | Enterprise application properties show Assignment required = Yes, visibility enabled, and a successful update notification. | PASS — visual inspection | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-14-Entra-Grafana-Assignment-Required-Enabled.png) |
| P14-17 | P14-17-Microsoft-MyApps-Grafana-SSO-Tile.png | The assigned user’s Apps dashboard contains the Grafana-OSS-SSO-Lab tile. | PASS — visual inspection | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-17-Microsoft-MyApps-Grafana-SSO-Tile.png) |
| P14-18 | P14-18-Microsoft-MyApps-Grafana-SSO-Launch-Success.png | Grafana home is displayed in the capture supplied after the My Apps launch. | PASS — visual inspection | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-18-Microsoft-MyApps-Grafana-SSO-Launch-Success.png) |
| P14-19 | P14-19-MyApps-Grafana-AzureAD-Session-Verified.png | Grafana profile shows AzureAD-synchronized identity, Viewer role, and two AzureAD session entries. | PASS — visual inspection | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-19-MyApps-Grafana-AzureAD-Session-Verified.png) |
| P14-D05 | P14-D05-Entra-OAuth-Consent-Prompt.png | Microsoft requests basic profile and continued access for Grafana-OSS-SSO-Lab. | PASS — visual inspection | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-D05-Entra-OAuth-Consent-Prompt.png) |

## Original-byte integrity

Archive SHA-256: `f0ca2a34ef5e272266a0ef0ac709affd82bf75c8a147b31d5d460eac4b6322dc`. Every original filename equals its published filename. All images have modified = false and redacted = false. The [JSON manifest](evidence-manifest.json) records source member, size, dimensions, claim, category, limits, URL, and SHA-256.

| File | SHA-256 |
| --- | --- |
| P14-09-Grafana-Microsoft-Entra-SSO-Login-Option.png | `2ea2b7796175988ebcdf94f241106333d576635026ce74409b475ee6e2f67b17` |
| P14-10-Grafana-Microsoft-Entra-SSO-Authentication-Success.png | `8de3e915029e371f70b1a1d8927b64be0cc5541d91478687efa0791f8d876648` |
| P14-11-Grafana-Entra-User-Identity-Verified.png | `40973f7ce9593fc2a9a7abb97904bd3142a4efe3710aa78b6e791357eadbd11a` |
| P14-12-Grafana-Entra-Role-Assignment-Verified.png | `8a4ede848d81f5ba563bad4b93bf4dba86e551718e5f47ba56f3a1b09014a8b6` |
| P14-13-Entra-Grafana-Authorized-User-Assignment.png | `dd187d0779f4fa491af85de971f0ac4a7be8b3b31ba020dad40cb31abe58a59b` |
| P14-14-Entra-Grafana-Assignment-Required-Enabled.png | `9e4236c651f111cf6ea86683429640c18f070cccac6941e4ad7057143890b42b` |
| P14-17-Microsoft-MyApps-Grafana-SSO-Tile.png | `cba34ef8b2e0261bfdd1e8647113e6b52b86fe2132e264400aef3e8125244847` |
| P14-18-Microsoft-MyApps-Grafana-SSO-Launch-Success.png | `c3dd1c9678a48c77de946ec299f681b023536ed068e09308c064e00bf15a30f3` |
| P14-19-MyApps-Grafana-AzureAD-Session-Verified.png | `d6ed4c1443ed48d421e5625c5a2e443dd111a5f7c04c36fec57bbdf2bd4474dd` |
| P14-D05-Entra-OAuth-Consent-Prompt.png | `006c10a4550b4be3913be0d30cccb7512f1b77a717484577560c8289ab3e77f9` |

## Coverage limits

Ten supplied images inspected; ten published; zero excluded. The requested 82-file staging collection, including 72 additional images, was unavailable in this environment and absent from the current repository. Those 72 were not inspected or classified as excluded. No staging archive is committed.

Certificate issuance, renewal simulation, deploy hook, systemd status, health endpoint, and app-registration/redirect configuration are described in the retained lab record, but their supporting screenshots are not in this archive. Unassigned-user denial and fresh authentication on every tile launch are not established.
