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
| SYNC01 | Windows Server with Microsoft Entra Connect | I administer directory synchronization and Entra Connect Health services |
| MACVM01 | macOS Monterey virtual machine | I use the system for macOS and Active Directory integration work |

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
- [Azure Arc public validation](../../../evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/evidence/azure-arc-validation-public.txt)
