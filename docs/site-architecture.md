# Portfolio Site Architecture and Migration Contract

## Purpose

Phase 2 establishes a framework-free, technology-first source and publication foundation. It does not move the Microsoft 365 or Home Lab evidence collections.

The public presentation order is:

1. skill;
2. task performed;
3. result;
4. supporting proof;
5. scope and limitations.

## Stable public routes

| Route | Purpose |
|---|---|
| `/systems-skills/` | Job responsibilities mapped to demonstrated capability |
| `/microsoft-365/` | Microsoft 365 technology map and bounded proof relationships |
| `/home-lab/` | Home Lab technology map and bounded proof relationships |
| `/evidence/` | Evidence architecture, provenance, status, and publication rules |

Existing routes remain active. `content/site/legacy-routes.json` records compatibility relationships without redirecting or removing the established pages.

## Source hierarchy

Platform taxonomies live at:

- `content/microsoft-365/technologies.json`
- `content/home-lab/technologies.json`

Later migration agents add real content under:

```text
content/<platform>/<technology>/
├── content/
├── documentation/
├── evidence/<type>/
└── scripts/
```

Allowed Microsoft 365 technologies:

- tenant-administration
- entra-id
- intune
- exchange-online
- sharepoint
- teams
- security-compliance
- applications
- automation

Allowed Home Lab technologies:

- environment
- proxmox
- active-directory
- dns-dhcp
- networking
- pfsense
- windows-server
- windows-clients
- linux
- backup-recovery
- monitoring-logging
- security
- automation

Allowed evidence types:

- configuration
- exports
- inventories
- manifests
- reports
- screenshots
- scripts-output
- testing
- validation
- documentation

Do not create empty folders. A technology folder begins when an approved phase adds real source material.

## Technology record contract

Each technology record contains:

- stable slug and label;
- accurate result status;
- skill;
- task;
- result;
- proof label and public route;
- scope;
- limitations.

The generator renders these fields consistently so later phases can add one technology without redesigning the page.

## Evidence record contract

`schemas/site-foundation.schema.json` defines the required evidence record fields:

- `id`
- `lab`
- `technology`
- `evidenceType`
- `sourceRepository`
- `sourcePath`
- `sourceCommit`
- `collectionContext`
- `hashAlgorithm`
- `hash`
- `supportedClaims`
- `skill`
- `task`
- `result`
- `scope`
- `limitations`
- `publicationClassification`
- `publicRoute`

`collectionContext` records how, where, and under what reviewed circumstances the artifact was collected, exported, generated, or derived. Repository, path, commit, and hash identify the source object; collection context explains its acquisition and transformation boundaries.

Supported publication classifications:

- `public-original`
- `sanitized-derivative`
- `metadata-only`
- `source-reference-only`

A private or sensitive source stays in its authorized repository. The public portfolio receives a reviewed derivative or metadata record with provenance.

## Claim relationship contract

Each claim relationship contains:

- stable claim identifier;
- exact public claim text;
- related evidence identifiers;
- support level;
- scope;
- limitations.

Supported levels:

- directly-proven
- supported-with-limitations
- configured-not-behavior-tested
- documented-only
- insufficient

A timeout, missing module, access boundary, or untested condition must not be converted into a confirmed failure.

## Generation flow

Source files:

- `content/site/landing-pages.json`
- `content/microsoft-365/technologies.json`
- `content/home-lab/technologies.json`

Generator:

- `scripts/build/generate-site-foundation.js`

Generated build outputs:

- `systems-skills/index.html`
- `microsoft-365/index.html`
- `home-lab/index.html`
- `evidence/index.html`

Commands:

```text
npm run build:foundation
npm run check:foundation
npm run validate:foundation
```

Generated files carry a marker and must not be edited directly. `content/site/generated-foundation-hashes.json` is the committed drift contract for the generated routes.

## Route compatibility

`content/site/legacy-routes.json` supports three strategies:

- `retained-route`: the established route remains active;
- `compatibility-page`: an old route serves a compatibility page;
- `redirect`: an approved redirect forwards the route.

Phase 2 uses retained routes only. Redirects require explicit approval and tests showing that the old and target behavior remain correct.

## Publication contract

`config/publication-manifest.json` defines the public surface.

The deployment copies only:

- required root web files;
- root HTML pages;
- public assets;
- the evidence library;
- approved generated landing-route directories.

Repository source folders such as `.github`, `artifacts`, `config`, `content`, `docs`, `schemas`, `scripts`, `tests`, and `node_modules` are excluded.

`scripts/build/prepare-public-site.js` builds the publication output and validates:

- sitemap routes;
- compatibility routes;
- root-relative and relative internal links against the built artifact;
- forbidden output roots.

Repository-only configuration links must point to an approved public copy or to the repository review surface; they must not depend on excluded source roots.

The GitHub Pages root and CNAME behavior remain unchanged.

## Validation contract

`scripts/validation/validate-site-foundation.js` detects:

- malformed source records;
- duplicate page, route, technology, evidence, or claim identifiers;
- missing technology slugs;
- unsupported status values;
- missing proof and public-link targets;
- missing source files;
- missing collection context;
- unsupported publication classifications;
- unsupported hash algorithms;
- missing source blobs at recorded commits;
- SHA-256 and Git-blob integrity mismatches against the recorded source commit;
- unknown evidence-to-claim relationships;
- missing generated pages;
- forbidden date-driven public labels;
- forbidden evidence classifications;
- unsafe publication-manifest entries.

`npm run check` verifies generated drift and the architecture contract. `npm run check:publication` builds and validates a temporary publication output.

## Migration procedure for later phases

For each approved technology:

1. inventory source artifacts;
2. record source repository, path, commit, collection context, and integrity identifier;
3. review sensitive information;
4. choose publication classification;
5. copy or derive only approved public material;
6. create evidence records and claim relationships;
7. add technology content under the declared source root;
8. generate public pages;
9. preserve old routes or add tested compatibility behavior;
10. update manifests, hashes, links, sitemap entries, and validation;
11. complete responsive and accessibility review;
12. open one focused pull request and do not merge automatically.

## Phase boundary

Phase 2 creates architecture, schemas, generators, stable landing routes, route compatibility records, and an explicit publication manifest. Microsoft 365 and Home Lab evidence migration begins only after this phase is approved and merged.
