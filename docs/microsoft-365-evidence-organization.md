# Phase 3A — Microsoft 365 Evidence Organization

## Scope

This phase organizes every tracked Microsoft 365 evidence location and the preserved SharePoint export collection through a technology-first catalog. It does not move, rename, delete, deduplicate, or silently rewrite source evidence.

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

The SharePoint inventory remains the reviewed attestation for original paths, source sizes, source SHA-256 values, titles, categories, extensions, and excerpts. The files at the public paths are presentation or sanitization derivatives, so their sizes and SHA-256 values are calculated independently from the published bytes.

`content/microsoft-365/source-manifest.json` is the completeness contract. It lists approved recursive roots, approved individual files, and reviewed exclusions with reasons. The generator searches every tracked path for the configured Microsoft 365 terms and fails when a candidate is neither represented by one physical-artifact record nor explicitly excluded.

## Organization method

`content/microsoft-365/evidence-organization.json` defines the approved technologies, logical destinations, supported claims, support levels, source repositories, source commits, and boundaries. `content/microsoft-365/sensitive-data-exceptions.json` records narrowly scoped reviewed identifier patterns; high-severity secret patterns cannot be excepted.

`scripts/build/generate-m365-evidence-organization.js` performs a deterministic inventory and generates:

- `assets/data/m365-evidence-catalog.json` — complete machine-readable catalog;
- `microsoft-365/evidence-catalog.html` — recruiter-facing technology catalog;
- `microsoft-365/source-to-destination-matrix.csv` — complete source-to-logical-destination matrix;
- `microsoft-365/duplicate-groups.json` — exact SHA-256 duplicate groups retained for review;
- `microsoft-365/sensitive-data-review.json` — content-aware secret, identifier, personal-data, and binary-review report;
- `evidence-library/preserved-sharepoint/index.html` — date-neutral preserved-source navigation.
- `content/microsoft-365/generated-output-hashes.json` — deterministic integrity contract for every Phase 3A generated output.

The generated catalog records:

- stable evidence ID;
- collection;
- source repository;
- source commit;
- original source path;
- established public path;
- original-source and published-artifact size and SHA-256 where applicable;
- evidence type;
- primary technology;
- cross-technology relationships;
- logical destination;
- publication classification;
- collection context.

## Evidence preservation

Logical destinations describe the approved technology-first organization without destructive file moves. They retain collection and relative-source context so separate `README.md`, role, group, and device exports cannot collide. Existing public URLs remain operational. The same SharePoint source page is related to multiple technologies through metadata rather than copied into multiple folders.

Exact duplicates are grouped by SHA-256 and retained. Original-source duplicate groups and linked-public-byte duplicate groups are calculated separately; an original SharePoint hash is never used to claim that a modified public derivative is byte-identical. No duplicate is removed automatically.

## Sensitive-data review

The generator inspects supported CSV, JSON, XML, HTML, Markdown, text, PowerShell, JavaScript, YAML, log, and transcript content. Private keys, client secrets, access or refresh tokens, bearer headers, JWT-like values, passwords, connection secrets, and API keys are high severity and fail generation. Tenant/object IDs, account identifiers, tenant domains, email addresses, and UPN-like values remain visible in the review report by type, count, line, and redacted fingerprint.

Public identifier values require a path-scoped reviewed exception with a pattern, reason, scope, and reviewer note. Binary files and screenshots are marked for manual review; OCR is not used. The generated public wording reports that no high-severity secret pattern was detected, describes reviewed identifier findings, and preserves the manual-review limitation instead of claiming complete sensitive-data blocking.

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

`build:m365` writes the deterministic outputs and synchronizes integrity metadata. `check:m365` is non-mutating: it generates the expected contract in memory, validates the schema, provenance, claims, destinations, content review, SEO, and integrity metadata, and compares every committed output. The full repository workflow checks drift before any M365 generation can hide it.

## Compatibility

The established Microsoft 365 and SharePoint evidence paths remain unchanged. The new public route is:

```text
/microsoft-365/evidence-catalog.html
```

The route is included in the sitemap and deployed through the existing allowlisted `microsoft-365` directory.
