# pfSense

## Firewall and Routing Platform

I configured pfSense as VM 100 on Proxmox VE. I connected its WAN and LAN virtual interfaces through `vmbr0` and `vmbr1` and used pfSense as the routing and firewall platform for my lab networks.

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
| WAN | 192.168.0.205 | I connected pfSense to the upstream 192.168.0.0/24 network |
| Core LAN | 10.10.20.1/24 | I used this as the default gateway for DC01, WS01, and core Windows services |
| Linux VLAN | 10.10.30.1/24 | I used this as the gateway for Linux01 on VLAN 30 |
| OpenVPN | 10.10.40.0/24 | I configured this network for remote administrative clients |

## Routing and Network Segmentation

I configured pfSense to route traffic between the core LAN and Linux VLAN. I placed the Windows infrastructure on `10.10.20.0/24` and Linux01 on `10.10.30.0/24`, with pfSense providing the gateway for each network.

I connected the WAN interface to the upstream network through `vmbr0`. I connected the internal LAN and VLAN-aware guest network through `vmbr1`.

## OpenVPN Remote Access

I configured pfSense OpenVPN remote access to connect my Windows 11 administration workstation to the lab. I assigned VPN clients addresses from `10.10.40.0/24` and used `10.10.40.1` as the tunnel-side gateway for routes into the internal networks.

## Centralized Logging

I configured pfSense to forward selected system, firewall, authentication, VPN, and gateway events to Linux01 at `10.10.30.20` on port `514`. I configured Linux01 rsyslog to listen for those events and define destination paths.

## Backup Integration

I included pfSense VM 100 in the Proxmox backup job `backup-critical-lab-vms`, which uses snapshot mode, zstd compression, and the `backup-hdd` storage target.

## Evidence

- [Proxmox platform inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-platform-inventory.md)
- [Home lab network inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/source-summaries/home-lab-inventory-validation.md)
- [Proxmox network bridge configuration](../../../evidence-library/projects/on-prem-home-lab/validated-2026-06-21/text/proxmox-network-validation-sanitized.txt)
- [Linux01 target-local inventory validation](https://github.com/fontenotjeremy71-hub/jeremy-homelab-ops/blob/main/evidence/linux01-local-inventory-validation-20260626-035220.md)
