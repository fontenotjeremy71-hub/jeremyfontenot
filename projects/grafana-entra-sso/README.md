# Project 14 — Grafana OSS + Microsoft Entra SSO
**Environment:** Personal lab, October 31, 2026. **Status:** VALIDATED — Linux application administration, HTTPS, Microsoft Entra SSO, Viewer authorization, enterprise application assignment, and My Apps integration demonstrated with nineteen published original screenshots.

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

The [skill validation record](validation.md) links demonstrated configuration and results to original screenshots and the retained interactive lab record.
1. Fixed missing OpenVPN route to VLAN 30, then resolved SSH UFW restriction.
2. AD account login to Ubuntu via SSSD and sudo access validated.
3. Grafana installed from signed APT repository; `/api/health` reports database `ok` and version 13.3.0.
4. Let's Encrypt cert issued 2026-10-31, expires 2027-01-29. Browser login screen loaded via HTTPS without warning.
5. HTTPS configured with root-owned certificate copies restricted to Grafana group. Local Grafana login retained.
6. Microsoft Entra consent + OAuth redirect reached authenticated Grafana dashboard. Profile showed AzureAD identity provider, synchronized UPN, Viewer role; app name does not grant Grafana admin.
7. Entra app required explicit assignment; tested user's Default Access assignment confirmed; My Apps branded tile visible and launched dashboard.
8. Certbot renewal dry-run and `--run-deploy-hooks` succeeded; the deployment hook logged success; local `cmp` checks confirmed certificate and private-key copies matched source.

## Skills demonstrated

- Linux domain-account access, identity/group resolution, SSH administration, and systemd service management.
- Trusted HTTPS, Let’s Encrypt issuance, scoped Cloudflare DNS-01 permissions, and certificate lifecycle administration.
- Microsoft Entra single-tenant application registration and OAuth/OIDC integration with Grafana.
- AzureAD identity synchronization, Viewer authorization, and explicit enterprise application assignment.
- Microsoft My Apps branding, application discovery, launch workflow, and authenticated-session verification.
- Technical troubleshooting, source preservation, and reproducible evidence documentation.

The screenshots demonstrate the retained application and configuration results. The interactive lab record documents successful command validation, including the certificate-renewal simulation and deployment hook.

## Evidence provenance and privacy
This document reflects screenshots and command output provided during an interactive configuration session on October 31, 2026. Nineteen original PNGs are included without redaction; the owner authorized identifiers and internal IP addresses. The [integrity manifest](evidence-manifest.json) records their received filenames, hashes, claims, categories, and URLs. All 82 source PNG members were reviewed and the original UUID mapping recovered by SHA-256 identity. Command-based validation is attributed to the retained interactive lab record.
