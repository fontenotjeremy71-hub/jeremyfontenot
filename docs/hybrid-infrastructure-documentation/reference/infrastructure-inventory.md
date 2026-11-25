# Infrastructure Inventory

| Category | Identifier | Platform or role | Evidence state |
|---|---|---|---|
| Physical host | Dell PowerEdge R710 | Proxmox host | Documented; detailed hardware inventory gap |
| Virtual machine | VM 100 / pfsense-fw | pfSense firewall and routing | Running in captured inventory |
| Virtual machine | VM 200 / dc01 | Windows Server 2022 AD DS, DNS, DHCP | Running and role evidence validated |
| Virtual machine | VM 300 / ws01 | Windows 10 Pro domain client | Running and domain state validated |
| Virtual machine | VM 400 / linux01 | Ubuntu 26.04 LTS domain-integrated Linux | Running, network and SSSD evidence validated |
| Windows management host | HVHOST01 | Hyper-V and Azure Arc | Connected evidence |
| Windows management host | VMM01 | SCVMM, Azure Arc, SQL Server | Connected evidence; direct credential limitation retained |
| Windows application host | APP01 | Hyper-V guest | Discovered, started, and viewer-tested |
| macOS host | MACVM01 | macOS Active Directory integration | Public evidence retained; scope limited |
| Backup storage | backup-hdd | Proxmox backup storage | Configured and inventory captured |

## Primary VM Resources

| VMID | vCPU | Memory | Disk | Bridge | Guest agent |
|---|---:|---:|---:|---|---|
| 100 | 2 | 4 GB | 32 GB | vmbr0, vmbr1 | Not configured/responding |
| 200 | 2 | 4 GB | 80 GB | vmbr1 | Not configured/responding |
| 300 | 2 | 4 GB | 80 GB | vmbr1 | Not configured/responding |
| 400 | 2 | 2 GB | 40 GB | vmbr1 | Configured/responding |
