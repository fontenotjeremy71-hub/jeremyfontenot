# Automation and PowerShell

## Administrative Automation

I use PowerShell and command-line tools to administer Windows systems, collect infrastructure inventory, inspect network configuration, validate identity services, troubleshoot connectivity, and maintain the documentation repository.

## Windows Administration

I use Windows PowerShell and PowerShell 7 for local and remote administration. My Active Directory workflow includes domain, forest, domain-controller, DNS, DHCP, and Group Policy administration.

```powershell
Get-CimInstance Win32_OperatingSystem
Get-WindowsFeature
Get-ADDomain
Get-ADForest
Get-ADDomainController
Resolve-DnsName ad.jeremyfontenot.online -Server 10.10.20.10
Test-NetConnection ws01.ad.jeremyfontenot.online -Port 3389
```

I use PowerShell remoting to administer Windows servers and use SSH for Linux and Proxmox administration.

## Reusable Administration Profile

I maintain reusable PowerShell profile functions to simplify connections to my lab systems and cloud administration services.

| Function | Administrative use |
|---|---|
| `Connect-DC01` | I open a remote PowerShell session to DC01 |
| `Connect-HVHOST01` | I open a remote PowerShell session to HVHOST01 |
| `Connect-LabSSH` | I connect to Proxmox or Linux01 over SSH |
| `Connect-Proxmox` | I connect to the Proxmox host |
| `Connect-Linux01` | I connect to Linux01 |
| `Connect-LabAzure` | I authenticate to Azure for lab administration |
| `Connect-LabGraph` | I connect to Microsoft Graph |
| `Connect-LabExchange`, `Connect-LabTeams`, `Connect-LabSharePoint` | I connect to the corresponding Microsoft 365 administration services |

## Linux Diagnostics

I use Linux service and socket inspection, SSSD configuration validation, directory identity lookup, SSH testing, and log review to troubleshoot Linux01. During the SSSD remediation, I inspected failed units and responder sockets, corrected the configuration conflict, restarted the service, and verified domain identity access.

## Repository Validation

I use PowerShell and JSON validation tooling in the repository to check documentation structure, evidence hashes, evidence metadata, content, HTML, links, JSON, and accessibility.

## Evidence

- [Home lab inventory and validation workflow](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/source-summaries/home-lab-inventory-validation.md)
- [Linux01 SSSD remediation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-sssd-remediation-validation.md)
- [Azure Arc validation script](../../../evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/evidence/azure-arc-validation.ps1)
