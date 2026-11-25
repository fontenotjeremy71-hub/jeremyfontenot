# pfSense

## Firewall and Routing Platform

I use pfSense as VM 100 on Proxmox VE. I connect its WAN and LAN virtual interfaces through `vmbr0` and `vmbr1` and use pfSense as the routing and firewall platform for my lab networks.

| VM setting | Allocation |
|---|---|
| VMID | 100 |
| vCPU | 2 |
| Memory | 4 GB |
| Disk | 32 GB |
| Proxmox bridges | vmbr0 and vmbr1 |

## Network Interfaces

| Network interface or segment | Address | Purpose |
|---|---|---|
| WAN | 192.168.0.205 | I connect pfSense to the upstream 192.168.0.0/24 network |
| Core LAN | 10.10.20.1/24 | I use this as the default gateway for DC01, WS01, and core Windows services |
| Linux VLAN | 10.10.30.1/24 | I use this as the gateway for Linux01 on VLAN 30 |
| OpenVPN | 10.10.40.0/24 | I use this network for remote administrative clients |

## Routing and Network Segmentation

I use pfSense to route traffic between the core LAN and Linux VLAN. I keep the Windows infrastructure on `10.10.20.0/24` and Linux01 on `10.10.30.0/24`, with pfSense providing the gateway for each network.

I connect the WAN interface to the upstream network through `vmbr0`. I connect the internal LAN and VLAN-aware guest network through `vmbr1`.

## OpenVPN Remote Access

I use pfSense OpenVPN remote access to connect my administration workstation to the lab. I assign VPN clients addresses from `10.10.40.0/24` and use `10.10.40.1` as the tunnel-side gateway for routes into the internal networks.

## Centralized Logging

I configure pfSense to forward selected system, firewall, authentication, VPN, and gateway events to Linux01 at `10.10.30.20` on port `514`. I use Linux01 rsyslog to receive and organize those messages.

## Backup Integration

I include pfSense VM 100 in the Proxmox backup job `backup-critical-lab-vms`, which uses snapshot mode, zstd compression, and the `backup-hdd` storage target.

## Evidence

- [Proxmox platform inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-platform-inventory.md)
- [Home lab network inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/source-summaries/home-lab-inventory-validation.md)
- [Proxmox network bridge configuration](../../../evidence-library/projects/on-prem-home-lab/validated-2026-06-21/text/proxmox-network-validation-sanitized.txt)
- [Linux01 rsyslog configuration record](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/source-summaries/centralized-logging-expansion.md)
