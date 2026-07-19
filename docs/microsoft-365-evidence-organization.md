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

`content/microsoft-365/sharepoint-source-attestation.json` independently pins the external source repository and commit plus the reviewed inventory's site commit, SHA-256, and expected row count. The provenance validator checks every generated record, matches all 802 SharePoint records to inventory rows, and verifies each published derivative independently; changing only generator configuration cannot replace the attested external provenance.

`content/microsoft-365/source-manifest.json` is the completeness contract. It lists approved recursive roots, approved individual files, and reviewed exclusions with reasons. The generator searches tracked repository paths for the configured Microsoft 365 terms and fails when a candidate is neither represented by one physical-artifact record nor explicitly excluded. Publication output, dependency, test-result, Playwright, cache, and generated responsive-review roots are denied at discovery and cannot satisfy source completeness. Generic-path mail-flow incident and RCA material is covered by an explicit reviewed recursive root. Cross-cutting source-map, file-inventory, and integrity manifests that contain Microsoft 365 relationships are individually approved, so these records do not depend on Microsoft 365 terms appearing in their filenames.

## Organization method

`content/microsoft-365/evidence-organization.json` defines the approved technologies, logical destinations, supported claims, support levels, source repositories, source commits, and boundaries. `content/microsoft-365/sensitive-data-exceptions.json` records reviewed identifier exceptions. Tenant and object identifiers use exact tracked-file scopes plus SHA-256 value fingerprints; directory-wide GUID allowances and unmatched exceptions fail validation. High-severity secret patterns cannot be excepted.

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

The current catalog contains 965 physical source artifacts. Generated responsive-review captures remain retained in the repository but are documented exclusions rather than evidence sources.

## Evidence preservation

Logical destinations describe the approved technology-first organization without destructive file moves. They retain collection and relative-source context so separate `README.md`, role, group, and device exports cannot collide. Existing public URLs remain operational. The same SharePoint source page is related to multiple technologies through metadata rather than copied into multiple folders.

Exact duplicates are grouped by SHA-256 and retained. Original-source duplicate groups and linked-public-byte duplicate groups are calculated separately; an original SharePoint hash is never used to claim that a modified public derivative is byte-identical. No duplicate is removed automatically.

## Sensitive-data review

The generator inspects supported CSV, JSON, XML, SVG, HTML, Markdown, text, PowerShell, JavaScript, YAML, patch, log, and transcript content. SVG evidence is scanned as XML text rather than treated as an opaque image. Private keys, client secrets, access or refresh tokens, bearer headers, JWT-like values, passwords, connection secrets, and API keys are high severity and fail generation. Tenant/object IDs, account identifiers, local user-profile identifiers, tenant domains, email addresses, UPN-like values, and public IPv4 or IPv6 addresses remain visible in the review report by type, count, line, and redacted fingerprint. Version strings and private or documentation-reserved IPv4 ranges are not classified as public infrastructure identifiers.

Public identifier values require a reviewed exception with a reason, exact scope, value rule or fingerprint, and reviewer note. Tenant and object identifiers are allowed only when both the exact tracked file and full SHA-256 value fingerprint match. New values in an otherwise reviewed directory remain unresolved and fail public generation. Binary files and screenshots are marked for manual review; OCR is not used. The generated public wording reports that no high-severity secret pattern was detected, describes reviewed identifier findings, and preserves the manual-review limitation instead of claiming complete sensitive-data blocking.

PowerShell password arguments are checked in whitespace and colon forms, including quoted values and the `Pwd` alias. Hard-coded values fail validation, while variable references, parameter declarations, empty arguments, and explicit redaction markers do not create false positives.

`.gitattributes` marks raw and preserved evidence roots as `-text`, including evidence-library, evidence, project evidence, captured artifacts, and evidence inventories. Exact generated Microsoft 365 contracts retain LF rules, including the source-to-destination matrix. Deterministic tests compare Git clean-filter hashes to prove that CRLF raw CSV, JSON, and Markdown bytes are preserved while the generated matrix remains LF-normalized.

Verified repository script sources use the schema-backed `scripts` evidence type and map to the technology `scripts` destination. A technology relationship does not automatically grant a supported claim: the reviewed manifest can narrow claim support when a script or remediation sample is related to automation but does not perform the catalog's read-only tenant-capture workflow.

Preserved SharePoint records support the bounded SharePoint preservation claim by default. Keywords in archived paths, titles, categories, or excerpts may create cross-technology metadata relationships for discovery, but they do not automatically grant automation, security, application, identity, or other capability claims.

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

`build:m365` writes the deterministic outputs and synchronizes integrity metadata. `check:m365` is non-mutating: it generates the expected contract in memory, validates the schema, provenance, claims, destinations, content review, SEO, integrity metadata, source-output separation, Git attribute behavior, and sensitive exception rules, and compares every committed output. Repeated publication builds produce the same 1,247-file artifact while `site/` exists, and the M365 check remains green without treating publication files as sources. The full repository workflow checks drift before any M365 generation can hide it.

## Compatibility

The established Microsoft 365 and SharePoint evidence paths remain unchanged. The new public route is:

```text
/microsoft-365/evidence-catalog.html
```

The route is included in the sitemap and deployed through the existing allowlisted `microsoft-365` directory.
