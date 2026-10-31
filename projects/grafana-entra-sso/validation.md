# Project 14 — Validation Record

Environment: personal nonproduction lab. Original interactive validation recorded October 31, 2026; this publication review inspects retained artifacts and does not reconfigure or retest the live Grafana server.

## Implementation validation and functional results

| State | Result | Basis and boundary |
| --- | --- | --- |
| PASS | Grafana login interface and authenticated home | P14-09/10; HTTPS address visible; full TLS chain not inspected |
| PASS | AzureAD-synchronized user, Viewer role, AzureAD session | P14-11/12/19 |
| PASS | Explicit assignment and assignment-required configuration | P14-13/14; enforcement negative test not performed |
| PASS | My Apps tile and authenticated launch outcome | P14-17/18/19, with owner-documented sequence; session reuse possible |
| PASS | OAuth consent prompt | P14-D05; acceptance and exact token exchange not proven by this image alone |
| PARTIAL | Health output, exact redirect URI, renewal dry-run and deploy hook | Previously validated in the retained interactive record; direct output/configuration screenshots absent from the reviewed complete source archive. This is a documentary gap, not a failed implementation. |
| NOT TESTED | Unassigned-user rejection | No negative-test evidence |
| NOT TESTED | Future real certificate renewal, public access, uptime SLA | Outside demonstrated scope |
| INCONCLUSIVE | Fresh authentication for every My Apps launch | Existing sessions could be reused |

Additional PASS — P14-01/02/03 show Linux domain-account login, identity/group resolution and an SSH shell; P14-04 shows enabled/running Grafana; P14-06 shows certificate issuance and expiry; P14-07 shows browser HTTPS access; P14-08 shows single-tenant registration and one Web callback; P14-15/16 show launch branding and scoped DNS permission configuration.

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

The release validator checks static links, fragments, all 14 case studies, CNAME, branding, sitemap, and 2,976 retained-original hashes. Project 14 additionally has a dedicated check for source-to-published PNG hashes, dimensions, manifest coverage, gallery associations, duplicate IDs, alternative text, and credential patterns. CI and final production outcomes are recorded in the final release report after deployment; they are not asserted prematurely here.

## Outstanding work

- All 82 source archive members were reviewed; original UUID mappings were recovered by exact hashes. Retain direct output for the remaining documentary gaps if available.
- Retain direct proof of the exact app-registration redirect URI, health output, renewal simulation, deployment-hook execution, and certificate-copy comparisons. The documented successful lab work remains validated at its original scope.
- Test an unassigned identity if empirical enforcement proof is desired.
- Persistent VPN route distribution remains a separate infrastructure improvement.
