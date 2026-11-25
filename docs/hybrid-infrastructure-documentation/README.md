# Hybrid Infrastructure Lab Documentation

## Purpose

I built and administered a personal hybrid infrastructure lab to demonstrate hands-on systems administration and infrastructure operations skills. This documentation records the architecture I designed, the systems I configured, the administrative work I performed, and the technical outcomes I verified.

I use first-person descriptions throughout so the work is presented as my own implementation and administration experience. The documentation focuses on demonstrated skills across virtualization, networking, Windows Server, Active Directory, Linux, Microsoft Entra ID, Azure Arc, automation, backup and recovery, monitoring, logging, and troubleshooting.

## Skills Demonstrated

| Skill area | Work I document | Documentation |
|---|---|---|
| Infrastructure architecture | Physical compute, storage, virtualization layers, guest roles, and system relationships | [Infrastructure Overview](architecture/infrastructure-overview.md) · [Physical Infrastructure](architecture/physical-infrastructure.md) · [Virtualization Architecture](architecture/virtualization-architecture.md) |
| Virtualization and systems management | Proxmox VE, VM lifecycle, Hyper-V, SCVMM, virtual networking, and guest administration | [Proxmox](infrastructure/proxmox.md) · [Virtualization Architecture](architecture/virtualization-architecture.md) |
| Networking and security | pfSense, routing, VLAN segmentation, DNS, DHCP, OpenVPN, and remote network access | [Network Architecture](architecture/network-architecture.md) · [pfSense](infrastructure/pfsense.md) · [Network Reference](reference/network-reference.md) |
| Windows Server and identity | AD DS, FSMO roles, DNS, DHCP, Group Policy, computer objects, Remote Desktop, and file-share permissions | [Windows Server and Active Directory](infrastructure/windows-server-and-active-directory.md) |
| Linux administration | Ubuntu, realmd, SSSD, Kerberos, SSH, rsyslog, service management, and troubleshooting | [Linux Administration](infrastructure/linux-administration.md) |
| Hybrid identity and cloud | Separate Microsoft Entra tenant integrations using Cloud Sync and Entra Connect Sync, plus Azure Arc and Windows Admin Center | [Hybrid Identity and Cloud Integration](infrastructure/hybrid-identity-and-cloud-integration.md) |
| Automation and administration | PowerShell, PowerShell Remoting, SSH, reusable connection functions, Microsoft Graph, and administrative tooling | [Automation and PowerShell](operations/automation-and-powershell.md) |
| Backup, recovery, and operations | Proxmox backup configuration, isolated restore exercises, monitoring, logging, and troubleshooting | [Backup and Recovery](operations/backup-and-recovery.md) · [Monitoring and Logging](operations/monitoring-and-logging.md) · [Troubleshooting](operations/troubleshooting.md) |

## Documentation

### Architecture

- [Infrastructure Overview](architecture/infrastructure-overview.md)
- [Physical Infrastructure](architecture/physical-infrastructure.md)
- [Virtualization Architecture](architecture/virtualization-architecture.md)
- [Network Architecture](architecture/network-architecture.md)

### Infrastructure

- [Proxmox](infrastructure/proxmox.md)
- [pfSense](infrastructure/pfsense.md)
- [Windows Server and Active Directory](infrastructure/windows-server-and-active-directory.md)
- [Linux Administration](infrastructure/linux-administration.md)
- [Hybrid Identity and Cloud Integration](infrastructure/hybrid-identity-and-cloud-integration.md)

### Operations

- [Remote Access](operations/remote-access.md)
- [Automation and PowerShell](operations/automation-and-powershell.md)
- [Monitoring and Logging](operations/monitoring-and-logging.md)
- [Backup and Recovery](operations/backup-and-recovery.md)
- [Troubleshooting](operations/troubleshooting.md)

### Reference

- [Infrastructure Inventory](reference/infrastructure-inventory.md)
- [Network Reference](reference/network-reference.md)
- [Service and Evidence Reference](reference/service-and-evidence-reference.md)

## How I Use This Documentation

I organize the material so a reader can understand the architecture first, review the systems and technologies I administered, and then follow the operational procedures and supporting evidence. The inventory and reference pages provide shared technical values so individual technology pages do not need to repeat entire infrastructure tables.
