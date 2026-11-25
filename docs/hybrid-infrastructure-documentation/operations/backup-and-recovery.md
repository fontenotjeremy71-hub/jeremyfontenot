# Backup and Recovery

## Backup Configuration

I use a Proxmox snapshot job named `backup-critical-lab-vms`. The evidence shows:

- Enabled
- Sunday 02:00
- Snapshot mode
- zstd compression
- `keep-last=4`
- Target storage `backup-hdd`
- VMIDs 100, 200, 300, and 400

The backup job covers pfSense, DC01, WS01, and Linux01. Configuration presence does not prove that all recent jobs succeeded.

## Retained Archives

The public backup inventory reports four retained backup archives for each primary VM. It does not use archive presence alone as proof of successful restore integrity.

## Linux01 Restore Exercise

I restored source VM 400 to temporary VM 401. I isolated the temporary VM network before boot, validated Ubuntu 26.04 LTS, validated QEMU Guest Agent response, shut down temporary VM 401, and purged it.

The public evidence does not include a per-command restore transcript or final TASK OK line. I therefore document only the restore scope and observed guest/cleanup results that are directly supported.

## Other Restore Evidence

The repository contains separate restore-related evidence for DC01, WS01, and pfSense. I distinguish those records instead of combining narrow exercise results into a broad disaster-recovery claim.

## Storage Limitation

The backup inventory records a thin-pool warning. The source set shows a 428 GB thin pool with provisioned VM/snapshot thin volumes that exceed that physical thin-pool size. It does not prove that auto-extension is disabled or that the thin pool caused a backup or restore failure.

## Result Boundary

The evidence supports:

- Backup configuration
- Archive inventory
- One isolated Linux01 restore exercise
- Separate bounded exercise records

It does not support recurring restore assurance, RTO, RPO, production disaster recovery, service-level objectives, or high availability.

## Evidence

- [Backup configuration](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-backup-configuration.md)
- [Backup inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-backup-inventory.md)
- [Restore validation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-restore-validation.md)
