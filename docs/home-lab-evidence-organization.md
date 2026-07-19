# Home Lab Evidence Organization

Phase 3B organizes personal Home Lab evidence through metadata and generated catalogs without moving, rewriting, deduplicating, or deleting source artifacts. It does not make infrastructure changes.

## Source model

- Current portfolio: `fontenotjeremy71-hub/jeremyfontenot` at `eb93204b84339a7c5bcb000bef13091dcd5a60f5`. Approved tracked artifacts retain their established routes and use direct Git-object integrity.
- Operations source: `fontenotjeremy71-hub/jeremy-homelab-ops` at `65899f08cb8d19207c5edad7723368ed04f1f1c4`. This repository remains authoritative and read-only. Its records are source references, not copied operational evidence.
- Original portfolio: `jeremyfontenot/JeremyFontenot.github.io` at `5581bd7bf9c61ff77000ac04aa39fcbb04ed004f`. Source-only records remain attested references; four established root routes use generated presentation derivatives with separate source and public integrity.

The explicit current-repository source manifest lists approved recursive roots, approved individual files, reviewed exclusion roots, and reviewed individual exclusions. Twenty-two external attestation manifests preserve one record per physical repository/commit/path identity. Overlapping attestation identities fail generation.

## Generated contract

`npm run build:home-lab` generates:

- `/assets/data/home-lab-evidence-catalog.json`
- `/home-lab/evidence-catalog.html`
- `/home-lab/source-to-destination-matrix.csv`
- `/home-lab/duplicate-groups.json`
- `/home-lab/sensitive-data-review.json`
- `/home-lab/authoritative-source-decisions.json`
- compatibility derivatives at `/active-directory-lab.html`, `/infrastructure.html`, `/network-segmentation.html`, and `/powershell-automation.html`
- deterministic integrity metadata in `content/home-lab/generated-output-hashes.json`

Every catalog record satisfies the shared Phase 2 evidence schema, has one unique logical destination under `content/home-lab/`, and participates in reciprocal bounded claim relationships. Exact source-byte duplicates and public-byte duplicates are reported separately and retained.

`npm run check:home-lab` is non-mutating. It regenerates the complete expected contract in memory, validates source drift, schema rules, integrity, public routes, claims, sensitive-data policy, destination safety, duplicate identities, and deterministic outputs, then compares every output with committed bytes.

## Sensitive-data policy

Supported text formats receive content-aware secret and identifier review. High-severity secret material fails generation. Existing reviewed public identifiers require an exact tracked file and full SHA-256 value fingerprint in the reviewed-exception manifest. Reports contain stable fingerprints rather than clear values. Binary artifacts and screenshots receive an explicit manual-review-required classification; OCR is not used.

## Claim boundaries

Records distinguish directly proven, supported with limitations, configured but not behavior-tested, documented-only, inconclusive, not-tested, and insufficient evidence. The catalog does not claim employer or production ownership, enterprise scale or availability, SLA compliance, full disaster-recovery readiness, recurring restore assurance without recurring proof, security assurance, or current operation based only on an older captured artifact.
