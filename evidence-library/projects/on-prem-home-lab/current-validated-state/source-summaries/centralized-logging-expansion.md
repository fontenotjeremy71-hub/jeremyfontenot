# Centralized Logging Expansion Change Plan

## Status

Planned. Approval required before implementation.

## Current State

June 24 documentation records pfSense forwarding selected system, firewall, authentication, VPN, and gateway events to Linux01 at `10.10.30.20:514`, with Linux01 rsyslog listeners and alert-match logging. Current Proxmox metadata validates Linux01 is running on VLAN 30 and QEMU guest agent is responding.

The June 26 authenticated Linux01 target-local inventory validates rsyslog runtime state from inside the guest. Linux01 reports rsyslog active, TCP and UDP 514 listening on `10.10.30.20`, remote collector configuration under `/etc/rsyslog.d/10-remote-collector.conf`, pfSense alert file configuration under `/etc/rsyslog.d/05-pfsense-alerts.conf`, and rsyslog logrotate configuration under `/etc/logrotate.d/rsyslog`.

## Evidence

- Proxmox current API: Linux01 VM 400 running, `tag=30`, guest agent responding.
- DNS current command: `linux01.ad.jeremyfontenot.online` resolves to `10.10.30.20`.
- June 24 IP-address-documented documentation: pfSense-to-Linux01 rsyslog forwarding and alert logging documented.
- Current reachability check: TCP 514 from the current client path timed out and is not treated as rsyslog service failure.
- `inventories/linux01-inventory-20260626-020257.json`: SSH from the management execution path timed out; guest-side rsyslog state was `NOT TESTED`.
- `inventories/linux01-inventory-20260626-084312.json`: authenticated target-local Linux01 inventory validates rsyslog service/listener state, route/DNS state, AD integration indicators, disk capacity, and logrotate summary.
- `evidence/linux01-local-inventory-validation-20260626-035220.md`: sanitized evidence for Linux01 target-local inventory import and validation.

## Target State

Expand centralized logging beyond pfSense by adding documented, least-privilege log forwarding or collection for Windows and Proxmox sources without weakening existing firewall policy.

Candidate target design, pending implementation approval:

- Keep Linux01 as the primary syslog receiver because target-local evidence now confirms available root filesystem capacity, active rsyslog listeners on `10.10.30.20:514` for TCP and UDP, and rsyslog log rotation. UFW source restrictions still require a clearer privileged summary before any new source is added.
- Evaluate Windows Event Forwarding for DC01 and WS01 with DC01 as the likely Windows Event Collector only if existing domain policy and firewall posture support it safely. Do not make DC01 a collector until a separate change plan covers subscription type, source computers, event channels, retention, and rollback.
- Evaluate Proxmox remote syslog forwarding to Linux01 or another approved receiver only after documenting source IP, destination IP, protocol, port, and retention.
- Keep Linux local logs on Linux01 in local journald/rsyslog paths unless an approved monitoring platform is introduced.

## Exact Systems

- Linux01 VM 400
- DC01 VM 200
- WS01 VM 300
- Proxmox host `192.168.0.242`
- pfSense VM 100

## Exact Commands

Discovery and planning only until approved:

```powershell
pwsh -NoProfile -File .\scripts\linux\Get-LinuxReadOnlyInventory.ps1
pwsh -NoProfile -File .\scripts\active-directory\Invoke-DC01LocalReadOnlyCollection.ps1
pwsh -NoProfile -File .\scripts\windows-server\Invoke-WS01LocalReadOnlyCollection.ps1
```

Implementation commands are intentionally not authorized in this change plan. Linux01 rsyslog state has been validated, but Windows Event Forwarding, Proxmox logging state, pfSense sender configuration, and any firewall or GPO requirements still need a dedicated approved implementation plan.

Target-local validation commands prepared for the next inventory pass:

