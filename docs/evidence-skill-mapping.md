# Evidence-to-Skill Mapping

## Scope

Phase 4 adds a generated relationship layer over the authoritative Microsoft 365 and Home Lab evidence catalogs. It does not copy, rename, delete, deduplicate, reclassify, or replace physical evidence records.

Authoritative evidence sources remain:

- `assets/data/m365-evidence-catalog.json`
- `assets/data/home-lab-evidence-catalog.json`

The Phase 4 source configuration is `content/site/evidence-skill-mapping.json`. It defines the approved skills, readiness labels, relationship types, practical tasks, job relevance, scope, limitations, and development areas.

## Generated contract

`npm run build:skill-map` produces:

- `assets/data/evidence-skill-map.json`
- `systems-skills/evidence-map.html`
- `evidence/claim-map.html`
- `content/site/generated-skill-map-hashes.json`

The machine-readable output references evidence IDs and source catalogs. It adds supported skills, systems, relationship type, validation status, and reciprocal claims without restating evidence provenance or integrity as a new source of truth.

Restricted, metadata-only, and source-reference-only records remain discoverable in the relationship layer but do not receive invented public artifact routes.

## Readiness boundaries

Readiness labels are evidence-bounded:

- `professionally-applied`
- `demonstrated-in-lab`
- `validated-through-testing`
- `documented-and-reviewed`
- `development-area`

Professional Service Desk experience remains distinct from personal-lab systems administration evidence. The mapping does not claim employer or production ownership, enterprise availability, security assurance, Intune fleet ownership, Exchange production mail-flow ownership, full disaster-recovery readiness, recurring restore assurance, RTO, RPO, or organization-wide operational impact.

## Validation

`npm run check:skill-map` is non-mutating. It runs deterministic and negative mapping tests, regenerates the expected contract in memory, and compares every committed generated output byte-for-byte. The shared build, publication, provenance, reciprocal-claim, accessibility, SEO, link, responsive, and browser checks cover the published routes.
