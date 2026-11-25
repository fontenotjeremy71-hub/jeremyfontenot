# Service and Evidence Reference

I use this reference to connect each lab service to the system where I administer it and the documentation or evidence that describes the work.

| Service or capability | System | My administrative work | Documentation or evidence |
|---|---|---|---|
| Virtualization | Proxmox VE | I manage VMs, virtual networking, storage, snapshots, and backup jobs | [Proxmox](../infrastructure/proxmox.md) · [Virtualization Architecture](../architecture/virtualization-architecture.md) |
| Firewall and routing | pfSense | I administer network gateways, inter-network routing, OpenVPN, and selected log forwarding | [pfSense](../infrastructure/pfsense.md) · [Network Architecture](../architecture/network-architecture.md) |
| Active Directory | DC01 | I administer AD DS, domain roles, computer objects, and Group Policy | [Windows Server and Active Directory](../infrastructure/windows-server-and-active-directory.md) |
| DNS and DHCP | DC01 | I configure and troubleshoot internal name resolution and workstation address assignment | [Network Reference](network-reference.md) · [DC01 inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/dc01-system-and-role-validation.md) |
| Windows client administration | WS01 | I manage domain membership, RDP, Group Policy, DNS, DHCP, and share permissions | [Windows Server and Active Directory](../infrastructure/windows-server-and-active-directory.md) |
| Linux administration | Linux01 | I administer Ubuntu, SSH, SSSD, Kerberos, rsyslog, and log rotation | [Linux Administration](../infrastructure/linux-administration.md) · [SSSD remediation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-sssd-remediation-validation.md) |
| Hybrid identity | SYNC01 | I administer Microsoft Entra Connect and Connect Health services | [Hybrid Identity and Cloud Integration](../infrastructure/hybrid-identity-and-cloud-integration.md) |
| Cloud management | HVHOST01 and VMM01 | I connect Windows management systems and the SQL Server resource to Azure Arc | [Azure Arc validation](../../../evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/evidence/azure-arc-validation-public.txt) |
| VM management | VMM01 and HVHOST01 | I use SCVMM to manage the Hyper-V host and APP01 guest | [Virtualization Architecture](../architecture/virtualization-architecture.md) · [SCVMM evidence](../../../evidence-library/projects/on-prem-home-lab/scvmm-2022/evidence-manifest.json) |
| Backup and recovery | Proxmox VE | I configure scheduled VM backups and perform isolated restore exercises | [Backup and Recovery](../operations/backup-and-recovery.md) · [Restore exercise](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-restore-validation.md) |
| Remote administration | LT-JF01, pfSense, Windows and Linux guests | I use OpenVPN, RDP, WinRM, SSH, and SCVMM console access | [Remote Access](../operations/remote-access.md) |
| Centralized logging | Linux01 and pfSense | I forward selected pfSense events to Linux01 rsyslog | [Monitoring and Logging](../operations/monitoring-and-logging.md) |

## Primary Evidence Sources

- [Proxmox platform inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-platform-inventory.md)
- [DC01 system and role inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/dc01-system-and-role-validation.md)
- [WS01 system and domain inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/ws01-system-and-domain-validation.md)
- [Linux01 system, network, and domain inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-system-network-domain-validation.md)
- [Linux01 SSSD remediation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-sssd-remediation-validation.md)
- [Proxmox backup configuration](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-backup-configuration.md)
- [Proxmox restore exercise](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-restore-validation.md)
- [Azure Arc public validation](../../../evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/evidence/azure-arc-validation-public.txt)
