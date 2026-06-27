# Home Lab Source of Truth

## Status

Current as of the 2026-06-26 read-only reconciliation run.

## Source Precedence

1. Current command output, API output, guest-agent output, or authenticated system query.
2. New timestamped evidence collected during this run.
3. Current `jeremy-homelab-ops` inventories and evidence.
4. Current `main` branch of `fontenotjeremy71-hub/jeremyfontenot`.
5. June 24, 2026 IP-address-documented portfolio documentation.
6. June 21, 2026 curated historical evidence.
7. Currently deployed website content.
8. Old prompts, summaries, assumptions, or undocumented memory.

## Current Supported Architecture

| Component | Current supported value | Classification | Evidence |
|---|---|---|---|
| Physical host | Dell PowerEdge R710 | Current documentation | Portfolio and operations docs |
| Hypervisor | Proxmox VE `9.2.3` | Current | Proxmox API |
| Proxmox management | `192.168.0.242/24`, gateway `192.168.0.1` | Current | Proxmox API and TCP validation |
| pfSense | VM 100 `pfsense-fw` | Current | Proxmox API |
| pfSense WAN | `192.168.0.205/24` | Current documentation, not re-queried from pfSense | June 24 DOCX |
| pfSense LAN | `10.10.20.1/24` | Current documentation | June 24 DOCX and topology |
| Linux VLAN gateway | `10.10.30.1/24` | Current documentation | June 24 DOCX |
| OpenVPN network | `10.10.40.0/24` | Current documentation plus route evidence | June 24 DOCX and local route |
| DC01 | VM 200, `10.10.20.10/24`, Windows Server 2022 domain controller | Current authenticated guest inventory | Proxmox API, DNS/RDP validation, `inventories/dc01-inventory-20260626-022543.json` |
| WS01 | VM 300, `10.10.20.100/24`, Windows domain workstation | Current authenticated guest inventory | Proxmox API, `inventories/ws01-inventory-20260626-012952.json` |
| Linux01 | VM 400, `10.10.30.20/24`, VLAN 30, Ubuntu 26.04 LTS domain member | Current authenticated guest inventory | Proxmox API, DNS validation, `inventories/linux01-inventory-20260626-084312.json` |
| AD domain | `ad.jeremyfontenot.online` | Current authenticated guest inventory | DC01 target-local inventory, 2026-06-26 |
| NetBIOS domain | `JFAD` | Current authenticated guest inventory | DC01 target-local inventory, 2026-06-26 |
| Backup storage | `backup-hdd` at `/mnt/pve/backup-hdd` | Current | Proxmox API |
| Backup job | `backup-critical-lab-vms`, Sunday 02:00, snapshot, zstd, VMs 100/200/300/400 | Current | Proxmox API |

## Historical or Stale Values

| Value | Classification | Current handling |
|---|---|---|
| Linux01 `10.10.20.20/24` | Historical | Retained as pre-VLAN 30 address only |
| Linux01 DHCP `10.10.20.101` | Historical | Retained as initial setup address only |
| `backup-nvme` or `/mnt/pve/backup-nvme` | Stale or inconclusive | Not current unless future evidence proves rename/replacement |
| Direct WAN-side RDP forwarding | Historical | Current design uses OpenVPN-only RDP path |
| June 21 restore outstanding limitation | Historical | Superseded by June 24 isolated restore documentation, not re-run during this ops pass |

## Claim Boundary

This file corrects explanatory documentation using current evidence. It does not modify historical evidence and does not claim live guest OS internals unless current command output or explicitly cited retained evidence supports the claim.

The June 26 target-local workflow imported authenticated DC01 evidence in `inventories/dc01-inventory-20260626-022543.json` and `evidence/dc01-local-inventory-validation-20260626-022811.md`. It imported authenticated WS01 evidence in `inventories/ws01-inventory-20260626-012952.json` and `evidence/ws01-local-inventory-validation-20260626-033405.md`. It also imported authenticated Linux01 evidence in `inventories/linux01-inventory-20260626-084312.json` and `evidence/linux01-local-inventory-validation-20260626-035220.md`.
