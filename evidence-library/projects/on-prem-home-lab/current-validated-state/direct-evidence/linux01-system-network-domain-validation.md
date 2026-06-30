# Linux01 System, Network, and Domain Validation

## Claim supported

Direct Linux01 inventory, Proxmox inventory, and source reconciliation evidence support Linux01 VM association, Ubuntu version, kernel, VLAN, IP addressing, DNS, gateway, current-versus-historical address boundary, and directly proven domain integration state.

## Directly observed values

- Proxmox VM association: VM 400 name linux01, running.
- Operating system: Ubuntu 26.04 LTS.
- Kernel: Linux 7.0.0-22-generic.
- Architecture: x86_64.
- VLAN: 30, from current source reconciliation.
- Interface state: ens18 UP.
- Current IPv4 address: 10.10.30.20/24.
- Default gateway: 10.10.30.1.
- DNS server: 10.10.20.10.
- DNS domain: ad.jeremyfontenot.online.
- Current-versus-historical boundary: current Linux01 address is 10.10.30.20/24; older Linux01 10.10.20.x evidence is historical.
- Domain integration state: realmd reports ad.jeremyfontenot.online configured as a Kerberos member, server software active-directory, client software SSSD, and domain identity resolution returned `resolved`.
- Kerberos configuration: present.

## Source command or source object

- Authenticated Linux01 target-local inventory result objects: Distribution, Kernel, IP addresses, Routes, DNS, realmd, Domain identity resolution, and Kerberos config.
- Proxmox read-only inventory object: `virtualMachines[]` entry for VM 400.
- Source reconciliation table for Linux01 VLAN and current-versus-historical address boundary.

## Source repository

fontenotjeremy71-hub/jeremy-homelab-ops

## Source commit

fb6c286873285778d88d6d5cfde0b9bd00b96f36

## Source path

- `inventories/linux01-inventory-20260626-084312.json`
- `inventories/proxmox-inventory-20260626-010601.json`
- `evidence/home-lab-source-reconciliation-20260626-012606.md`

## Source file SHA-256

- `inventories/linux01-inventory-20260626-084312.json`: 75F82AF4882FA9C869C78C1AC127C5D4F37C5CB62F4E8894361A352695EFC40D
- `inventories/proxmox-inventory-20260626-010601.json`: D652D1EF753E14242C07F84F19FBF09F642F07C3B09CFE2E98AA7F2B176ADE3D
- `evidence/home-lab-source-reconciliation-20260626-012606.md`: 2D377A7A6703F8C3C5FBB77AA093569806DDB7939CFA88FD6A0ECF801484C3EE

## Public artifact SHA-256

Recorded in `evidence-library/integrity/evidence-hashes.json` for this artifact path. The self-hash is recorded outside this file so the digest does not invalidate itself.

## Sanitization performed

Removed executing account, machine identifiers, link-local IPv6 address, raw boot/session identifiers, unrelated package/service details, unnecessary filesystem paths, and distro metadata not needed for the public claim.

## Limitations

- Personal nonproduction home lab only.
- Captured-state evidence only.
- Domain integration is limited to the directly observed realmd, SSSD client, Kerberos config, and identity-resolution indicators.
- This artifact does not claim that all Linux domain-authentication paths were tested.
- Timeout or listener observations are not complete firewall validation.

## Validation date

2026-06-30

## Classification

Validated
