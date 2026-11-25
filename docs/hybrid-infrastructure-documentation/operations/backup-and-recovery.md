# Backup and Recovery

## Proxmox Backup Job

I configured the Proxmox backup job `backup-critical-lab-vms` to create scheduled snapshot-mode backups of my core lab virtual machines.

| Setting | Configuration |
|---|---|
| Job name | backup-critical-lab-vms |
| Schedule | Sunday at 02:00 |
| Mode | Snapshot |
| Compression | zstd |
| Retention | keep-last=4 |
| Storage target | backup-hdd |
| Included VMIDs | 100, 200, 300, 400 |

The job covers pfSense, DC01, WS01, and Linux01. I used `backup-hdd` as the separate Proxmox directory storage for backup archives.

## Storage and Backup Administration

I kept Proxmox virtual-machine disks on `local-lvm` and backup archives on `backup-hdd`. I reviewed the backup job configuration, target storage, archive inventory, and VM coverage as part of my virtualization administration.

I used VM snapshots for point-in-time guest recovery and scheduled backup archives for stored recovery copies. I treated snapshot management and backup management as related but separate operations.

## Linux01 Restore Exercise

I restored source VM 400 to temporary VM 401 to exercise the recovery workflow. I isolated the temporary VM network before boot, started the restored Ubuntu guest, checked the operating system and QEMU Guest Agent, then shut down and removed temporary VM 401.

This exercise demonstrates my use of an isolated restore VM, network isolation, guest inspection, and post-exercise cleanup.

## Evidence

- [Proxmox backup configuration](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-backup-configuration.md)
- [Proxmox backup storage and archive inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-backup-inventory.md)
- [Linux01 restore exercise](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-restore-validation.md)
- [Proxmox storage layout](../../../evidence-library/projects/on-prem-home-lab/validated-2026-06-21/text/proxmox-storage-validation.txt)
