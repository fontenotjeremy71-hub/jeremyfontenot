# Network Reference

I use this reference for the IP networks, gateways, host addresses, and service endpoints in my lab.

## Network Addressing

| Network or system | Address | Purpose |
|---|---|---|
| Upstream network | 192.168.0.0/24 | Upstream segment for Proxmox management and pfSense WAN |
| Upstream gateway | 192.168.0.1 | Default gateway for the Proxmox host |
| Proxmox management | 192.168.0.242/24 | Proxmox host management address on vmbr0 |
| pfSense WAN | 192.168.0.205 | Firewall WAN address on the upstream network |
| Core LAN | 10.10.20.0/24 | Windows infrastructure and core services |
| pfSense core gateway | 10.10.20.1 | Default gateway for the core LAN |
| DC01 | 10.10.20.10 | Domain controller, DNS, and DHCP server |
| WS01 | 10.10.20.100 | Domain-joined Windows client |
| MACVM01 | 10.10.20.101 | macOS Monterey virtual machine integrated with Active Directory |
| HVHOST01 | 10.10.20.102 | Hyper-V management host |
| SYNC01 | 10.10.20.105 | Microsoft Entra synchronization implementation host |
| Linux VLAN 30 | 10.10.30.0/24 | Linux infrastructure network |
| pfSense Linux gateway | 10.10.30.1 | Default gateway for Linux VLAN 30 |
| Linux01 | 10.10.30.20/24 | Ubuntu Linux system and rsyslog receiver |
| VPN network | 10.10.40.0/24 | OpenVPN remote administration network |
| VPN gateway | 10.10.40.1 | Tunnel-side gateway for remote routes |
| VPN client | 10.10.40.2 | Windows administration workstation VPN address |

## Remote Routes

| Destination network | Next hop | Use |
|---|---|---|
| 10.10.20.0/24 | 10.10.40.1 | I use this VPN route to reach the core LAN |
| 10.10.30.0/24 | 10.10.40.1 | I use this VPN route to reach the Linux VLAN |

## Proxmox Bridges

| Bridge | Configuration |
|---|---|
| `vmbr0` | I use the static host address `192.168.0.242/24`, gateway `192.168.0.1`, and bridge port `nic0` for upstream connectivity |
| `vmbr1` | I use a VLAN-aware bridge with no physical bridge ports for pfSense LAN and internal guest interfaces |

I assign Linux01 VLAN tag 30 on `vmbr1`.

## DNS and Logging

| Service | Endpoint | Use |
|---|---|---|
| Active Directory DNS | 10.10.20.10 | I use DC01 to resolve `ad.jeremyfontenot.online` and internal host records |
| DHCP | 10.10.20.10 | I use DC01 to provide DHCP settings to WS01 |
| rsyslog | 10.10.30.20:514 TCP/UDP | I configure Linux01 to receive selected pfSense syslog events |
