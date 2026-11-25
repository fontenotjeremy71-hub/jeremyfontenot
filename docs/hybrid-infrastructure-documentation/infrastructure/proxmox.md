# Proxmox

## Hypervisor Platform

I use Proxmox VE on my Dell PowerEdge R710 as the base hypervisor for my lab. I manage the host, virtual machines, virtual networking, storage, snapshots, and scheduled backup jobs through the Proxmox management interface and API.

## Core Virtual Machines

| VMID | Name | Guest role | vCPU | Memory | Disk | Bridge placement |
|---|---|---|---:|---:|---:|---|
| 100 | pfsense-fw | pfSense firewall and routing | 2 | 4 GB | 32 GB | vmbr0, vmbr1 |
| 200 | dc01 | Windows Server 2022 domain controller | 2 | 4 GB | 80 GB | vmbr1 |
| 300 | ws01 | Windows 10 Pro domain client | 2 | 4 GB | 80 GB | vmbr1 |
| 400 | linux01 | Ubuntu 26.04 LTS | 2 | 2 GB | 40 GB | vmbr1, VLAN 30 |

## Virtual Networking

I use `vmbr0` for Proxmox management and the pfSense WAN connection. I use `vmbr1` as a VLAN-aware bridge for pfSense LAN and internal guest interfaces. I assign Linux01 VLAN tag 30.

## Storage

I use `local-lvm` as Proxmox LVM-thin storage for virtual machine disks. The thin pool resides in the `pve` volume group on `/dev/sda3`.

I use `backup-hdd` as a separate directory storage on the ext4 filesystem `/dev/sdb1`, mounted at `/mnt/pve/backup-hdd`. I keep file-based backup archives on this storage rather than in the VM disk thin pool.

## Backup Job Administration

I maintain the Proxmox job `backup-critical-lab-vms` with the following configuration:

| Setting | Configuration |
|---|---|
| Schedule | Sunday at 02:00 |
| Mode | Snapshot |
| Compression | zstd |
| Retention | keep-last=4 |
| Storage | backup-hdd |
| VMIDs | 100, 200, 300, 400 |

## Restore and VM Lifecycle Work

I use snapshots and backup archives as part of VM lifecycle administration. I performed an isolated restore exercise by restoring Linux01 VM 400 to temporary VM 401, isolating its network before boot, checking the Ubuntu guest and QEMU Guest Agent, then shutting down and removing the temporary VM.

## Evidence

- [Proxmox platform inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-platform-inventory.md)
- [Proxmox backup configuration](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-backup-configuration.md)
- [Proxmox backup inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-backup-inventory.md)
- [Proxmox restore exercise](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-restore-validation.md)
- [Proxmox storage layout](../../../evidence-library/projects/on-prem-home-lab/validated-2026-06-21/text/proxmox-storage-validation.txt)
