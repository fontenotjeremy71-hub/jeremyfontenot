# Current Validated State

This public evidence folder summarizes reviewer-safe records from the private home-lab operations repository without exposing private repository links. Public claims use stable classifications instead of date-based proof labels. The `direct-evidence/` folder contains sanitized direct artifacts for the current infrastructure claims.

## Document

- Title: Jeremy Fontenot’s On-Premises Home Lab Documentation
- Filename: `Jeremy-Fontenot-On-Premises-Home-Lab-Documentation.docx`
- Download description: Download the Professional Home Lab Documentation (.docx)
- SHA-256: `D7E81A06DCFBD2E91EB8F52A02BDC795AC5B7084A70F343233F1104CCD297BDB`

## Source Commits

- Website source commit at generation: `effdbeb0ed8d632a0b0c93328cd593cf85c3eb46`
- Home-lab source commit for direct evidence: `fb6c286873285778d88d6d5cfde0b9bd00b96f36`

## Supported Public Claims

- Personal nonproduction lab hosted on Dell PowerEdge R710 with Proxmox VE 9.2.3.
- pfSense, DC01, WS01, and Linux01 are the primary lab VMs described by current records.
- Linux01 current supported placement is VLAN 30 at `10.10.30.20/24`; older `10.10.20.x` Linux01 evidence is historical.
- DC01 direct evidence supports Windows Server 2022, AD DS, DNS, DHCP, Group Policy Management, Global Catalog status, FSMO ownership, and DC01 IP.
- WS01 direct evidence supports Windows 10 Pro, domain membership, secure channel, and current network state.
- Linux01 direct evidence supports Ubuntu 26.04 LTS, kernel, VLAN 30, current IP/gateway/DNS, current-versus-historical address boundary, and directly proven domain integration indicators.
- Linux01 SSSD remediation is documented as remediated and validated for Linux01 only.
- Backup job configuration and retained backup counts are supported; all-recent-backups-succeeded, recurring disaster-recovery assurance, RTO, and RPO are not claimed.
- One isolated Linux01 restore drill is supported; it does not prove recurring restore assurance.

## Direct Evidence Links

- [Open direct Proxmox inventory](./direct-evidence/proxmox-platform-inventory.md)
- [Open direct backup configuration](./direct-evidence/proxmox-backup-configuration.md)
- [Open direct backup inventory](./direct-evidence/proxmox-backup-inventory.md)
- [Open direct restore validation](./direct-evidence/proxmox-restore-validation.md)
- [Open direct DC01 validation](./direct-evidence/dc01-system-and-role-validation.md)
- [Open direct WS01 validation](./direct-evidence/ws01-system-and-domain-validation.md)
- [Open direct Linux01 validation](./direct-evidence/linux01-system-network-domain-validation.md)
- [Open direct SSSD remediation validation](./direct-evidence/linux01-sssd-remediation-validation.md)

## Limitations

Personal lab evidence does not represent employer production administration, client infrastructure ownership, enterprise scale, guaranteed uptime, full firewall assurance, or full security assurance. Timeout observations remain timeout observations. The restore evidence is one isolated Linux01 restore drill only and does not establish recurring restore assurance, RTO, RPO, SLA, or disaster-recovery readiness.
