# Microsoft 365 Evidence Organization

## Phase boundary

Phase 3A organizes the existing Microsoft 365, Entra, Exchange, Intune, SharePoint, Teams, application, security, and automation evidence. It does not begin Home Lab evidence migration.

No source evidence is deleted, renamed, moved, hidden, or deduplicated. Existing public artifact routes remain intact. Technology pages and machine-readable records reference the established files rather than making duplicate copies.

## Reviewed source snapshots

| Source | Commit | Purpose |
|---|---|---|
| `fontenotjeremy71-hub/jeremyfontenot` | `c88894f089e82dba5eb851c82aad703c1af34af2` | Current portfolio evidence and Phase 2 architecture baseline |
| `jeremyfontenot/JeremyFontenot.github.io` | `5581bd7bf9c61ff77000ac04aa39fcbb04ed004f` | Original public portfolio and preserved SharePoint source context |

The generator reads these committed inventory sources:

- `evidence-library/projects/microsoft-365-lab/m365-entra-proof-inventory-20260605.csv`
- `evidence-library/projects/microsoft-365-lab/m365-entra-proof-hashes-20260605.csv`
- `evidence-library/projects/microsoft-365-lab/evidence/entra-exports-20260605-073748/microsoft-365-lab-evidence-manifest-20260605.csv`
- `evidence-library/preserved-sharepoint/sharepoint-export-inventory.csv`
- `evidence-library/preserved-sharepoint/sharepoint-export-summary-2026.md`

## Technology organization

Evidence is related to the approved technology slugs:

- `tenant-administration`
- `entra-id`
- `intune`
- `exchange-online`
- `sharepoint`
- `teams`
- `security-compliance`
- `applications`
- `automation`

One artifact can support several technologies. The artifact is cataloged once and retains its established path.

## Generated routes

- `/microsoft-365/tenant-administration/`
- `/microsoft-365/entra-id/`
- `/microsoft-365/intune/`
- `/microsoft-365/exchange-online/`
- `/microsoft-365/sharepoint/`
- `/microsoft-365/teams/`
- `/microsoft-365/security-compliance/`
- `/microsoft-365/applications/`
- `/microsoft-365/automation/`
- `/microsoft-365/evidence-catalog/`
- `/microsoft-365/preservation/`

The established `/evidence-library/preserved-sharepoint/index.html` route remains active and unchanged. New Microsoft 365 technology pages reference the preserved collection without rewriting its index or underlying exports.

## Machine-readable outputs

- `assets/data/microsoft-365-evidence-catalog.json`
- `assets/data/microsoft-365-migration-matrix.csv`
- `assets/data/microsoft-365-duplicate-report.json`
- `assets/data/microsoft-365-preservation-report.json`

The catalog records stable identifiers, technology relationships, evidence type, evidence set, source repository, source commit, source path, collection context, current SHA-256, recorded source SHA-256 when available, byte-comparison result, supported claims, publication classification, preservation state, public route, scope, and limitations.

## Integrity and preservation

The generator performs these checks:

1. Records the current SHA-256 of every cataloged public artifact.
2. Verifies current-repository bytes against the exact reviewed Phase 2 source commit.
3. Confirms selected cross-repository control files are exact Git-blob matches to the reviewed original repository snapshot.
4. Compares every current SharePoint public file with the SHA-256 and size context recorded by the reviewed 802-row inventory and discloses matches, mismatches, or missing routes.
5. Detects exact duplicate groups by current SHA-256 and retains every path.
6. Reports zero authorized duplicate removals and zero evidence moves.

The SharePoint comparison is inventory-attested: the inventory itself is an exact Git-blob match to the reviewed original repository, and current public files are compared with its recorded SHA-256 values. Byte differences are classified and reported rather than treated as preserved originals. The build does not claim that it fetched every original repository byte during validation.

## Sensitive-data review

Phase 3A adds metadata, relationships, generated navigation, and integrity reports around evidence that is already public. It does not add new raw tenant exports.

The generated catalog does not publish source excerpts, tenant identifiers, user principal names, credentials, tokens, secrets, or personal record contents. Existing source evidence remains unchanged. Files whose names indicate sanitization or whose current bytes differ from a recorded source hash are classified as `sanitized-derivative`; exact matches are classified according to their preserved public form.

## Claim boundaries

The organization model defines exact claims and support levels. Claims remain limited to personal-tenant review, evidence capture, documentation governance, bounded portal navigation, configuration review, preserved source documentation, and documented validation attempts.

The pages do not claim client or production tenant ownership, enterprise scale, managed Intune fleet administration, Exchange mail-flow ownership, live SharePoint service ownership, security assurance, SOC ownership, or business-impact results.

## Build and validation

```text
npm run build:m365
npm run check:m365
npm run validate:m365
npm run check
npm run test:browser
```

The repository workflow also runs the existing PowerShell, accessibility, content, HTML, responsive visual, Lighthouse, SEO, sitemap, and link validations.

## Completion records

Exact totals by technology, evidence type, evidence set, retained duplicate group, source-hash comparison, and source-to-public-path relationship are generated from repository files rather than maintained manually. Review:

- `/microsoft-365/evidence-catalog/`
- `/microsoft-365/preservation/`
- `/assets/data/microsoft-365-evidence-catalog.json`
- `/assets/data/microsoft-365-migration-matrix.csv`
- `/assets/data/microsoft-365-duplicate-report.json`
- `/assets/data/microsoft-365-preservation-report.json`
