# WS01 System and Domain Validation

## Claim supported

Direct WS01 inventory and Proxmox inventory support the WS01 system, VM association, domain membership, and network-state claims for the personal nonproduction lab.

## Directly observed values

- Proxmox VM association: VM 300 name ws01, running.
- Windows edition: Microsoft Windows 10 Pro.
- Windows version: 10.0.19045.
- Windows build: 19045.
- Domain membership: WS01 is part of domain ad.jeremyfontenot.online.
- Secure channel result: true.
- Network interface: Ethernet.
- IPv4 address: 10.10.20.100.
- Default gateway: 10.10.20.1.
- DNS server: 10.10.20.10.
- DHCP enabled: true.
- DHCP server: 10.10.20.10.
- Current supported OS reconciliation: Windows 10 Pro 10.0.19045 is the supported current value in the retained WS01 inventory.

## Source command or source object

- Authenticated WS01 target-local inventory result objects: OperatingSystem, NetworkConfiguration, DomainMembership, and SecureChannel.
- Proxmox read-only inventory object: `virtualMachines[]` entry for VM 300.

## Source repository

fontenotjeremy71-hub/jeremy-homelab-ops

## Source commit

fb6c286873285778d88d6d5cfde0b9bd00b96f36

## Source path

- `inventories/ws01-inventory-20260626-012952.json`
- `inventories/proxmox-inventory-20260626-010601.json`

## Source file SHA-256

- `inventories/ws01-inventory-20260626-012952.json`: 1438FA0F72F241E2613C5D35B797492FFC754B0E818A74154DE38DD74082A6B1
- `inventories/proxmox-inventory-20260626-010601.json`: D652D1EF753E14242C07F84F19FBF09F642F07C3B09CFE2E98AA7F2B176ADE3D

## Public artifact SHA-256

Recorded in `evidence-library/integrity/evidence-hashes.json` for this artifact path. The self-hash is recorded outside this file so the digest does not invalidate itself.

## Sanitization performed

Removed executing account, local administrator membership, SIDs, GUIDs, group policy raw details, software inventory, unrelated services, event data, and local profile or path information.

## Limitations

- Personal nonproduction home lab only.
- Captured-state evidence only.
- This artifact validates WS01 inventory values and domain membership state only.
- It does not claim production support, employer-system administration, complete endpoint hardening, or complete application/service validation.

## Validation date

2026-06-30

## Classification

Validated
