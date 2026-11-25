# Network Reference

| Name | Address or route | Use |
|---|---|---|
| Core LAN | 10.10.20.0/24 | DC01, WS01, core Windows services |
| DC01 | 10.10.20.10 | Domain controller, DNS, DHCP |
| WS01 | 10.10.20.100 | Domain-joined Windows client |
| pfSense core gateway | 10.10.20.1 | Core LAN gateway |
| Linux VLAN | 10.10.30.0/24 | Linux01 |
| Linux01 | 10.10.30.20/24 | Ubuntu infrastructure and rsyslog receiver |
| Linux01 gateway | 10.10.30.1 | Linux VLAN gateway |
| VPN network | 10.10.40.0/24 | Remote administrative route context |
| VPN route | 10.10.20.0/24 via 10.10.40.1 | Route observed from 10.10.40.2 |
| Proxmox management | 192.168.0.242 | Proxmox management interface |
| rsyslog | 10.10.30.20:514 | TCP and UDP listener |

## DNS

The domain DNS root is `ad.jeremyfontenot.online`. DC01's IPv4 address is the public DNS resolver recorded for WS01 and Linux01.

## Address Boundary

Linux01 is supported in the current evidence as 10.10.30.20/24. Older 10.10.20.x Linux01 evidence is not silently merged into the current inventory.
