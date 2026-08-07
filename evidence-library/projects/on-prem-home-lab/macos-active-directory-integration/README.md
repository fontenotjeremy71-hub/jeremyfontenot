# MACVM01 Home Lab Evidence

## Validated claim

Deployed and administered a macOS 12.7.6 virtual machine on Proxmox, connected it to the pfSense-managed LAN, integrated it with Windows Server Active Directory and DNS, enabled mobile domain accounts, and validated remote administration through SSH and VNC from DC01.

## Environment

- Host platform: Proxmox VE
- Virtual machine: MACVM01
- Operating system: macOS 12.7.6
- Network: pfSense-managed LAN
- Active Directory domain: ad.jeremyfontenot.online
- DNS server and domain controller: DC01
- Remote administration: SSH and VNC

## Evidence index

- `macvm01-proxmox-config-public.txt` — Redacted Proxmox VM configuration
- `macvm01-system-identity-public.txt` — macOS version, hostname, and domain-user identity
- `macvm01-ad-binding-public.txt` — Active Directory binding configuration
- `MACVM01-AD-computer-object-public.txt` — Enabled computer object recorded in Active Directory
- `macvm01-network-configuration-public.txt` — IP address, gateway, and DNS configuration
- `MACVM01-DNS-resolution-public.txt` — Forward DNS resolution
- `MACVM01-reverse-DNS-public.txt` — Reverse DNS resolution
- `MACVM01-remote-access-public.txt` — Successful SSH and VNC TCP validation from DC01
- `macvm01-time-configuration-public.txt` — Corrected timezone and network-time configuration
- `SHA256SUMS.csv` — SHA-256 integrity manifest

## Validation results

- MACVM01 reported macOS 12.7.6
- Domain-qualified hostname was configured
- Active Directory binding was present
- Domain-user identity resolved successfully
- Mobile account creation was enabled
- AD computer account was enabled
- Forward and reverse DNS resolution succeeded
- SSH port 22 was reachable from DC01
- VNC port 5900 was reachable from DC01
- The VM used the pfSense LAN gateway and DC01 DNS
- Configured timezone and network time were enabled

## Limitations

This evidence represents a personal home-lab implementation. It does not prove production readiness, enterprise scale, Apple fleet administration, mobile-device management, Apple Business Manager integration, high availability, disaster recovery, compliance certification, or end-to-end security assurance.

The remote-access tests prove TCP reachability at collection time. They do not independently prove continuous availability or the security of every remote-access configuration.

The system-identity and Active Directory binding records were collected before the host timezone was corrected. The current timezone and network-time settings are documented separately.

Detailed directory identifiers, group memberships, hardware identifiers, UUIDs, MAC addresses, and sensitive Proxmox configuration values were removed from the public evidence. The unredacted source records remain private.

## Integrity

Validate the published files against `SHA256SUMS.csv`. Any later file modification will produce a different SHA-256 hash.
