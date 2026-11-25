# Proxmox

## Platform State

I use a Dell R710 as a Proxmox VE host. The repository validates Proxmox VE 9.2.3 and Linux kernel 7.0.12-1-pve.

## Primary Virtual Machines

| VMID | Name | Running | vCPU | Memory | Disk | Bridge |
|---|---|---:|---:|---:|---:|---|
| 100 | pfsense-fw | Yes | 2 | 4 GB | 32 GB | vmbr0, vmbr1 |
| 200 | dc01 | Yes | 2 | 4 GB | 80 GB | vmbr1 |
| 300 | ws01 | Yes | 2 | 4 GB | 80 GB | vmbr1 |
| 400 | linux01 | Yes | 2 | 2 GB | 40 GB | vmbr1 |

Linux01 is assigned VLAN tag 30 in the reconciled source evidence.

## Administrative Work

I use Proxmox for:

- VM inventory and state review.
- Network bridge and VLAN review.
- Guest-agent checks.
- Snapshot review.
- Backup job configuration review.
- Temporary restore-VM provisioning.
- Network isolation and cleanup during restore exercises.

## Backup and Storage

The backup job `backup-critical-lab-vms` is enabled. It uses Sunday 02:00 scheduling, snapshot mode, zstd compression, `keep-last=4`, and backup storage `backup-hdd`. It targets VMIDs 100, 200, 300, and 400.

The evidence supports retained archive counts of four for each primary VM. It does not prove that every recent backup task succeeded.

## Restore Procedure

For the Linux01 restore drill, I used source VM 400 and temporary VM 401. I isolated the temporary VM network before boot, validated Ubuntu 26.04 LTS and the QEMU Guest Agent, then shut down and purged temporary VM 401.

This is a single isolated exercise. It does not establish recurring restore assurance, RTO, RPO, or disaster-recovery readiness.

## Limitations

- Guest-agent status differs between VMs.
- Backup presence is separate from archive integrity.
- The retained evidence shows a thin-pool sizing warning.
- The public source set does not prove Proxmox clustering or high availability.

## Evidence

- [Platform inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-platform-inventory.md)
- [Backup configuration](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-backup-configuration.md)
- [Backup inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-backup-inventory.md)
- [Restore validation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-restore-validation.md)
