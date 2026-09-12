# Evidence Library

This folder stores curated, sanitized portfolio evidence for my IT support, systems administration, networking, automation, and documentation work.

The library is preservation-first. Source files, supporting archive material, and historical context should be reviewed before cleanup or consolidation so useful proof is not removed accidentally.

## Evidence Standard

Each reviewer-facing artifact should make the following clear:

- **Objective:** the support problem, administrative task, validation need, or operational workflow being addressed.
- **Technical areas:** the systems and skills involved, such as Microsoft 365, Active Directory fundamentals, Windows support, PowerShell, DNS/DHCP, pfSense, VLANs, backup/recovery, monitoring, or RCA.
- **Implementation or workflow:** the configuration logic, troubleshooting sequence, operational steps, or documentation process.
- **Validation method:** the commands, checklist items, syntax checks, link checks, service tests, rollback points, or review steps used to verify integrity.
- **Environment:** whether the evidence is from a lab, preserved historical material, generated documentation, or a compatibility record.
- **Proof boundary:** what the artifact proves and what it does not prove.

## Safety Rules

- Do not invent employers, customers, enterprise access, certifications, or incident metrics.
- Do not expose secrets, private system names, local machine paths, credentials, or customer data.
- Do not claim completed validation unless the file contains actual results, dates, systems, and evidence references.
- Mark planned validation, reusable runbooks, and methodology documents honestly.

## Review Process

Approved evidence should be added in small reviewed batches. After each batch, validate local links, proof references, file paths, draft-only language, and consistency with the public portfolio pages.

## Folder Guidance

- `evidence-library/` is for curated, public-facing evidence, diagrams, and supporting documentation that are intentionally referenced by the site.
- `assets/` is for shared public branding, imagery, styles, and scripts used directly by the portfolio pages.
- `artifacts/` is for local audits, validation exports, and transient screenshots created during maintenance work.
- `artifacts/screenshots/` is local-only validation output and should not accumulate permanent production assets.
- Generated preview images should remain ignored unless they are intentionally promoted to a published evidence asset.
