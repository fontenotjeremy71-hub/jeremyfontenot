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
| PARTIAL | Server installation, systemd, health, app registration, redirect URI, TLS certificate issuance, renewal dry-run and deploy hook | Previously validated in the retained interactive record; original command output/configuration screenshots unavailable for this publication review. This is a documentary gap, not a failed implementation. |
| NOT TESTED | Unassigned-user rejection | No negative-test evidence |
| NOT TESTED | Future real certificate renewal, public access, uptime SLA | Outside demonstrated scope |
| INCONCLUSIVE | Fresh authentication for every My Apps launch | Existing sessions could be reused |

## Screenshot evidence matrix

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

## Security boundaries

Visual and OCR review found no reusable authentication credentials in the ten available images. Originals are copied without modification; SHA-256 values match archive members. Owner explicitly authorized account identifiers and internal IP addresses. No client-secret file, Cloudflare token file, private key, cookies, bearer tokens, passwords, or recovery data is included. OCR is supplementary; it cannot establish the absence of secrets outside the supplied archive.

## Publication validation

The release validator checks static links, fragments, all 14 case studies, CNAME, branding, sitemap, and 2,976 retained-original hashes. Project 14 additionally has a dedicated check for source-to-published PNG hashes, dimensions, manifest coverage, gallery associations, duplicate IDs, alternative text, and credential patterns. CI and final production outcomes are recorded in the final release report after deployment; they are not asserted prematurely here.

## Outstanding work

- Obtain the missing 72 staging screenshots and original filename mappings for review; publish relevant safe command/configuration proof without altering originals.
- Retain direct proof of app-registration redirect configuration and certificate lifecycle commands. The documented successful lab work remains validated at its original scope.
- Test an unassigned identity if empirical enforcement proof is desired.
- Persistent VPN route distribution remains a separate infrastructure improvement.
