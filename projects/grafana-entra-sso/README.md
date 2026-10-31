# Project 14 — Grafana OSS + Microsoft Entra SSO
**Environment:** Personal nonproduction lab, October 31, 2026. **Status:** Core authentication and HTTPS workflows validated; nineteen original screenshot artifacts published in this release. Renewal/health-output and exact callback proof plus a negative access test remain outstanding.

## Objective
Use Grafana OSS as a real self-hosted relying-party application to demonstrate Microsoft Entra OAuth 2.0 / OIDC SSO, least-privilege authorization, private-network access, and a trusted TLS deployment with automatic certificate-renewal simulation.

## Components
- LINUX01: Ubuntu 26.04 LTS, 10.10.30.20 (Linux VLAN 30), Grafana OSS 13.3.0, systemd service.
- DC01: Active Directory DNS A record `grafana.ad.jeremyfontenot.online -> 10.10.30.20`.
- LT-JF01: Windows workstation, OpenVPN client 10.10.40.2, Edge.
- UFW: Grafana TCP 3000 and SSH TCP 22 permitted from VPN 10.10.40.0/24. Historical SSH rule from 10.10.20.0/24 retained.
- Let's Encrypt: Cloudflare DNS-01 ACME issuance, trusted HTTPS, Certbot deploy hook.
- Microsoft Entra app registration: `Grafana-OSS-SSO-Lab`, single tenant, client ID `b4506cbe-a7f8-454a-9995-295d22d6ab37`, tenant ID `c5c35630-13b6-4e04-b403-65f725a22494`.
- Callback: `https://grafana.ad.jeremyfontenot.online:3000/login/azuread`.
- Grafana uses restricted file-provider client-secret storage. No credential values should enter the repository.

## Validated in the interactive lab record

The following is retained session documentation, not newly executed commands. The [validation matrix](validation.md) distinguishes direct screenshot proof from documented command results.
1. Fixed missing OpenVPN route to VLAN 30, then resolved SSH UFW restriction.
2. AD account login to Ubuntu via SSSD and sudo access validated.
3. Grafana installed from signed APT repository; `/api/health` reports database `ok` and version 13.3.0.
4. Let's Encrypt cert issued 2026-10-31, expires 2027-01-29. Browser login screen loaded via HTTPS without warning.
5. HTTPS configured with root-owned certificate copies restricted to Grafana group. Local Grafana login retained.
6. Microsoft Entra consent + OAuth redirect reached authenticated Grafana dashboard. Profile showed AzureAD identity provider, synchronized UPN, Viewer role; app name does not grant Grafana admin.
7. Entra app required explicit assignment; tested user's Default Access assignment confirmed; My Apps branded tile visible and launched dashboard.
8. Certbot renewal dry-run and `--run-deploy-hooks` succeeded; the deployment hook logged success; local `cmp` checks confirmed certificate and private-key copies matched source.

## Limitations / next verification
- **Outstanding:** negative sign-in test with a separate unassigned Entra account. Do not claim unassigned access was empirically denied.
- **Published:** nineteen reviewed original screenshots in [the evidence register](SCREENSHOT-EVIDENCE-REGISTER.md), preserved byte-for-byte. All 82 archive members were reviewed. Service status, certificate issuance, HTTPS access, app-registration overview, launch branding and scoped DNS permissions now have direct proof. Exact redirect-URI, health, and renewal-hook output screenshots remain absent.
- **Not proven:** a future real renewal, automatic launch-time fresh re-authentication, external/public access, uptime SLA, enterprise fleet scale, Grafana administrator entitlement for the Entra user.
- A static VPN route was created in Windows ActiveStore. Long-term VPN route push / persistence is a separate infrastructure improvement.
- Never commit `/etc/grafana/secrets/entra-client-secret`, Cloudflare API token files, `privkey.pem`, OAuth tokens, or unredacted secrets.

## Evidence provenance and privacy
This document reflects screenshots and command output provided during an interactive configuration session on October 31, 2026. Nineteen original PNGs are included without redaction; the owner authorized identifiers and internal IP addresses. The [integrity manifest](evidence-manifest.json) records their received filenames, hashes, claims, categories, and URLs. All 82 source PNG members were reviewed and the original UUID mapping recovered by SHA-256 identity. The exact commands and values not retained in this repository are source-reported, not reconstructed logs.
