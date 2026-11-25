# Windows Server and Active Directory

## Domain Controller

I use DC01 as VM 200 on Proxmox VE. I run Windows Server 2022 with Active Directory Domain Services, DNS Server, DHCP Server, and Group Policy Management installed.

| Setting | DC01 configuration |
|---|---|
| Hostname | DC01 |
| FQDN | DC01.ad.jeremyfontenot.online |
| IPv4 address | 10.10.20.10 |
| Domain | ad.jeremyfontenot.online |
| NetBIOS name | JFAD |
| VMID | 200 |

I use DC01 as the domain controller, DNS server, and DHCP server for the core LAN. I administer the domain and forest, review directory roles, manage computer objects and Group Policy, and use DNS and DHCP to support domain-joined systems.

## Active Directory Roles

I operate DC01 as the Global Catalog and hold the five FSMO roles on this domain controller:

- PDC Emulator
- RID Master
- Infrastructure Master
- Schema Master
- Domain Naming Master

## Windows Client Administration

I use WS01 as VM 300 and run Windows 10 Pro as a domain-joined workstation. I configure its Ethernet interface with address `10.10.20.100`, gateway `10.10.20.1`, and DNS and DHCP server `10.10.20.10`.

I verify domain membership and the workstation secure channel, manage its Active Directory computer-object placement, and validate DNS resolution between WS01 and DC01.

![WS01 DNS and DHCP configuration](../../../evidence-library/projects/on-prem-home-lab/screenshots/figure-04-ws01-dns-dhcp-validation.png)

![WS01 computer-object placement in Active Directory](../../../evidence-library/projects/on-prem-home-lab/screenshots/figure-05-active-directory-ws01-ou-placement.png)

## Remote Desktop Administration

I configure Remote Desktop on WS01 and review the associated Windows firewall rules and network settings. I use DC01 to test name resolution and TCP port 3389 connectivity to WS01.

![DC01 to WS01 Remote Desktop and DNS connectivity test](../../../evidence-library/projects/on-prem-home-lab/screenshots/figure-07-dc01-to-ws01-rdp-dns-validation.png)

## Group Policy and File-Share Permissions

I use Group Policy to configure workstation settings and map the `\\DC01\IT` share for the appropriate users. I test the share with a write-enabled account and a standard read-only account.

I verify that the write-enabled account can create and read a file in the IT share. I verify that the standard account can read the share but receives an access-denied result when attempting to write.

![IT share read and write access test](../../../evidence-library/projects/on-prem-home-lab/screenshots/figure-13-sdtech-it-share-read-write-validation.png)

![Standard user read-only share access test](../../../evidence-library/projects/on-prem-home-lab/screenshots/figure-14-standard-user-it-share-read-only-write-denial.png)

## Administrative Work

I administer domain and forest information, FSMO roles, DNS, DHCP, computer objects, Group Policy, Remote Desktop, domain membership, secure-channel checks, shared-folder access, and evidence collection.

## Evidence

- [DC01 system and role inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/dc01-system-and-role-validation.md)
- [WS01 system and domain inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/ws01-system-and-domain-validation.md)
- [WS01 screenshot manifest](../../../evidence-library/projects/on-prem-home-lab/screenshots/screenshots-manifest.json)
