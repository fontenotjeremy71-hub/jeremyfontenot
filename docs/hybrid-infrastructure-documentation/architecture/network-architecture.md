# Network Architecture

## Network Overview

I organize my lab network around pfSense, which provides the routing and network boundary between my upstream network, core LAN, Linux VLAN, and remote-access VPN. I use Proxmox virtual bridges to connect the firewall and guest systems to their respective network segments.

I separate my Windows infrastructure from my Linux systems using distinct IP subnets. I also maintain a dedicated VPN address space for remote administrative connectivity.

## Network Segments

| Network segment | Network address | Gateway or endpoint | Systems and purpose |
|---|---|---|---|
| Upstream network | 192.168.0.0/24 | 192.168.0.1 | Proxmox management at 192.168.0.242/24 and pfSense WAN at 192.168.0.205 |
| Core LAN | 10.10.20.0/24 | 10.10.20.1 | DC01, WS01, Active Directory, DNS, and core Windows services |
| Linux VLAN | 10.10.30.0/24 | 10.10.30.1 | Linux01 and Linux administration services |
| Remote-access VPN | 10.10.40.0/24 | 10.10.40.1 | OpenVPN remote administrative connectivity |

I assign DC01 the address 10.10.20.10 and WS01 the address 10.10.20.100 on the core LAN. I assign Linux01 the address 10.10.30.20/24 on the Linux VLAN. I use 10.10.20.10 as the internal DNS server for these systems.

## Proxmox Network Bridges

I use two Proxmox Linux bridges to connect the physical host, pfSense, and virtual machines.

| Bridge | Host configuration | Network role |
|---|---|---|
| `vmbr0` | Static address `192.168.0.242/24`, gateway `192.168.0.1`, bridge port `nic0` | Connects Proxmox management and the pfSense WAN interface to the upstream network |
| `vmbr1` | Manual addressing, no physical bridge ports, VLAN-aware, VLAN IDs 2–4094 | Connects pfSense LAN and the internal guest network interfaces |

I use `vmbr0` for Proxmox management and the pfSense WAN connection. The bridge uses `nic0` as its physical bridge port.

I use `vmbr1` as the internal virtual network bridge. I connect the pfSense LAN interface and my internal guest interfaces through this bridge. I assign Linux01 VLAN tag 30 so that its virtual network interface belongs to the Linux VLAN.

## Routing and DNS

I use pfSense to route traffic between the core LAN and Linux VLAN. The core LAN uses 10.10.20.1 as its gateway, while the Linux VLAN uses 10.10.30.1.

I use DC01 at 10.10.20.10 as the DNS server for my internal Active Directory domain, `ad.jeremyfontenot.online`. I configure WS01 to use DC01 for DNS and to obtain its DHCP network settings from DC01.

I configure Linux01 to use DC01 for DNS across the routed network connection. This allows Linux01 to resolve the internal Active Directory domain and its associated services.

## Traffic Paths

### Windows Identity and Domain Services

I connect WS01 to the core LAN and use DC01 for DHCP, DNS, and Active Directory services. I rely on internal DNS resolution to locate domain services and support Windows domain operations.

### Linux Identity Integration

I connect Linux01 to the Linux VLAN and configure it to use DC01 for internal DNS resolution. I use realmd, SSSD, and Kerberos to integrate Linux01 with my Active Directory domain.

I connect Linux01 to DC01 through pfSense, which routes traffic between the Linux VLAN and core LAN.

### Remote Administration

I use pfSense OpenVPN remote access to connect administrative clients to my lab networks. The VPN uses the 10.10.40.0/24 address space.

From a VPN client assigned 10.10.40.2, I use routes through 10.10.40.1 to reach the core LAN at 10.10.20.0/24 and the Linux VLAN at 10.10.30.0/24. These routes provide remote access to the Windows and Linux administration networks.

### Centralized Logging

I configure pfSense to forward selected events to Linux01 at 10.10.30.20 on port 514. I configure Linux01's rsyslog service with remote logging listener functionality so that it can receive forwarded syslog messages.

## Evidence

- [Home lab inventory and validation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/source-summaries/home-lab-inventory-validation.md)
- [Network topology SVG](../../../evidence-library/architecture-diagrams/home-lab-network-topology-diagram-2026.svg)