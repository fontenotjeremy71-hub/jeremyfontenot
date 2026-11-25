# Infrastructure Inventory

I maintain this inventory to show how my physical host, virtualization platform, network systems, guest servers, and management tools fit together.

## Physical and Virtualization Platforms

| Layer | System | Platform or role |
|---|---|---|
| Physical host | Dell PowerEdge R710 | Compute, memory, storage, and network platform |
| Hypervisor | Proxmox VE | Base virtualization platform for the core lab guests |
| Network gateway | pfSense VM 100 | Firewall, routing, network segmentation, and OpenVPN |

## Core Guest Inventory

| VMID | Hostname | Operating system or role | vCPU | Memory | Disk | Network placement |
|---|---|---|---:|---:|---:|---|
| 100 | pfsense-fw | pfSense firewall and routing | 2 | 4 GB | 32 GB | vmbr0, vmbr1 |
| 200 | dc01 | Windows Server 2022, AD DS, DNS, DHCP | 2 | 4 GB | 80 GB | vmbr1 |
| 300 | ws01 | Windows 10 Pro domain client | 2 | 4 GB | 80 GB | vmbr1 |
| 400 | linux01 | Ubuntu 26.04 LTS, AD-integrated Linux | 2 | 2 GB | 40 GB | vmbr1, VLAN 30 |

## Additional Management and Application Systems

| System | Platform or role | Administrative use |
|---|---|---|
| HVHOST01 | Windows Server 2022 with Hyper-V | I administer the nested Hyper-V host and its guest workloads |
| VMM01 | Windows Server 2022 with SCVMM 2022 | I use System Center Virtual Machine Manager to manage HVHOST01 and APP01 |
| APP01 | Hyper-V guest | I manage the guest lifecycle and console through SCVMM |
| SYNC01 | Windows Server 2022 | I used SYNC01 for separate Microsoft Entra Cloud Sync and Entra Connect Sync implementations targeting different tenants |
| MACVM01 | macOS Monterey 12.7.6 virtual machine | I configured macOS network connectivity and Active Directory computer-object integration |

## MACVM01 Network and Directory Integration

| Setting | MACVM01 configuration |
|---|---|
| Hostname | MACVM01 |
| Operating system | macOS Monterey 12.7.6 |
| IPv4 address | 10.10.20.101 |
| Default gateway | 10.10.20.1 |
| DNS server | 10.10.20.10 |
| Active Directory domain | ad.jeremyfontenot.online |

I configured MACVM01 to use the core-LAN gateway and DC01 for DNS. I also created and verified its Active Directory computer object.

## Storage Inventory

| Proxmox storage | Type | Backing storage | Purpose |
|---|---|---|---|
| `local-lvm` | LVM-thin | `pve` volume group on `/dev/sda3` | I store virtual machine disks and snapshots |
| `backup-hdd` | Directory storage | ext4 filesystem on `/dev/sdb1`, mounted at `/mnt/pve/backup-hdd` | I store Proxmox backup archives |

## Evidence

- [Proxmox platform inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-platform-inventory.md)
- [DC01 system and role inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/dc01-system-and-role-validation.md)
- [WS01 system and domain inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/ws01-system-and-domain-validation.md)
- [Linux01 system, network, and domain inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-system-network-domain-validation.md)
- [MACVM01 network configuration](../../../evidence-library/projects/on-prem-home-lab/macos-active-directory-integration/macvm01-network-configuration-public.txt)
- [MACVM01 Active Directory computer object](../../../evidence-library/projects/on-prem-home-lab/macos-active-directory-integration/MACVM01-AD-computer-object-public.txt)
- [Azure Arc public validation](../../../evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/evidence/azure-arc-validation-public.txt)
