# Windows Server and Active Directory

## DC01

DC01 is VM 200 on Proxmox. Direct inventory evidence supports Microsoft Windows Server 2022 Standard Evaluation, build 20348, and installed Active Directory Domain Services, DNS Server, DHCP Server, and Group Policy Management roles or features.

The domain is `ad.jeremyfontenot.online`, and the NetBIOS name is `JFAD`. DC01's host identity is `DC01.ad.jeremyfontenot.online`, with IPv4 address `10.10.20.10`.

## Directory State

The retained DC01 inventory supports:

- Global Catalog: true
- PDC Emulator
- RID Master
- Infrastructure Master
- Schema Master
- Domain Naming Master

This validates DC01's observed role placement. It does not prove ongoing directory health or a fault-tolerant domain-controller design.

## DNS and DHCP

I use DC01 for DNS and DHCP in the core LAN. WS01 evidence confirms DHCP and DNS use of 10.10.20.10. Linux01 evidence confirms the DNS server and domain are used by the Linux host.

The public direct inventory does not include a complete public DNS zone or DHCP scope export. Therefore, I do not claim complete zone or scope validation.

## WS01

WS01 is VM 300. Evidence supports:

- Windows 10 Pro 10.0.19045
- Domain membership in `ad.jeremyfontenot.online`
- Secure channel result true
- Ethernet IPv4 10.10.20.100
- Gateway 10.10.20.1
- DNS and DHCP server 10.10.20.10

Repository screenshots also support RDP troubleshooting, OU placement, DNS and DHCP validation, and file-share permission testing.

## Administrative Procedures

In the directory environment, I perform or document:

- Domain and forest inventory.
- FSMO role review.
- DNS and DHCP validation.
- Domain-join and secure-channel review.
- OU and Group Policy review.
- Remote Desktop troubleshooting.
- Permission testing using a shared folder.
- Evidence export and integrity verification.

## Public Claim Boundaries

I do not claim production AD ownership, multi-site redundancy, complete GPO processing, exchange ownership, or uninterrupted endpoint health from these records.

## Evidence

- [DC01 system and role validation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/dc01-system-and-role-validation.md)
- [WS01 system and domain validation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/ws01-system-and-domain-validation.md)
- [WS01 evidence screenshots](../../../evidence-library/projects/on-prem-home-lab/screenshots/screenshots-manifest.json)
