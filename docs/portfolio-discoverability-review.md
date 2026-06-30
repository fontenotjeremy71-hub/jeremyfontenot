# Portfolio Discoverability Review

## Purpose

The automated hiring-manager-oriented portfolio discoverability review checks whether the active portfolio pages make role positioning, home-lab proof, PowerShell validation proof, navigation, evidence boundaries, and reviewer paths easy to inspect.

The review is intended to catch regressions before publication. It runs locally, in the repository validation workflow on push and pull request, and in a weekly GitHub Actions workflow.

## Checks Performed

- Confirms all required active pages exist.
- Confirms Service Desk or IT Support positioning is visible on the homepage.
- Confirms Systems Administration or Infrastructure Operations direction is visible on the homepage.
- Confirms Projects, Proof, Resume, Contact, and Home Lab are linked from primary navigation.
- Confirms a home-lab proof path exists.
- Confirms direct infrastructure proof and PowerShell validation proof are reachable within two internal clicks.
- Confirms Proxmox, DC01, WS01, Linux01, SSSD, backup, restore, and PowerShell validation are discoverable on active pages.
- Counts direct infrastructure evidence links and skills-validation evidence links.
- Classifies direct evidence separately from summaries, manifests, screenshots, claim maps, and supporting documents.
- Fails if an active link says "full evidence" when it points to a summary, manifest, screenshot, reconciliation document, or claim map.
- Warns on vague link labels such as "Learn more".
- Checks duplicate HTML IDs and local internal link targets, including active-page anchors.
- Checks that active proof pages are not orphaned.
- Fails on unsupported claim wording around drift validation, full disaster recovery, guaranteed RTO/RPO, or production/employer administration claims based on personal-lab evidence.
- Confirms visible limitations for personal/nonproduction scope, isolated restore-drill scope, no recurring restore assurance, RTO/RPO limitations, timeout-handling boundaries, and Linux01-specific SSSD validation.

## What This Does Not Prove

This review does not prove that a recruiter, hiring manager, employer, or external reviewer endorses the portfolio. It is not an external recruiter endorsement, hiring decision, job qualification decision, or employment verification.

The review also does not administer the home lab, validate live infrastructure, perform credentialed checks, prove service availability, prove recurring disaster-recovery assurance, guarantee RTO/RPO, or prove production/employer administration. It checks the website repository's active public pages and the public links those pages expose.

## Local Run Command

```powershell
pwsh -NoProfile -File .\tests\Test-HiringManagerPortfolioReview.ps1
```

## Output Report Paths

The script creates or replaces generated reports under:

- `logs/hiring-manager-review/hiring-manager-review.json`
- `logs/hiring-manager-review/hiring-manager-review.csv`
- `logs/hiring-manager-review/hiring-manager-review.md`

These generated reports are intended for local inspection and workflow artifacts, not source control.

## Exit-Code Behavior

- Exits `1` when any critical `FAIL` result exists.
- Exits `0` when results contain only `PASS` and `WARNING`.
- Warnings remain warnings in console output and reports; they are not silently converted to passes.
