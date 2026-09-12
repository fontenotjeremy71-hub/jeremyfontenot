# Jeremy Fontenot — Microsoft Systems Administration Portfolio

[![Repository Validation](https://github.com/fontenotjeremy71-hub/jeremyfontenot/actions/workflows/validation.yml/badge.svg)](https://github.com/fontenotjeremy71-hub/jeremyfontenot/actions/workflows/validation.yml)

**Service Desk experience. Systems Administration capability. Work backed by evidence.**

This repository publishes my professional IT portfolio and the sanitized evidence behind my transition from Service Desk into Microsoft-focused systems administration and infrastructure support.

- Live site: https://jeremyfontenot.online
- Systems readiness: https://jeremyfontenot.online/systems-administration.html
- Projects: https://jeremyfontenot.online/projects.html
- Proof index: https://jeremyfontenot.online/proof.html

## Career Target

The portfolio is intentionally aligned to roles such as:

- Junior Systems Administrator
- Infrastructure Support Technician
- Systems Support Specialist
- Microsoft 365 / Entra Support Administrator

My professional experience supplies the user support, incident handling, access troubleshooting, documentation, and escalation foundation. The home lab demonstrates the administration work required for the next step: Windows Server, Active Directory, Group Policy, endpoint security, hybrid identity, virtualization, networking, PowerShell, backup operations, and evidence-driven troubleshooting.

## Featured Microsoft Administration Projects

### Windows LAPS & Advanced Group Policy

**Status: VALIDATED**

Implemented modern Windows LAPS in a Windows Server 2022 Active Directory lab and validated the complete control path.

Demonstrated work includes:

- Windows LAPS schema validation and extension
- Dedicated OU and GPO scoping
- Encrypted local-administrator password backup to Active Directory
- Custom managed `LocalAdmin` account
- Dedicated `GG-LAPS-Password-Readers` security group
- Least-privilege password retrieval by a non-admin reader
- Unauthorized-user negative access testing
- `gpresult` and RSOP validation
- Windows LAPS Operational event analysis
- Administrator-initiated password rotation
- WMI/RPC and firewall troubleshooting
- Sanitized evidence handling with passwords excluded

Case study: https://jeremyfontenot.online/windows-laps-gpo.html

Project files: [`projects/windows-laps-gpo/`](projects/windows-laps-gpo/)

### Microsoft Entra Hybrid Identity & Cloud Sync

**Status: VALIDATED**

Connected the Windows Server Active Directory lab to Microsoft Entra ID with Microsoft Entra Cloud Sync and validated controlled hybrid-identity lifecycle behavior.

Demonstrated work includes:

- Dedicated Cloud Sync OU scope
- User and security-group provisioning
- Department attribute synchronization
- Password Hash Synchronization
- Group membership synchronization
- Source-anchor correlation
- Provisioning-log analysis
- Agent health validation
- gMSA troubleshooting
- Source-authority validation

Case study: https://jeremyfontenot.online/entra-cloud-sync.html

Project files: [`projects/entra-cloud-sync/`](projects/entra-cloud-sync/)

### On-Premises Microsoft Home Lab

The broader lab supplies the infrastructure used for repeatable Microsoft administration practice:

- Windows Server 2022
- Active Directory Domain Services
- DNS and DHCP
- Group Policy
- Windows clients
- Windows Admin Center
- Hyper-V
- System Center Virtual Machine Manager 2022
- Azure Arc
- Proxmox VE
- pfSense
- Ubuntu Linux
- macOS Active Directory integration
- PowerShell remoting and validation
- Backup and isolated restore exercises

Primary case study: https://jeremyfontenot.online/on-prem-home-lab.html

## Additional Validated Work

| Area | Demonstrated work |
| --- | --- |
| Windows Admin Center | WinRM, firewall scoping, remote PowerShell, Windows server/client administration |
| Hyper-V | VM lifecycle, checkpoints, virtual switching, storage expansion and post-change validation |
| SCVMM 2022 | Host onboarding, Run As accounts, logical networks, logical switches, port classification |
| Azure Arc | Connected Machine agent, Windows and SQL inventory, extensions, outbound connectivity |
| Active Directory | Users, groups, OUs, domain clients, policy, identity troubleshooting |
| Cross-platform | Windows, Ubuntu Linux, and macOS systems integrated in the routed home lab |
| PowerShell | Inventory, AD queries, remoting, validation, connectivity testing, evidence collection |

## Evidence Model

Public claims are tied to reviewable evidence whenever practical. Evidence may include:

- sanitized screenshots
- PowerShell output
- event-log findings
- CSV / JSON exports
- configuration summaries
- validation records
- architecture notes
- troubleshooting records
- reusable scripts

The repository distinguishes professional experience from personal-lab work and does not present lab work as production ownership.

Secrets are never portfolio evidence. Published artifacts exclude passwords, LAPS passwords, tokens, VPN credentials, recovery keys, private keys, and other authentication material.

## Repository Structure

```text
.
|-- .github/workflows/          # repository validation
|-- assets/                     # site CSS, JS, images, documents
|-- evidence-library/           # preserved sanitized evidence
|-- projects/
|   |-- entra-cloud-sync/
|   `-- windows-laps-gpo/
|-- scripts/                    # audits and validation tooling
|-- tests/                      # browser / repository checks
|-- index.html                  # recruiter landing page
|-- systems-administration.html # Microsoft systems readiness
|-- projects.html               # project catalog
|-- proof.html                  # claim-to-artifact routes
|-- resume.html
|-- contact.html
`-- sitemap.xml
```

## Repository Validation

GitHub Actions validates pushes and pull requests to `main`. Checks include repository structure, PowerShell syntax, JSON and evidence integrity, accessibility, HTML, SEO, sitemap state, internal links, screenshots, browser behavior, and hiring-manager-facing portfolio quality.

The public site is deployed from `main` through GitHub Pages.

## Portfolio Operating Principle

The purpose of this repository is not to collect technology names. It is to demonstrate a repeatable administration method:

**Understand → Configure → Troubleshoot → Validate → Document → Preserve Evidence**

## Contact

- Website: https://jeremyfontenot.online
- LinkedIn: https://www.linkedin.com/in/jeremy-fontenot/
- GitHub: https://github.com/fontenotjeremy71-hub
- Email: [jeremy.fontenot@jeremyfontenot.online](mailto:jeremy.fontenot@jeremyfontenot.online)
