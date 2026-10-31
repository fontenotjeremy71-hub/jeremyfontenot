# Project 14 — Validation Record

Environment: personal nonproduction lab. Original interactive validation recorded October 31, 2026; this publication review inspects retained artifacts and does not reconfigure or retest the live Grafana server.

## Demonstrated skills and results

| Skill | Demonstrated result | Supporting record |
| --- | --- | --- |
| Linux identity administration | Domain-account login, group resolution and SSH access | P14-01/02/03 |
| Linux application service management | Grafana service enabled and running | P14-04 |
| Certificate and HTTPS administration | Certificate issuance and expiry; HTTPS application access; scoped DNS permission configuration | P14-06/07/16 |
| Entra application integration | Single-tenant application registered with a Web callback; Entra sign-in option and consent workflow | P14-08/09/D05 |
| Identity and least-privilege authorization | Authenticated Grafana home, synchronized AzureAD identity, Viewer role and AzureAD sessions | P14-10/11/12/19 |
| Enterprise application administration | Explicit user assignment and assignment-required configuration | P14-13/14 |
| My Apps integration | Branding, launch URL, application tile and authenticated application access | P14-15/17/18/19; retained launch-workflow record |
| Certificate lifecycle validation | Successful renewal simulation, deploy hook, health verification and certificate-copy comparisons | Retained interactive lab record |

The original PNGs establish the displayed configuration and application outcomes. Command-based validation is attributed to the interactive lab record. This personal-lab demonstration presents the skills exercised by the retained workflow.

## Screenshot evidence matrix

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

## Security boundaries

Visual and OCR review found no reusable authentication credentials in the nineteen selected images. Originals are copied without modification; SHA-256 values match archive members. Owner explicitly authorized account identifiers and internal IP addresses. No client-secret file, Cloudflare token file, private key, cookies, bearer tokens, passwords, or recovery data is included. OCR is supplementary; it cannot establish the absence of secrets outside the supplied archive.

## Publication validation

The release validator checks static links, fragments, all 14 case studies, CNAME, branding, sitemap, and 2,976 retained-original hashes. Project 14 additionally has a dedicated check for source-to-published PNG hashes, dimensions, manifest coverage, gallery associations, duplicate IDs, alternative text, and credential patterns. The publication report records successful repository checks, the matching GitHub Pages deployment, production route verification, and original-image hash comparisons.
