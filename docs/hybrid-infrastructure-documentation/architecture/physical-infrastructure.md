# Physical Infrastructure

## Physical Platform

I operate my lab on a Dell PowerEdge R710. I run Proxmox VE on the host. My host inventory records an x86_64 system with two Intel Xeon L5520 processors.

| Component | Host-reported configuration |
|---|---|
| Processor model | Intel Xeon L5520 at 2.27 GHz |
| Processor sockets | 2 |
| Cores per socket | 4 |
| Threads per core | 2 |
| Logical processors | 16 |
| Memory | 23 GiB total reported by the host |

## Proxmox Host Role

I use the R710 as the physical compute, memory, storage, and network platform for Proxmox. I use Proxmox as the virtualization layer for my lab systems. I document the virtual machine inventory and allocations in [Infrastructure Overview](infrastructure-overview.md) rather than repeating that table here.

## Storage Architecture

I use two OS-visible block devices presented through the PERC 6/i controller: `/dev/sda` for the Proxmox system and local virtual machine storage, and `/dev/sdb` for the `backup-hdd` directory storage.

| OS-visible block device | Controller and OS-reported capacity | Partition and filesystem layout | Proxmox storage role |
|---|---|---|---|
| `/dev/sda` | PERC 6/i, 557.8G | `/dev/sda3` is an LVM physical volume in volume group `pve` | Proxmox system volumes and `local-lvm` |
| `/dev/sdb` | PERC 6/i, 931G | `/dev/sdb1`, ext4, mounted at `/mnt/pve/backup-hdd` | `backup-hdd` directory storage |

In my storage layout, the `pve` volume group on `/dev/sda3` contains the Proxmox root and swap volumes, along with the `pve-data_tpool` thin pool. Proxmox exposes this pool as `local-lvm`, an LVM-thin storage. The host storage inventory shows VM disk logical volumes within `pve-data_tpool`. With thin provisioning, I assign virtual disk capacity to guests while physical pool blocks are allocated as guest data is written. Snapshots and guest writes also consume pool space.

I use `backup-hdd` as a separate Proxmox directory storage. I register it as type `dir` and mount its ext4 filesystem at `/mnt/pve/backup-hdd`. This keeps my file-based backup storage on `/dev/sdb1` separate from the LVM-thin virtual-disk storage on `/dev/sda3`.

## Host Network and Connectivity

I configure the host's network using two Linux bridges:

| Bridge | Host configuration | Infrastructure connection |
|---|---|---|
| `vmbr0` | Static address `192.168.0.242/24`, gateway `192.168.0.1`, bridge port `nic0` | Physical upstream interface and pfSense WAN tap |
| `vmbr1` | Manual addressing, no physical bridge ports, VLAN-aware, VLAN IDs 2-4094 | pfSense LAN and the DC01, WS01, and Linux01 virtual interfaces |

I connect the Proxmox management network and pfSense WAN through `vmbr0` and `nic0`. I use `vmbr1` as the VLAN-aware virtual LAN bridge for pfSense and the lab guest interfaces. I configure Linux01 with VLAN tag 30.

## Relationship to the Virtual Infrastructure

I rely on the R710 for the processor, memory, storage devices, and upstream network connectivity for Proxmox. My host storage inventory shows VM disk logical volumes in the local LVM-thin pool exposed as `local-lvm`. I connect guest interfaces through `vmbr0` and `vmbr1` and use the separate `backup-hdd` directory storage for Proxmox backup files.

For the guest systems, their resource allocations, network addresses, and service relationships, see [Infrastructure Overview](infrastructure-overview.md) and the [Proxmox platform inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-platform-inventory.md).

## Evidence

- [Proxmox host inventory](../../../evidence-library/projects/on-prem-home-lab/validated-2026-06-21/text/proxmox-host-validation.txt)
- [Proxmox storage layout and status](../../../evidence-library/projects/on-prem-home-lab/validated-2026-06-21/text/proxmox-storage-validation.txt)
- [Proxmox network bridge configuration](../../../evidence-library/projects/on-prem-home-lab/validated-2026-06-21/text/proxmox-network-validation-sanitized.txt)
- [Proxmox platform inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-platform-inventory.md)
- [Backup storage inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-backup-inventory.md)
