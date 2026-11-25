# Service and Evidence Reference

| Service or capability | Current evidence | Boundary |
|---|---|---|
| Proxmox VE | Platform and VM inventory | Captured state only |
| pfSense | VM and network context | Complete rules and policy not published |
| Active Directory | DC01 role inventory | No ongoing health claim |
| DNS | DC01 role and WS01/Linux01 resolver evidence | No complete zone export claim |
| DHCP | DC01 role and WS01 DHCP evidence | No complete scope export claim |
| Windows 10 client | WS01 inventory and screenshots | Personal lab only |
| Linux/SSSD | Linux01 inventory and remediation validation | Linux01 only |
| rsyslog | Target-local listener and configuration evidence | Sender completeness not proven |
| Azure Arc | HVHOST01 and VMM01 public evidence | No production Azure ownership claim |
| SCVMM | Public management screenshots | No cluster or HA claim |
| Backup | Proxmox job and archive inventory | Not proof of every successful task |
| Restore | Linux01 isolated restore drill | No recurring assurance or RTO/RPO |

## Primary Evidence Paths

- [Current validated state](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/README.md)
- [Proxmox platform inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-platform-inventory.md)
- [DC01 validation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/dc01-system-and-role-validation.md)
- [WS01 validation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/ws01-system-and-domain-validation.md)
- [Linux01 validation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-system-network-domain-validation.md)
- [Linux01 SSSD remediation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-sssd-remediation-validation.md)
- [Backup configuration](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-backup-configuration.md)
- [Restore validation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-restore-validation.md)