```bash
run_id="$(date -u +%Y%m%d-%H%M%S)"
bash ./Invoke-Linux01LocalReadOnlyCollection.sh "/tmp/linux01-inventory-${run_id}.json"
```

## Required Privileges

- Read-only collection: existing approved sessions.
- Any logging configuration change: administrative privileges on the target system and explicit approval.

## Network Requirements

No firewall openings are approved by this plan. Any proposed log path must identify source, destination, protocol, port, and existing firewall state before implementation.

Expected network review before implementation:

- pfSense to Linux01 syslog path: verify existing source restriction, protocol, and port from configuration evidence before changing anything.
- DC01 and WS01 to collector: identify whether Windows Event Forwarding uses existing domain/Kerberos paths or requires new firewall scope. Any firewall or GPO change requires a dedicated approved plan.
- Proxmox to Linux01 syslog: document management-network source, Linux VLAN destination, routing path, and firewall requirements before implementation.

## Security Impact

Positive if implemented carefully: stronger audit trail and troubleshooting visibility. Risk if overbroad: excessive log exposure, sensitive log retention, or unnecessary inter-network access.

Security controls required in the implementation plan:

- Exclude credentials, private keys, Kerberos tickets, certificate private material, and sensitive raw log excerpts from repository evidence.
- Prefer source-restricted firewall rules over broad subnet acceptance if any new rules are approved.
- Document whether logs are unauthenticated syslog, authenticated Windows Event Forwarding, or locally collected files.
- Define integrity expectations honestly; plain syslog improves visibility but does not provide strong transport integrity by itself.

## Service-Impact Risk

Low for discovery. Medium for configuration changes because logging service reloads or firewall changes could disrupt visibility or access if done incorrectly.

Implementation must avoid service restarts unless the approved plan explicitly requires them. Prefer configuration validation and reload-only workflows where technically appropriate.

## Retention, Rotation, and Capacity

Linux01 authenticated inventory currently supports:

- Root filesystem capacity: 19 GiB total, 13 GiB available, 29 percent used.
- Current rsyslog listener state: TCP and UDP 514 listening on `10.10.30.20`.
- Current rsyslog destination templates/configuration: `/var/log/remote/%FROMHOST-IP%/messages.log` and `/var/log/remote/pfsense-alerts.log` are configured.
- Current logrotate policy for rsyslog-managed files: weekly rotation, four rotations, compression, missing files tolerated, empty files skipped.
- Disk-use alert threshold. Initial planning threshold: warning at 80 percent used, critical at 90 percent used, pending Jeremy approval.
- Failure behavior if Linux01 is unavailable: sources should continue local logging and must not block authentication, DNS, DHCP, routing, or VM operation.

## Alerting

Alerting remains planned. Candidate non-invasive alerts after receiver validation:

- Linux01 log filesystem above threshold.
- rsyslog service inactive.
- No pfSense log receipt within an expected interval.
- Proxmox backup job failure or missing latest backup.
- Windows Event Forwarding subscription source inactive, if WEF is later approved.

## Validation

- Confirm log sender service state.
- Confirm listener state on Linux01.
- Send one controlled non-sensitive test event.
- Confirm event arrives in the expected file or index.
- Confirm no credentials or private data are written to repository evidence.

## Rollback

- Revert only the logging configuration added by the approved implementation.
- Restore any exported pre-change configuration where applicable.
- Restart/reload only affected logging services if required and approved.

## Evidence Capture

- Timestamped pre-change inventory.
- Sanitized configuration diff or export.
- Exact command transcript with secrets omitted.
- Controlled test-event result.
- Rollback verification.

## Approval Requirement

Explicit Jeremy approval is required before any logging configuration, firewall, service, package, or scheduled-task change.

## Claim Boundary

This plan is implementation-ready documentation only. It does not implement centralized logging expansion, change firewall policy, install software, restart services, or modify any infrastructure system. Linux01 rsyslog receiver state is now validated by target-local inventory; additional sources and alerting remain planned until separately approved and implemented.
