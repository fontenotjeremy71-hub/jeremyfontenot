# Home Lab Operations Validation - June 26, 2026

## Scope

This public evidence summary describes Jeremy Fontenot's personal, nonproduction on-premises home lab. It is a sanitized portfolio artifact derived from the separate private operations repository `jeremy-homelab-ops`.

The source operations repository remained private because it contains target-local inventories, operational diagnostics, and environment-specific collection details. This public summary intentionally excludes raw inventories, raw event logs, full service configuration files, local workstation paths, authentication attempts, ticket-cache identifiers, secrets, keys, tokens, cookies, and private user details.

## Current Supported Architecture

| Component | Supported public state |
|---|---|
| Physical host | Dell PowerEdge R710 |
| Hypervisor | Proxmox VE 9.2.3 |
| pfSense | VM 100 |
| Core LAN gateway | 10.10.20.1/24 |
| Linux VLAN gateway | 10.10.30.1/24 |
| OpenVPN network | 10.10.40.0/24 |
| DC01 | VM 200, Windows Server 2022, 10.10.20.10/24 |
| AD domain | ad.jeremyfontenot.online |
| NetBIOS domain | JFAD |
| WS01 | VM 300, Windows 10 Pro 10.0.19045 build 19045, 10.10.20.100/24 |
| Linux01 | VM 400, Ubuntu 26.04 LTS, kernel 7.0.0-22-generic, 10.10.30.20/24, VLAN tag 30 |

Linux01 is supported as a VLAN 30 Ubuntu domain member with gateway 10.10.30.1, DNS 10.10.20.10, SSH active and listening, rsyslog active with TCP and UDP 514 listening on 10.10.30.20, QEMU guest agent configured and responding, and AD identity resolution validated.

The scheduled Proxmox backup job includes VMs 100, 200, 300, and 400. Retained June 24 documentation records isolated WS01 and Linux01 startup restore checks. Those checks do not establish recurring disaster-recovery assurance, RTO, or RPO.

## Authenticated Inventory Validation

The private operations repository contains authenticated target-local inventory validation for:

- DC01 guest operating system, AD domain, NetBIOS domain, DNS/DHCP/GPO inventory, critical service state, and summary event health.
- WS01 Windows 10 Pro guest state, domain membership, secure channel, addressing, gateway, DNS, critical service state, and summary event health.
- Linux01 Ubuntu guest state, VLAN 30 addressing, gateway, DNS, time sync, SSH, rsyslog, QEMU guest agent, realmd/SSSD/Kerberos indicators, AD identity resolution, AppArmor, automatic updates, and security-update status.

Only summarized, recruiter-readable claims are published here. Raw target-local JSON inventories remain excluded from the public website.

## Read-Only Operations Framework

The validated operations repository demonstrates:

- Git-based change tracking.
- Architecture documentation.
- Change plans.
- Recovery documentation.
- Runbooks.
- Read-only inventory collectors.
- Target-local collection packages.
- Monitoring scripts.
- Structured inventories.
- Timestamped evidence.
- Repository validation.
- Portfolio drift validation.
- Policy-aware connectivity validation.
- PowerShell parser validation.
- JSON parse validation.
- Bash syntax validation.
- Explicit claim boundaries.
- Rollback documentation.

## Validation Results

The source operations repository was validated at commit `3d42a4808a6a0607d78f4f4e7fd1e71783729a6b`.

Required operations validation scripts passed:

```powershell
pwsh -NoProfile -File .\tests\Test-RepositoryStructure.ps1
pwsh -NoProfile -File .\tests\Test-HomeLabBaselineFramework.ps1
pwsh -NoProfile -File .\tests\Test-PortfolioHomeLabDrift.ps1
```

The public website update was built from those validated results and from the Linux01 remediation commit `f2a8802`.

## Linux01 SSSD Remediation

Initial classification: SSSD responder activation conflict.

Initial condition:

- Direct responders were configured.
- `sssd-nss.socket`, `sssd-pam.socket`, and `sssd-pac.socket` were enabled and failed.
- `config_file_version = 2` was rejected by SSSD 2.12 validation.

Controlled remediation:

- A preserved backup and rollback path were created first.
- Only the rejected directive was removed.
- Conflicting responder sockets were disabled.
- SSSD was restarted.
- Historical failed-unit state was cleared.

Post-remediation validation:

- `sssd.service` enabled.
- `sssd.service` active.
- Zero failed systemd units.
- NSS, PAM, and PAC responder sockets disabled as intended.
- SSSD configuration validation passed.
- AD identity lookup passed.
- A completely new AD-authenticated SSH session passed.

Diagnostic hashes:

| Phase | SHA-256 |
|---|---|
| Pre-remediation | 3CAD0FB73202D777D41DEE40D6F4D19D4019B9AD30552B37970B55A5CA5AB3BB |
| Post-remediation | FD55604BFB94487B86FBF631703FA995B9726471689385CCB2D277492AA7CBEE |

The public site does not publish the root backup path, raw diagnostic JSON, complete SSSD configuration, private ticket-cache data, or authentication attempt details.

## Commit Traceability

- Operations repository validated endpoint: `3d42a4808a6a0607d78f4f4e7fd1e71783729a6b`
- Linux01 SSSD remediation commit: `f2a8802`

## Limitations

- This is a personal lab only, not a client, employer, production, business, or enterprise-scale claim.
- Raw private inventories and raw event logs are not public.
- TCP reachability is not complete service validation.
- The read-only baseline does not authenticate to remote systems or prove administrative access.
- Retained isolated restore startup checks do not prove recurring disaster-recovery assurance, RTO, or RPO.
- Historical June 21 evidence and retained June 24 documentation remain separate evidence layers from this Current operations validation.
