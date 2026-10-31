# Project 14 — Screenshot Evidence Register

**Evidence capture source:** Screenshots submitted by the project owner in the interactive Grafana/Microsoft Entra configuration conversation on October 31, 2026.  
**Publication state:** **Pending binary screenshot upload.** This is a claim-to-image index, not a statement that the image files are already stored in GitHub.  
**Privacy:** Do not publish client-secret values, Cloudflare DNS API tokens, private keys, password prompts containing credentials, or live access tokens.

## Highest-value screenshots to publish

| File proposed for `evidence/` | Proof supported | Claim boundary |
| --- | --- | --- |
| `P14-06-LetsEncrypt-Certificate-Issued.png` | Certbot succeeded and issued a certificate for the Grafana hostname | Does not prove future renewal or TLS use by Grafana |
| `P14-07-Grafana-HTTPS-TLS-Validated.png` | Edge accessed the HTTPS Grafana login screen at the configured private name | Does not establish Entra authentication |
| `P14-08-Entra-Grafana-App-Registration.png` | Single-tenant Entra app registration exists; web redirect URI configured | Client IDs are not secret; credentials must be excluded |
| `P14-09-Grafana-Microsoft-Entra-SSO-Login-Option.png` | Grafana login page displays the Microsoft Entra sign-in option | Button appearance alone is not proof of successful OAuth |
| `P14-10-Grafana-Microsoft-Entra-SSO-Authentication-Success.png` | Grafana dashboard displayed after Microsoft Entra consent and redirect | Subsequent profile confirms identity provider |
| `P14-12-Grafana-Entra-Role-Assignment-Verified.png` | Grafana profile shows AzureAD-synced account and **Viewer** role, VPN client address | Not a Grafana admin assignment |
| `P14-13-Entra-Grafana-Authorized-User-Assignment.png` | Enterprise application has explicit user assignment, role Default Access | Does not by itself show enforcement |
| `P14-14-Entra-Grafana-Assignment-Required-Enabled.png` | Assignment required = Yes with successful Entra properties update | Unassigned negative sign-in test remains outstanding |
| `P14-17-Microsoft-MyApps-Grafana-SSO-Tile.png` | Official Grafana-branded My Apps tile appears for assigned user | Does not prove launch until paired with P14-18 |
| `P14-18-Microsoft-MyApps-Grafana-SSO-Launch-Success.png` | Selecting tile opened Grafana dashboard | Could reuse an existing authenticated session |
| `P14-19-MyApps-Grafana-AzureAD-Session-Verified.png` | Current and prior Grafana sessions display AzureAD provider, Viewer role | Does not guarantee fresh login on every tile click |

## Command validation documented in accompanying case study

- Grafana service active; `curl https://grafana.ad.jeremyfontenot.online:3000/api/health` returned `database: ok`, version 13.3.0.
- `certbot renew --dry-run --run-deploy-hooks` succeeded and emitted `Grafana TLS certificate deployment completed successfully.`
- `cmp` checks showed deployed certificate chain and private key copies matched current Let's Encrypt files, with permissions scoped to `root:grafana`.
- Entra application assignment and Viewer role verified in screenshots.

## Integrity requirements before final sign-off

1. Upload the actual selected PNG bytes, preserving original images when safe; sanitize only if necessary and label any redaction.
2. Confirm HTTP 200 and proper `image/png` content for each public proof link.
3. Inspect screenshots visually for sensitive data and ensure they actually demonstrate the associated claim.
4. Commit the proof files alongside updates to this register and the case-study links.
5. Only then upgrade evidence status from `pending` to `published`.
