# Technology-First Content Sources

This directory contains source data for generated portfolio routes. It is not copied into the public site.

## Platform roots

- `content/microsoft-365/`
- `content/home-lab/`
- `content/site/`

The platform taxonomy files establish the allowed technology slugs and the presentation sequence:

`skill → task → result → proof → scope → limitations`

Later migration phases add one technology at a time using this path contract:

```text
content/<platform>/<technology>/
├── content/
├── documentation/
├── evidence/
│   ├── configuration/
│   ├── exports/
│   ├── inventories/
│   ├── manifests/
│   ├── reports/
│   ├── screenshots/
│   ├── scripts-output/
│   ├── testing/
│   └── validation/
└── scripts/
```

Only create folders that contain real source material. Do not create empty directory trees.

## Authoring rules

- Keep original evidence byte-preserved whenever practical.
- Add generated pages, summaries, or sanitized derivatives alongside source provenance.
- Do not delete or automatically deduplicate artifacts.
- Do not classify evidence as historical, legacy, obsolete, or superseded.
- Keep public headings, actions, status labels, and navigation independent of collection dates.
- Keep professional experience separate from personal-lab evidence.
- Record source repository, source path, source commit, integrity identifier, scope, limitations, publication classification, and public route.
- Update generators rather than editing generated foundation pages directly.

See `docs/site-architecture.md` and `schemas/site-foundation.schema.json` for the complete contract.
