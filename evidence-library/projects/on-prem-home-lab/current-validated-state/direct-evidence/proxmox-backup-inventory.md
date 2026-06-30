# Proxmox Backup Inventory

## Claim supported

Direct backup inventory evidence supports active backup-hdd storage, retained archive presence by VM count, and the boundary that archive presence is not the same as recurring restore assurance.

## Directly observed values

- Storage: backup-hdd.
- Storage path retained as claim-relevant evidence: `/mnt/pve/backup-hdd`.
- Storage status from current inventory: type `dir`, content `backup`, total 982,809,350,144 bytes, used 172,812,951,552 bytes, available 759,996,993,536 bytes.
- Backup validation storage view: 916 GB size, 127 GB used, 743 GB available, 15 percent used.
- Retained backup counts: VM 100 count 4, VM 200 count 4, VM 300 count 4, VM 400 count 4.
- No successful recent per-VM vzdump task status is claimed from this artifact.
- Operational limitation retained: Proxmox thin-pool risk is visible. The retained storage source directly shows a 428 GB thin pool and provisioned VM/snapshot thin volumes that exceed that physical thin-pool size. The requested auto-extension warning is retained as a limitation boundary; the retained source set inspected for this publication does not include a separate thin-pool auto-extension configuration dump.

## Source command or source object

- Proxmox read-only inventory object: `storage[]`.
- Backup and restore validation text: backup counts and storage block.
- Retained public storage evidence: Proxmox storage status, logical volume, and thin-pool usage sections.

## Source repository

- fontenotjeremy71-hub/jeremy-homelab-ops
- fontenotjeremy71-hub/jeremyfontenot, for the retained older public storage limitation artifact

## Source commit

- Operations source: fb6c286873285778d88d6d5cfde0b9bd00b96f36
- Website retained public evidence source: 5813445f3cc828e2146773299c47967292da7fd5

## Source path

- `inventories/proxmox-inventory-20260626-010601.json`
- `evidence/home-lab-backup-restore-validation-20260629.txt`
- `evidence-library/projects/on-prem-home-lab/validated-2026-06-21/text/proxmox-storage-validation.txt`

## Source file SHA-256

- `inventories/proxmox-inventory-20260626-010601.json`: D652D1EF753E14242C07F84F19FBF09F642F07C3B09CFE2E98AA7F2B176ADE3D
- `evidence/home-lab-backup-restore-validation-20260629.txt`: 4637E848C9B318B8C74BB9C6E4569B3CC03E6686CE64FA367CF6DEC05FA52E13
- `evidence-library/projects/on-prem-home-lab/validated-2026-06-21/text/proxmox-storage-validation.txt`: 7F069AA31390D90D99F0000D6F6236A2B60F5D28F061668C0BBD5054FA93741F

## Public artifact SHA-256

Recorded in `evidence-library/integrity/evidence-hashes.json` for this artifact path. The self-hash is recorded outside this file so the digest does not invalidate itself.

## Sanitization performed

Removed PIDs, unrelated filesystems, device identifiers not needed for the claim, snapshot parent names, raw command history, and backup archive filenames. Retained the backup storage path because it is the public claim being validated.

## Limitations

- Personal nonproduction home lab only.
- Captured-state evidence only.
- Backup archive count does not prove backup integrity.
- No claim is made that all recent backup tasks succeeded.
- The thin-pool warning is an operational limitation and is not framed as a failed backup or failed restore.
- No RTO, RPO, production disaster-recovery readiness, or recurring restore assurance is claimed.

## Validation date

2026-06-30

## Classification

Documented / Limitation
