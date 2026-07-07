# Jeremy Fontenot Portfolio

[![Repository Validation](https://github.com/fontenotjeremy71-hub/jeremyfontenot/actions/workflows/validation.yml/badge.svg)](https://github.com/fontenotjeremy71-hub/jeremyfontenot/actions/workflows/validation.yml)

Static professional portfolio for Jeremy Fontenot, focused on Service Desk experience, infrastructure operations, systems administration practice, Microsoft 365 administration, PowerShell automation, and evidence-backed technical documentation.

Live site: https://jeremyfontenot.online
Repository: https://github.com/fontenotjeremy71-hub/jeremyfontenot

---

## Purpose

This repository publishes a professional IT portfolio designed to show:

* Service Desk and IT Support experience
* Systems administration direction
* Microsoft 365 and Entra administration practice
* On-premises home-lab operations
* PowerShell validation and evidence automation
* Repository governance, link validation, accessibility checks, SEO checks, and proof-backed claims

The site is intentionally structured so public claims trace back to reviewable artifacts, manifests, screenshots, validation records, and documented limitations.

---

## Public Site Pages

| Page                             | Purpose                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| `index.html`                     | Main landing page and professional positioning                                               |
| `projects.html`                  | Technical project catalog                                                                    |
| `on-prem-home-lab.html`          | Proxmox, pfSense, Windows Server, Active Directory, Linux, backup, and validation case study |
| `proof.html`                     | Claim-to-artifact proof index                                                                |
| `dashboard.html`                 | Evidence status dashboard                                                                    |
| `resume.html`                    | Resume page                                                                                  |
| `contact.html`                   | Professional contact page                                                                    |
| `home-lab-operations-proof.html` | Home-lab operations proof page                                                               |

---

## Featured Project Areas

### On-Premises Home Lab and Operations Validation

Personal systems-administration lab using:

* Proxmox VE
* pfSense
* Windows Server
* Active Directory Domain Services
* DNS and DHCP
* Group Policy
* Windows workstation domain membership
* Ubuntu Linux domain integration
* Backup configuration
* Restore validation records
* PowerShell-based validation and evidence collection

This is a personal nonproduction lab. It does not claim enterprise scale, production availability, formal RTO/RPO assurance, or employer/client administration.

### Microsoft 365 and Entra Administration

Personal Microsoft 365 lab evidence covering:

* Domains
* Users
* Groups
* Licensing
* Directory roles
* Conditional Access
* Sign-ins
* Audit activity
* Devices
* Applications
* Service principals
* CSV, JSON, Markdown, screenshot, and manifest artifacts

### Service Desk Troubleshooting and RCA

Documentation focused on:

* Incident triage
* Symptom capture
* Scope definition
* Troubleshooting notes
* Root-cause framing
* Remediation planning
* Escalation-ready documentation

### PowerShell Validation and Evidence Automation

Repository-local validation and automation scripts support:

* PowerShell syntax validation
* Repository structure validation
* JSON validation
* Evidence hash validation
* Evidence claim validation
* Evidence metadata validation
* Accessibility validation
* HTML validation
* SEO validation
* Sitemap validation
* Internal link validation
* Screenshot validation
* Lighthouse score validation

---

## Repository Structure

```text
.
|-- .github/
|   `-- workflows/
|       `-- validation.yml
|-- assets/
|   |-- css/
|   |-- documents/
|   |-- js/
|   |-- logos/
|   |-- og/
|   `-- resume/
|-- artifacts/
|-- evidence-library/
|   `-- projects/
|-- scripts/
|   |-- audits/
|   |-- lighthouse/
|   `-- validation/
|-- tests/
|-- index.html
|-- projects.html
|-- on-prem-home-lab.html
|-- proof.html
|-- dashboard.html
|-- resume.html
|-- contact.html
|-- home-lab-operations-proof.html
|-- sitemap.xml
`-- README.md
```

---

## Evidence Model

Portfolio evidence is classified using clear boundaries:

| Status     | Meaning                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| Validated  | Current evidence directly supports the stated system, configuration, or property                        |
| Tested     | A behavior was exercised and recorded within a defined scope                                            |
| Configured | Configuration is present, but broader behavior is not claimed                                           |
| Limitation | Known gaps, historical values, timeouts, unsupported conclusions, or evidence boundaries are documented |

This repository avoids unsupported claims. When evidence is incomplete, historical, limited, or scoped to a personal lab, that limitation is documented instead of being hidden.

---

## Validation Workflow

The GitHub Actions workflow runs on pushes and pull requests to `main`.

Validation includes:

* PowerShell syntax checks
* Repository health dashboard generation
* Repository structure validation
* JSON validation
* Evidence hash validation
* Evidence claim validation
* Evidence metadata validation
* Accessibility validation
* Public content quality checks
* HTML validation
* Hiring-manager portfolio review test
* Screenshot validation
* Lighthouse score validation
* SEO metadata validation
* Sitemap validation
* Internal link validation

---

## Local Validation

Run validation from the repository root using PowerShell.

```powershell
pwsh -NoProfile -File .\scripts\validation\validate-powershell.ps1
```

```powershell
pwsh -NoProfile -File .\scripts\validation\validate-repo-structure.ps1
```

```powershell
pwsh -NoProfile -File .\scripts\validation\validate-json.ps1
```

```powershell
pwsh -NoProfile -File .\scripts\validation\validate-evidence-hashes.ps1
```

```powershell
pwsh -NoProfile -File .\scripts\validation\validate-evidence-claims.ps1
```

```powershell
pwsh -NoProfile -File .\scripts\validation\validate-evidence-metadata.ps1
```

```powershell
pwsh -NoProfile -File .\scripts\validation\validate-accessibility.ps1
```

```powershell
pwsh -NoProfile -File .\scripts\validation\validate-html.ps1
```

```powershell
pwsh -NoProfile -File .\scripts\validation\validate-seo.ps1
```

```powershell
pwsh -NoProfile -File .\scripts\validation\validate-sitemap.ps1
```

```powershell
pwsh -NoProfile -File .\scripts\validation\validate-links.ps1
```

---

## Deployment

The public site is deployed from the `main` branch through GitHub Pages.

Source of truth:

* Website repository: `https://github.com/fontenotjeremy71-hub/jeremyfontenot`
* Public site: `https://jeremyfontenot.online`
* Default branch: `main`

---

## Evidence and Privacy Boundaries

This repository contains sanitized public portfolio evidence only.

It does not contain:

* Employer or client system data
* Production system credentials
* Private infrastructure secrets
* Unsupported enterprise availability claims
* Unsupported security assurance claims
* Unsupported RTO/RPO claims

Home-lab source material is copied only as sanitized public evidence where appropriate.

---

## Maintenance Notes

When updating the site:

1. Keep visible claims aligned with the proof index.
2. Update evidence manifests when artifacts change.
3. Preserve limitations where evidence does not fully support a broader claim.
4. Run repository validation before pushing.
5. Keep public pages, sitemap entries, internal links, and downloadable artifacts synchronized.
6. Do not add employer/client claims unless they are public, sanitized, and appropriate to disclose.

---

## Contact

* Website: https://jeremyfontenot.online
* LinkedIn: https://www.linkedin.com/in/jeremy-fontenot/
* GitHub: https://github.com/fontenotjeremy71-hub
* Email: [jeremy.fontenot@jeremyfontenot.online](mailto:jeremy.fontenot@jeremyfontenot.online)
