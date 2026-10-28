# DC01 System and Role Validation

## Claim supported

Direct DC01 inventory supports Windows Server, installed role, domain, Global Catalog, FSMO, and DC01 IP claims for the personal nonproduction lab.

## Directly observed values

- Operating system: Microsoft Windows Server 2022 Standard Evaluation.
- Version: 10.0.20348.
- Build number: 20348.
- Active Directory Domain Services installed: AD-Domain-Services, InstallState 1.
- DNS Server installed: DNS, InstallState 1.
- DHCP Server installed: DHCP, InstallState 1.
- Group Policy Management installed: GPMC, InstallState 1.
- Domain DNS root: ad.jeremyfontenot.online.
- NetBIOS domain: JFAD.
- Domain controller host: DC01.ad.jeremyfontenot.online.
- DC01 IPv4 address: 10.10.20.10.
- Global Catalog: true.
- FSMO roles on DC01: PDC Emulator, RID Master, Infrastructure Master, Schema Master, and Domain Naming Master.

## Source command or source object

Authenticated DC01 target-local inventory result objects: OperatingSystem, InstalledRolesFeatures, Domain, Forest, and DomainControllers.

## Source repository

fontenotjeremy71-hub/jeremy-homelab-ops

## Source commit

fb6c286873285778d88d6d5cfde0b9bd00b96f36

## Source path

`inventories/dc01-inventory-20260626-022543.json`

## Source file SHA-256

`inventories/dc01-inventory-20260626-022543.json`: F60A6DD8C9EE42E90B02B210B1B1A775F89E5C3DED26618B593DEE1362C6DE42

## Public artifact SHA-256

Recorded in `evidence-library/integrity/evidence-hashes.json` for this artifact path. The self-hash is recorded outside this file so the digest does not invalidate itself.

## Sanitization performed

Removed executing account, privileged group details, SIDs, object GUIDs, GPO GUIDs, unrelated installed features, event details, raw time values not needed for the claim, and unrelated command output. Retained DC01 IP because it is already part of the current public home-lab evidence boundary.

## Limitations

- Personal nonproduction home lab only.
- Captured-state evidence only.
- This artifact validates collected DC01 inventory values only.
- It does not prove ongoing Active Directory health, production readiness, security assurance, employer-system administration, or service availability beyond the captured inventory.

## Validation date

2026-06-30

## Classification

Validated
