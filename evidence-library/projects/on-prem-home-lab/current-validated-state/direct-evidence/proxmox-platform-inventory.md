# Proxmox Platform Inventory

## Claim supported

Direct Proxmox inventory supports the personal nonproduction lab platform claim for Proxmox VE, primary VM IDs, VM names, running state, allocated vCPU, memory, disk, bridge placement, guest-agent state, and Linux01 VLAN tag where captured.

## Directly observed values

- Proxmox VE version: 9.2.3.
- Proxmox kernel: Linux 7.0.12-1-pve.
- VM 100: pfsense-fw, running, 2 vCPU, 4 GB memory, 32 GB disk, bridges vmbr0 and vmbr1, guest agent not configured and not responding.
- VM 200: dc01, running, 2 vCPU, 4 GB memory, 80 GB disk, bridge vmbr1, guest agent not configured and not responding.
- VM 300: ws01, running, 2 vCPU, 4 GB memory, 80 GB disk, bridge vmbr1, guest agent not configured and not responding.
- VM 400: linux01, running, 2 vCPU, 2 GB memory, 40 GB disk, bridge vmbr1, guest agent configured and responding.
- Linux01 VLAN tag: 30, from the retained source reconciliation record.

## Source command or source object

- Proxmox read-only inventory object: `version`, `node.kernel`, `virtualMachines[]`, and `storage[]`.
- Source reconciliation object: current command/API evidence row for Linux01 Proxmox VM tag.

## Source repository

fontenotjeremy71-hub/jeremy-homelab-ops

## Source commit

fb6c286873285778d88d6d5cfde0b9bd00b96f36

## Source path

- `inventories/proxmox-inventory-20260626-010601.json`
- `evidence/home-lab-source-reconciliation-20260626-012606.md`

## Source file SHA-256

- `inventories/proxmox-inventory-20260626-010601.json`: D652D1EF753E14242C07F84F19FBF09F642F07C3B09CFE2E98AA7F2B176ADE3D
- `evidence/home-lab-source-reconciliation-20260626-012606.md`: 2D377A7A6703F8C3C5FBB77AA093569806DDB7939CFA88FD6A0ECF801484C3EE

## Public artifact SHA-256

Recorded in `evidence-library/integrity/evidence-hashes.json` for this artifact path. The self-hash is recorded outside this file so the digest does not invalidate itself.

## Sanitization performed

Removed node uptime, repository ID, host resource details not needed for the public claim, snapshot parent names, raw paths unrelated to the platform claim, and any fields not required to prove the listed inventory values.

## Limitations

- Personal nonproduction home lab only.
- Captured-state evidence only; this does not prove ongoing availability.
- Proxmox inventory does not prove guest operating-system health, pfSense firewall policy, Active Directory health, backup restore integrity, or Windows service state.
- Linux01 VLAN tag is supported by the reconciliation source, not by the VM list object alone.

## Validation date

2026-06-30

## Classification

Validated
