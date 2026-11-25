# Automation and PowerShell

## Administrative Use

I use scripts and command-line tooling for infrastructure inventory, connectivity testing, evidence capture, identity validation, Linux diagnostics, and repository integrity checks.

## Read-Only Collection

My operational workflow prioritizes read-only collection. Evidence summaries identify:

- Proxmox inventory through read-only API objects
- DC01 target-local role and system inventory
- WS01 target-local system, network, and domain inventory
- Linux01 target-local system, network, and domain inventory
- Route and DNS discovery
- Repository and evidence validation

## PowerShell Examples

The evidence supporting target-state inventory uses commands and result objects equivalent to:

```powershell
Get-CimInstance Win32_OperatingSystem
Get-WindowsFeature
Get-ADDomain
Get-ADForest
Get-ADDomainController
Resolve-DnsName ad.jeremyfontenot.online -Server 10.10.20.10
nltest /dclist:ad.jeremyfontenot.online
```

I document these as evidence-oriented administrative checks, not as proof that all related modules or systems are continuously healthy.

## Linux Diagnostics

The Linux SSSD remediation used a diagnostic and validation sequence to identify:

- Failed service units
- Socket state
- Configuration validation
- AD identity lookup
- Authenticated SSH access

I used a backup copy of the original SSSD configuration and retained diagnostic hashes for integrity.

## Repository Validation

The repository includes PowerShell and JSON validation tooling for:

- Repository structure
- Evidence hashes
- Evidence claims
- Evidence metadata
- Content
- HTML
- Links
- JSON
- Accessibility

## Execution Boundaries

I do not claim that an automation script was executed successfully unless repository evidence supports it. Timeout observations, missing PowerShell modules, and credential rejection remain result states rather than hidden failures.

## Evidence

- [PowerShell inventory summary](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/source-summaries/home-lab-inventory-validation.md)
- [SSSD remediation record](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-sssd-remediation-validation.md)
- [Azure Arc validation script](../../../evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/evidence/azure-arc-validation.ps1)
