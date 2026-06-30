# Corrected Active-Surface Evidence Audit Summary

## Scope

- Website repository: `C:\Users\jeremy\Documents\projects\jeremyfontenot`
- Website commit audited: `cb40684213481769f8f01b61b5c058c4bb01f8d6`
- Operations source repository: `C:\Users\jeremy\Documents\projects\jeremy-homelab-ops`
- Operations commit audited: `6b9f043972cf955d321da6489e546369d4bcfc78`
- Active pages audited: index.html, projects.html, on-prem-home-lab.html, home-lab-operations-proof.html, proof.html, dashboard.html, resume.html, contact.html
- Excluded entirely: `archive/`, retired legacy pages, historical snapshots, `node_modules/`, `.git/`, previous generated audit reports, navigation menus, footer navigation, button labels, standalone link labels, page titles repeated only in metadata, generic headings, accessibility labels, CSS classes, filenames, raw JSON-LD tokens, and generic positioning statements without specific technical assertions.

## Totals

- number of unique canonical technical claims: 54
- number of active-page claim occurrences: 153
- number directly supported: 42
- number supported only by summaries/indexes: 12
- number lacking direct proof: 12
- number requiring sanitization: 10
- number requiring downgrade: 5
- number requiring removal: 0
- number of active broken evidence links: 0
- number of misleading evidence labels: 5
- number of archive findings excluded: 12 archive HTML paths were excluded before claim extraction; no archive finding was carried into the active-surface CSVs.

## Deduplication Method

Claims were identified manually from the content-bearing portions of the eight active HTML pages and canonicalized by exact technical assertion. Repeated copies of the same assertion across hero text, cards, tables, metadata-like descriptions, proof pages, resume skills, and dashboard summaries were merged into one `claim_id` with all active locations listed. The audit did not create rows for navigation menus, footer links, standalone button text, link labels by themselves, raw filenames, raw JSON-LD tokens, generic page headings, or generic professional-positioning language.

## Evidence Matching Method

Evidence was matched semantically and specifically. Linux01/SSSD evidence was assigned only to Linux01, SSSD, SSH, Kerberos, sudo, UFW, rsyslog, and QEMU Guest Agent claims. Microsoft 365 exports were assigned only to Microsoft 365/Entra claims. Backup and restore evidence was assigned only to Proxmox backup, backup-retention, restore-drill, VM-state, and QEMU Guest Agent restore claims. SUPPORTING summaries and INDEX artifacts were not counted as direct proof for `Validated`, `Tested`, `Verified`, or `Current` claims.

## Quality Checks Recorded

- Every row in `active-validated-claims-without-proof.csv` was manually inspected and limited to active-page claims with explicit Current/Validated/Tested/Verified-style wording and no matched PRIMARY, PROCEDURE, or adequate VISUAL artifact.
- No navigation text, footer menu text, standalone button label, archive page text, or generated audit report text appears as a canonical claim.
- No claim uses unrelated Linux SSSD evidence as strongest evidence.
- Active remediation content is present and organized by active page.
- Totals above are reproducible from `active-claim-evidence-audit.csv`, `active-broken-evidence-links.csv`, and `active-misleading-link-labels.csv`.

## Exact Limitations

- This audit did not remediate public pages, source evidence, public evidence files, manifests, claim maps, screenshots, inventories, or validation scripts.
- Binary screenshot and DOCX artifacts were path-checked and classified as `NOT_INSPECTED_BINARY` where their contents were not OCRed or re-rendered during this audit.
- Direct evidence availability includes private ops-source artifacts at commit `6b9f043972cf955d321da6489e546369d4bcfc78`; artifacts marked `SANITIZE` must not be copied raw into the website repository.
- Existing public M365 CSV/JSON artifacts were treated as already-published curated evidence and checked for obvious secret-bearing artifact classes, but this audit did not re-export tenant data.
- Repository validation pass claims were not strengthened from summaries; where direct command-output artifacts were missing or stale relative to the audited ops commit, the claim was marked for downgrade or fresh evidence collection.
- Archive findings were excluded by scope and not used to inflate active-public-surface totals.
- No public pages or evidence files were modified.
