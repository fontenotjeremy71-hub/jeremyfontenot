# Phase 3A — Microsoft 365 Evidence Organization

## Scope

This phase organizes the current Microsoft 365 evidence and the preserved SharePoint export collection through a technology-first catalog. It does not move, rename, delete, deduplicate, or silently rewrite source evidence.

Technologies covered:

- tenant administration;
- Entra ID;
- Intune;
- Exchange Online;
- SharePoint;
- Teams;
- security and compliance;
- applications and service principals;
- automation.

## Source collections

| Collection | Source repository | Recorded commit | Preserved location |
|---|---|---|---|
| Microsoft 365 core evidence | `fontenotjeremy71-hub/jeremyfontenot` | `c88894f089e82dba5eb851c82aad703c1af34af2` | `evidence-library/projects/microsoft-365-lab/` |
| Preserved SharePoint export | `jeremyfontenot/JeremyFontenot.github.io` | `5581bd7bf9c61ff77000ac04aa39fcbb04ed004f` | `evidence-library/preserved-sharepoint/source/` |

The SharePoint inventory remains the source of truth for original paths, public paths, sizes, SHA-256 values, titles, categories, extensions, and excerpts.

## Organization method

`content/microsoft-365/evidence-organization.json` defines the approved technologies, logical destinations, supported claims, support levels, source repositories, source commits, and boundaries.

`scripts/build/generate-m365-evidence-organization.js` performs a deterministic inventory and generates:

- `assets/data/m365-evidence-catalog.json` — complete machine-readable catalog;
- `microsoft-365/evidence-catalog.html` — recruiter-facing technology catalog;
- `microsoft-365/source-to-destination-matrix.csv` — complete source-to-logical-destination matrix;
- `microsoft-365/duplicate-groups.json` — exact SHA-256 duplicate groups retained for review;
- `microsoft-365/sensitive-data-review.json` — restricted-extension review;
- `evidence-library/preserved-sharepoint/index.html` — date-neutral preserved-source navigation.

The generated catalog records:

- stable evidence ID;
- collection;
- source repository;
- source commit;
- original source path;
- established public path;
- size;
- SHA-256;
- evidence type;
- primary technology;
- cross-technology relationships;
- logical destination;
- publication classification;
- collection context.

## Evidence preservation

Logical destinations describe the approved technology-first organization without destructive file moves. Existing public URLs remain operational. The same SharePoint source page is related to multiple technologies through metadata rather than copied into multiple folders.

Exact duplicates are grouped by SHA-256 and retained. No duplicate is removed automatically.

## Sensitive-data review

The generator rejects symbolic links inside the Microsoft 365 evidence root and fails the build when restricted private-key, certificate-container, password-database, or environment-file extensions are present.

The public catalog omits source excerpts and does not publish credentials, tokens, personal identifiers, or raw private tenant data. Existing public evidence remains subject to the repository-wide security and metadata validators.

## Claim boundaries

The organization supports personal-tenant administration and support capability. It does not claim:

- client or production tenant ownership;
- enterprise-scale administration;
- Intune fleet ownership;
- Exchange mail-flow or transport ownership;
- live SharePoint tenant availability;
- organization-wide security assurance;
- authorship or execution of every script referenced by preserved documentation.

## Commands

```text
npm run build:m365
npm run check:m365
npm run check
npm run build:site
```

The full repository workflow generates the catalog before browser, sitemap, link, accessibility, and deployment validation.

## Compatibility

The established Microsoft 365 and SharePoint evidence paths remain unchanged. The new public route is:

```text
/microsoft-365/evidence-catalog.html
```

The route is included in the sitemap and deployed through the existing allowlisted `microsoft-365` directory.
