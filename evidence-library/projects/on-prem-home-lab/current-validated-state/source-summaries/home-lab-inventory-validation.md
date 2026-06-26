# Home Lab Inventory and Validation Evidence

- Timestamp: `2026-06-26T01:06:01.2273166-05:00`
- Source workstation: `DESKTOP-MR3F9A1`
- Repository: `C:\Users\jeremy\Documents\projects\jeremy-homelab-ops`
- Execution mode: read-only discovery, inventory, and validation
- Infrastructure configuration changes: `0`

## Commands and Access Paths

- Proxmox inventory: `mcp__home_lab` read-only Proxmox tools.
- Repository validation: `pwsh -NoProfile -File .\tests\Test-RepositoryStructure.ps1 -WriteEvidence`
- Connectivity validation: `pwsh -NoProfile -File .\scripts\monitoring\Test-HomeLabConnectivity.ps1 -TimeoutMilliseconds 1000`
- DNS validation: `Resolve-DnsName ad.jeremyfontenot.online -Server 10.10.20.10`
- Route validation: `route.exe print -4`
- Domain discovery: `nltest /dsgetdc:ad.jeremyfontenot.online`, `nltest /dclist:ad.jeremyfontenot.online`, `nltest /sc_query:JFAD`
- Module availability: `Get-Command Get-ADDomain`, `Get-Command Get-GPO`, `Get-Command Get-DhcpServerv4Scope`, `Get-Command Get-DnsServerZone`

## Validated Results

| Check | Status | Observed result |
|---|---|---|
| Proxmox API inventory | PASS | Version `9.2.3`, node `proxmox` online, VMs `100`, `200`, `300`, and `400` running. |
| Proxmox storage inventory | PASS | `local-lvm`, `backup-hdd`, and `local` reported capacity and usage. |
| Proxmox backup job inventory | PASS | Job `backup-critical-lab-vms` enabled for VMs `100,200,300,400`, storage `backup-hdd`, schedule `sun 02:00`. |
| Proxmox management TCP | PASS | `192.168.0.242:8006` connected in `67 ms`. |
| DC01 DNS TCP | PASS | `10.10.20.10:53` connected in `6 ms`. |
| Domain DNS resolution | PASS | `ad.jeremyfontenot.online` resolved to `10.10.20.10` using server `10.10.20.10`. |
| VPN route | PASS | Route table includes `10.10.20.0/24` via `10.10.40.1` from `10.10.40.2`. |
| Repository validation | PASS | Repository validation completed with no failing checks. |

## Warnings and Inconclusive Results

| Check | Status | Observed result |
|---|---|---|
| pfSense LAN HTTPS TCP | WARNING | `10.10.20.1:443` timed out after `1000 ms`. |
| DC01 Kerberos TCP | WARNING | `10.10.20.10:88` timed out after `1000 ms`. |
| DC01 LDAP TCP | WARNING | `10.10.20.10:389` timed out after `1000 ms`. |
| DC01 SMB TCP | WARNING | `10.10.20.10:445` timed out after `1000 ms`. |
| DC01 WinRM TCP | WARNING | `10.10.20.10:5985` timed out after `1000 ms`. |
| Domain controller discovery | INCONCLUSIVE | `nltest /dsgetdc:ad.jeremyfontenot.online` returned `ERROR_NO_SUCH_DOMAIN` from the current workstation context. |
| Secure channel query | INCONCLUSIVE | `nltest /sc_query:JFAD` returned `RPC_S_SERVER_UNAVAILABLE` from the current workstation context. |
| DNS Server module inventory | NOT TESTED | `Get-DnsServerZone` is not installed on the management workstation. |
| DHCP Server module inventory | NOT TESTED | `Get-DhcpServerv4Scope` is not installed on the management workstation. |
| Group Policy inventory | NOT TESTED | `Get-GPO` is not installed on the management workstation. |
| WS01 guest inventory | NOT TESTED | No verified WS01 management IP or guest-agent response was available in this run. |

## Claim Boundary

This evidence records read-only repository validation, Proxmox connector inventory, local route inspection, DNS resolution, and bounded TCP reachability checks. It does not validate pfSense configuration, firewall policy, NAT policy, VPN configuration correctness, Active Directory health, DNS zone health, DHCP scope health, Group Policy processing, WS01 domain relationship, backup restore integrity, or administrative access to Windows guests.

Timeouts, module absence, and `nltest` failures are recorded observations only. They are not proof that the corresponding infrastructure components are offline, misconfigured, or unavailable.
