# pfSense

## Role

pfSense is VM 100 on Proxmox. The documented architecture assigns it to routing and firewall duties at the interface between the core LAN, Linux VLAN, and VPN network.

## Captured State

The VM inventory records:

- 2 vCPU
- 4 GB RAM
- 32 GB disk
- vmbr0 and vmbr1 bridge placement
- Running state
- Guest agent not configured or responding in the captured inventory

The public evidence does not expose or claim every pfSense interface, NAT rule, firewall rule, DHCP setting, or VPN certificate.

## Network Functions

I use pfSense as the lab routing and security boundary. Repository evidence supports:

- The core LAN relationship.
- A separate Linux VLAN.
- A remote-access VPN route for the 10.10.20.0/24 network.
- pfSense log generation and forwarding planning to Linux01.

## Validation State

Repository validation reports a timeout when a management workstation attempted TCP 443 to the pfSense LAN address. I do not interpret that timeout as evidence that the HTTPS service or firewall is unavailable. The public evidence does not provide a complete firewall-rule or VPN-policy validation.

## Backup and Restore

pfSense is included in the primary Proxmox backup job and retained in restore-related evidence. Separate restore records describe isolated testing, service checks, and cleanup. Those results should not be generalized beyond the tested scope.

## Evidence Gaps

- Complete exported firewall-rule inventory.
- NAT configuration.
- Interface-address and DHCP inventory.
- OpenVPN server configuration.
- Certificate inventory.
- Tunnel-route validation beyond the retained route observation.

## Evidence

- [Platform inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-platform-inventory.md)
- [Home lab inventory and validation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/source-summaries/home-lab-inventory-validation.md)
