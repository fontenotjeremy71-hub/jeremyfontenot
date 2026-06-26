# Backup and Restore Validation

## Status

Partially validated by retained June 24 documentation. No restore test was repeated during the 2026-06-26 read-only operations run.

## Current Evidence

Read-only Proxmox inventory observed an enabled scheduled backup job:

- Job ID: `backup-critical-lab-vms`
- VMs: `100,200,300,400`
- Storage: `backup-hdd`
- Schedule: `sun 02:00`
- Mode: `snapshot`
- Compression: `zstd`

Storage inventory observed backup storage named `backup-hdd` at `/mnt/pve/backup-hdd`.

The June 24 retained portfolio documentation records isolated startup restore checks for:

- WS01 restored temporarily as VM 500, with the NIC link down before startup.
- Linux01 restored temporarily as VM 600, with the NIC link down before startup.

The current Proxmox inventory no longer shows VM 500 or VM 600, which is consistent with the documentation stating both temporary restore VMs were removed after validation.

## Required Future Validation

Before claiming recurring restore assurance, perform an approved fresh restore validation that documents:

- Exact VM or test restore target
- Backup file selected
- Restore command or UI action
- Network isolation approach
- Validation checks
- Cleanup steps
- Rollback procedure
- Evidence proving successful boot or file-level recovery

## Claim Boundary

The current operations repository validates backup job configuration visibility and retains documentation of June 24 isolated startup restore checks. It does not validate current backup archive integrity, recurring restore success, RTO, RPO, or disaster-recovery readiness.
