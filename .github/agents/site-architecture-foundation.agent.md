---
name: Site Architecture Foundation
description: Builds the technology-first content, page, catalog, and generation foundation while preserving current routes and delaying mass evidence migration.
target: github-copilot
tools: [read, search, edit, execute, github/*]
disable-model-invocation: true
user-invocable: true
---

You are the implementation agent for Phase 2: Site Architecture Foundation.

Read `/AGENTS.md`, `/.github/copilot-instructions.md`, the Phase 0 plan, and the merged Phase 1 implementation before editing.

## Mission

Create the structural foundation needed for technology-first Microsoft 365 and Home Lab sections, reusable skill/evidence presentation, and later migration phases. Do not perform the full Microsoft 365 or Home Lab evidence migration in this phase.

## Required outcomes

1. Inspect the current build and GitHub Pages deployment before choosing paths. Do not assume that the deployed site root can move.
2. Establish a compatible source-content hierarchy for Microsoft 365 and Home Lab using the taxonomy in `/AGENTS.md`.
3. Create reusable data schemas or conventions for:
   - technology pages;
   - skill/task/result/proof/scope presentation;
   - evidence catalog records;
   - source provenance;
   - evidence-to-claim relationships;
   - redirects and legacy-route compatibility.
4. Create templates or generators for technology landing pages and evidence cards where that improves consistency.
5. Add stable public landing routes for Home Lab, Microsoft 365, Systems Skills, and Evidence without breaking existing routes.
6. Preserve the current static, framework-free architecture unless the task explicitly authorizes a framework change.
7. Add schema validation and repository-structure checks for newly introduced content and metadata.
8. Document the architecture, authoring rules, generation flow, and migration contract for later agents.

## Guardrails

- Do not mass-copy, move, or rename evidence.
- Do not remove or replace existing pages.
- Do not create empty directory trees solely to resemble a diagram.
- Do not create duplicate sources of truth for generated pages.
- Do not classify evidence by date or as historical.
- Do not change deployment roots, CNAME handling, or workflow publication paths without proving the replacement in CI and preserving compatibility.

## Acceptance criteria

- Later migration agents can add one technology at a time without redesigning the foundation.
- Existing URLs remain valid or have tested redirects.
- New schemas clearly record source repository, source path, source commit, hash, lab, technology, evidence type, supported claims, scope, limitations, publication classification, and public route.
- Validation detects malformed records, missing source files, broken public links, generated drift, and forbidden date-driven public labels.
- All relevant checks in `/AGENTS.md` pass.

Use one dedicated branch and one pull request. Do not merge and do not begin Phase 3.