# Project 14 — Screenshot Evidence Register

**Publication state:** Nineteen reviewed original PNGs included in this release. Final production checks are recorded in the release report.

**Sources:** The supplied review ZIP and the complete `Project-14-All-Chat-Screenshots.zip` recovered from the owner’s saved files. All 82 PNG members were inspected: 72 UUID originals and ten curated copies. Exact hash matches establish the original UUID filenames for all ten initially selected PNGs. No source bytes were changed.

All images received visual review and OCR review. No reusable credentials were observed in the selected images; no redactions were necessary. Identifiers and internal IPs are included with explicit owner authorization. The complete source archive stays outside the public Git history.

| Evidence ID | Filename | Technical claim | Verification status | Published URL |
| --- | --- | --- | --- | --- |
| P14-01 | P14-01-LINUX01-Active-Directory-Login-Success.png | Ubuntu 26.04 LTS console shows login with the domain account and successful shell access. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-01-LINUX01-Active-Directory-Login-Success.png) |
| P14-02 | P14-02-LINUX01-AD-Identity-Group-Validation.png | The domain account resolves with id output and Active Directory group memberships on Linux. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-02-LINUX01-AD-Identity-Group-Validation.png) |
| P14-03 | P14-03-LINUX01-Domain-SSH-Session.png | LINUX01 SSH shell shows the domain-account prompt and private VLAN address 10.10.30.20. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-03-LINUX01-Domain-SSH-Session.png) |
| P14-04 | P14-04-Grafana-OSS-Systemd-Service-Running.png | systemctl shows grafana-server enabled and active (running) on LINUX01. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-04-Grafana-OSS-Systemd-Service-Running.png) |
| P14-06 | P14-06-LetsEncrypt-Certificate-Issued.png | Certbot reports successfully received certificate, certificate/key paths, and expiration 2027-01-29. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-06-LetsEncrypt-Certificate-Issued.png) |
| P14-07 | P14-07-Grafana-HTTPS-TLS-Validated.png | Grafana login is displayed at the configured HTTPS hostname and port without a visible browser certificate warning. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-07-Grafana-HTTPS-TLS-Validated.png) |
| P14-08 | P14-08-Entra-Grafana-App-Registration.png | App overview shows Grafana-OSS-SSO-Lab, application/client ID, tenant ID, single-organization account type, and one Web redirect URI. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-08-Entra-Grafana-App-Registration.png) |
| P14-09 | P14-09-Grafana-Microsoft-Entra-SSO-Login-Option.png | Grafana login displays Sign in with Microsoft Entra ID at the HTTPS application address. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-09-Grafana-Microsoft-Entra-SSO-Login-Option.png) |
| P14-10 | P14-10-Grafana-Microsoft-Entra-SSO-Authentication-Success.png | Grafana home is displayed in an authenticated application view. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-10-Grafana-Microsoft-Entra-SSO-Authentication-Success.png) |
| P14-11 | P14-11-Grafana-Entra-User-Identity-Verified.png | The Grafana account menu displays Jeremy Fontenot (Admin) and the expected Entra UPN. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-11-Grafana-Entra-User-Identity-Verified.png) |
| P14-12 | P14-12-Grafana-Entra-Role-Assignment-Verified.png | Profile fields are labeled Synced via AzureAD; Main Org. role is Viewer and the session provider is AzureAD. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-12-Grafana-Entra-Role-Assignment-Verified.png) |
| P14-13 | P14-13-Entra-Grafana-Authorized-User-Assignment.png | Grafana-OSS-SSO-Lab lists Jeremy Fontenot (Admin) as User with Default Access. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-13-Entra-Grafana-Authorized-User-Assignment.png) |
| P14-14 | P14-14-Entra-Grafana-Assignment-Required-Enabled.png | Enterprise application properties show Assignment required = Yes, visibility enabled, and a successful update notification. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-14-Entra-Grafana-Assignment-Required-Enabled.png) |
| P14-15 | P14-15-Entra-Grafana-Branding-Launch-URL.png | Branding and properties show the Grafana logo and configured private HTTPS home-page URL. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-15-Entra-Grafana-Branding-Launch-URL.png) |
| P14-16 | P14-16-Cloudflare-DNS01-Scoped-Permissions.png | Cloudflare token configuration limits permission to Zone DNS Edit for the specific jeremyfontenot.online zone. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-16-Cloudflare-DNS01-Scoped-Permissions.png) |
| P14-17 | P14-17-Microsoft-MyApps-Grafana-SSO-Tile.png | The assigned user’s Apps dashboard contains the Grafana-OSS-SSO-Lab tile. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-17-Microsoft-MyApps-Grafana-SSO-Tile.png) |
| P14-18 | P14-18-Microsoft-MyApps-Grafana-SSO-Launch-Success.png | Grafana home is displayed in the capture supplied after the My Apps launch. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-18-Microsoft-MyApps-Grafana-SSO-Launch-Success.png) |
| P14-19 | P14-19-MyApps-Grafana-AzureAD-Session-Verified.png | Grafana profile shows AzureAD-synchronized identity, Viewer role, and two AzureAD session entries. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-19-MyApps-Grafana-AzureAD-Session-Verified.png) |
| P14-D05 | P14-D05-Entra-OAuth-Consent-Prompt.png | Microsoft requests basic profile and continued access for Grafana-OSS-SSO-Lab. | PASS — visual review | [PNG](https://jeremyfontenot.online/projects/grafana-entra-sso/evidence/P14-D05-Entra-OAuth-Consent-Prompt.png) |

## Source-to-public integrity mapping

Complete source archive SHA-256: `2c89b3ab8e3944120c503d78e2befca6e8b160bdfc6bda7c5d5ad0e5da197f1d`. Review archive SHA-256: `f0ca2a34ef5e272266a0ef0ac709affd82bf75c8a147b31d5d460eac4b6322dc`.

| Evidence | Original UUID filename | Published filename | SHA-256 | Modified |
| --- | --- | --- | --- | --- |
| P14-01 | dcf9e5c2-a14a-4914-8694-8473067dd5eb.png | P14-01-LINUX01-Active-Directory-Login-Success.png | `abc898ca399c2239b2f15e88bc61e0ea04b7d192726507d3ba80e22ad2b3a86d` | No |
| P14-02 | c50ae6b1-b109-462d-a822-004bf08136fd.png | P14-02-LINUX01-AD-Identity-Group-Validation.png | `ea1750395b65b8066d6f4ccece3b410b1bc53b19e56e208ce3885d0285a4e693` | No |
| P14-03 | 1a9fd905-a686-4763-987b-0e012fc9d7ee.png | P14-03-LINUX01-Domain-SSH-Session.png | `1e29e4dcee248ca0ed72660e4e7b956fa5ab5bb44b2f5c2d3df7ad6473d06f37` | No |
| P14-04 | 4d785818-f508-441c-a34a-388ed181c26d.png | P14-04-Grafana-OSS-Systemd-Service-Running.png | `843977b0631cd9b44a83784e13e9849201547af8fd7a29908a8e76151d507d60` | No |
| P14-06 | 9792cd55-fe57-4b39-af79-f703e1d9abf3.png | P14-06-LetsEncrypt-Certificate-Issued.png | `b141b670ee460e77be62b9e11526c132890d5b6724a0df121a1c914ead46655c` | No |
| P14-07 | a3d61af2-bf5e-4d42-b99d-d54f30404ab4.png | P14-07-Grafana-HTTPS-TLS-Validated.png | `661eade20e5568e3badec48cb60fa0fce7d754f16a5a70f9147044fd83baf6cd` | No |
| P14-08 | d79e2cc9-0dbe-4554-b232-44ed68a2cb7c.png | P14-08-Entra-Grafana-App-Registration.png | `4b4cdaa69a3e9384270b225b7709d4fb7fbde9ee3b483803c9ab3c4d1b6d958b` | No |
| P14-09 | 99ac0cba-fc15-4f8c-885e-c5667f56397c.png | P14-09-Grafana-Microsoft-Entra-SSO-Login-Option.png | `2ea2b7796175988ebcdf94f241106333d576635026ce74409b475ee6e2f67b17` | No |
| P14-10 | 39143b94-1595-46ff-9f9f-0bc63dc6c92b.png | P14-10-Grafana-Microsoft-Entra-SSO-Authentication-Success.png | `8de3e915029e371f70b1a1d8927b64be0cc5541d91478687efa0791f8d876648` | No |
| P14-11 | 3f4a05c7-249c-4cfb-9770-919c9518e265.png | P14-11-Grafana-Entra-User-Identity-Verified.png | `40973f7ce9593fc2a9a7abb97904bd3142a4efe3710aa78b6e791357eadbd11a` | No |
| P14-12 | 6e8ebd31-0c17-43b2-ae4a-c13f2e76cbad.png | P14-12-Grafana-Entra-Role-Assignment-Verified.png | `8a4ede848d81f5ba563bad4b93bf4dba86e551718e5f47ba56f3a1b09014a8b6` | No |
| P14-13 | 59d59e04-ad8d-4aad-80b4-636156572076.png | P14-13-Entra-Grafana-Authorized-User-Assignment.png | `dd187d0779f4fa491af85de971f0ac4a7be8b3b31ba020dad40cb31abe58a59b` | No |
| P14-14 | 34b95f54-aab8-4653-84aa-6df6a38a913a.png | P14-14-Entra-Grafana-Assignment-Required-Enabled.png | `9e4236c651f111cf6ea86683429640c18f070cccac6941e4ad7057143890b42b` | No |
| P14-15 | ca095c5f-d544-49b7-b426-a11cad9b97ed.png | P14-15-Entra-Grafana-Branding-Launch-URL.png | `17649794f8719923cb67e5bf60aee0eee3355be21b577729e10f78590fd0b8a2` | No |
| P14-16 | eee858a0-6187-4c67-86a1-16924bd77d86.png | P14-16-Cloudflare-DNS01-Scoped-Permissions.png | `c65343edd9de175799fea3133ed14853a63756467c17fcb01002f28948a4f569` | No |
| P14-17 | c4206ae1-60a0-4429-ae1f-68480d5290c5.png | P14-17-Microsoft-MyApps-Grafana-SSO-Tile.png | `cba34ef8b2e0261bfdd1e8647113e6b52b86fe2132e264400aef3e8125244847` | No |
| P14-18 | 62fd87a0-a80d-45f7-95a6-6f49028140e4.png | P14-18-Microsoft-MyApps-Grafana-SSO-Launch-Success.png | `c3dd1c9678a48c77de946ec299f681b023536ed068e09308c064e00bf15a30f3` | No |
| P14-19 | 2211a62a-dfe6-4648-906d-f0e6543c3bb9.png | P14-19-MyApps-Grafana-AzureAD-Session-Verified.png | `d6ed4c1443ed48d421e5625c5a2e443dd111a5f7c04c36fec57bbdf2bd4474dd` | No |
| P14-D05 | 2f442995-f8e4-4c81-894f-201a12afdc20.png | P14-D05-Entra-OAuth-Consent-Prompt.png | `006c10a4550b4be3913be0d30cccb7512f1b77a717484577560c8289ab3e77f9` | No |

## Complete source selection record

[Source inventory](SOURCE-SCREENSHOT-INVENTORY.csv) records all 82 members, hashes, selection states, and reasons. Nineteen unique originals are published. Fifty-three unique originals remain in the preserved source archive: 18 workstation/terminal/GitHub setup views, eight recovery/initial login views, and 27 exploratory/intermediate/ancillary captures. The ten curated copies match originals exactly and retain their existing public filenames; neither source copy was deleted.

## Evidence sources

The original screenshots document Linux identity, the Grafana service and HTTPS interface, certificate issuance, Entra application configuration, Viewer authorization, application assignment, and Microsoft My Apps integration. The retained interactive lab record documents the command-based verification of renewal simulation, deployment-hook execution, health response, and certificate-copy comparisons. Each record is attributed to its source.
