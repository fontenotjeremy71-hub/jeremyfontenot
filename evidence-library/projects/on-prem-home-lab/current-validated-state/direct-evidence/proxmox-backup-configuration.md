# Proxmox Backup Configuration

## Claim supported

Direct Proxmox backup configuration evidence supports the configured weekly snapshot job for primary lab VMs.

## Directly observed values

- Backup job ID: backup-critical-lab-vms.
- Enabled state: enabled.
- Schedule: Sunday 02:00 (`sun 02:00`).
- Mode: snapshot.
- Compression: zstd.
- Retention: keep-last=4.
- Storage target: backup-hdd.
- Target VMs: 100, 200, 300, and 400.

## Source command or source object

- Proxmox read-only inventory object: `backupJobs[]`.
- Backup and restore validation text: backup job block with prune/retention details.

## Source repository

fontenotjeremy71-hub/jeremy-homelab-ops

## Source commit

fb6c286873285778d88d6d5cfde0b9bd00b96f36

## Source path

- `inventories/proxmox-inventory-20260626-010601.json`
- `evidence/home-lab-backup-restore-validation-20260629.txt`

## Source file SHA-256

- `inventories/proxmox-inventory-20260626-010601.json`: D652D1EF753E14242C07F84F19FBF09F642F07C3B09CFE2E98AA7F2B176ADE3D
- `evidence/home-lab-backup-restore-validation-20260629.txt`: 4637E848C9B318B8C74BB9C6E4569B3CC03E6686CE64FA367CF6DEC05FA52E13

## Public artifact SHA-256

Recorded in `evidence-library/integrity/evidence-hashes.json` for this artifact path. The self-hash is recorded outside this file so the digest does not invalidate itself.

## Sanitization performed

Removed scheduling metadata not needed for the claim, command context, host details, and any unrelated storage, VM, or task information.

## Limitations

- Personal nonproduction home lab only.
- Configuration presence does not prove that every recent backup task succeeded.
- This artifact does not claim successful recent backups for VMs 200 or 300 because no direct recent OK task output is published here.
- This artifact does not prove restore integrity, RTO, RPO, recurring restore assurance, or disaster-recovery readiness.

## Validation date

2026-06-30

## Classification

Configured
