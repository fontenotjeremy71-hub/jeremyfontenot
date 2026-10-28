# Proxmox Restore Validation

## Claim supported

Direct restore validation evidence supports one isolated Linux01 restore drill from source VM 400 to temporary VM 401.

## Directly observed values

- Source VM: 400.
- Temporary restore VM: 401.
- Restored disk size boundary: VM 400 boot disk shown as 40 GB in the retained restore validation source.
- Temporary VM network isolation: temporary VM network isolated before boot.
- Guest validation: Ubuntu 26.04 LTS boot and QEMU Guest Agent response were validated in the retained restore evidence.
- Cleanup: temporary VM 401 was shut down and purged successfully.
- The source set inspected for this publication does not include a retained per-command restore transcript with archive filename, progress percentage, or literal final `TASK OK` line; those details are therefore not claimed here.
- Operational limitation retained: Proxmox thin-pool risk remains visible and is not framed as a failed restore.

## Source command or source object

Backup and restore validation text: VM state and restore drill sections.

## Source repository

fontenotjeremy71-hub/jeremy-homelab-ops

## Source commit

fb6c286873285778d88d6d5cfde0b9bd00b96f36

## Source path

`evidence/home-lab-backup-restore-validation-20260629.txt`

## Source file SHA-256

`evidence/home-lab-backup-restore-validation-20260629.txt`: 4637E848C9B318B8C74BB9C6E4569B3CC03E6686CE64FA367CF6DEC05FA52E13

## Public artifact SHA-256

Recorded in `evidence-library/integrity/evidence-hashes.json` for this artifact path. The self-hash is recorded outside this file so the digest does not invalidate itself.

## Sanitization performed

Removed PIDs and retained only the VM IDs, restore scope, network isolation, guest identity, guest-agent response, and cleanup outcome needed to support the public claim.

## Limitations

- Personal nonproduction home lab only.
- Captured-state evidence only.
- One isolated Linux01 restore drill only.
- No recurring restore assurance.
- No RTO or RPO claim.
- No disaster-recovery readiness, SLA, production, or employer-system claim.
- Thin-pool warnings are operational limitations and are not evidence of a failed restore.

## Validation date

2026-06-30

## Classification

Tested
