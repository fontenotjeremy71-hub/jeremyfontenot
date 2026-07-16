# Portfolio Rebuild Agent Guide

This repository defines seven manually selected GitHub Copilot custom agents under `.github/agents/`. Use one agent for one phase, review and merge its pull request, then begin the next phase.

The custom agents become available in the GitHub Agents selector after this configuration is merged into the repository's default branch.

## Required sequence

1. `Portfolio Inventory Planner`
2. `Job Readiness Presentation`
3. `Site Architecture Foundation`
4. `Microsoft 365 Evidence Organizer`
5. `Home Lab Evidence Organizer`
6. `Evidence Skill Mapper`
7. `Portfolio QA Auditor`

Do not run the two migration agents against the same branch. Finish and merge the architecture foundation first. Microsoft 365 and Home Lab migration pull requests may be prepared separately, but each must start from the latest approved base and must be reconciled before the mapping phase.

## Shared rules

Every agent must read `/AGENTS.md` and `/.github/copilot-instructions.md`.

- No evidence deletion.
- No evidence classification as historical.
- No direct work on `main`.
- No automatic merging.
- One focused phase per branch and pull request.
- Existing live routes remain supported until redirects and deployment are validated.
- Public claims remain limited to direct repository evidence.
- Sensitive raw evidence is represented through sanitized derivatives or metadata-only proof records rather than unsafe publication.
- Dates remain metadata and filenames, not live-site headings, navigation, buttons, or status labels.

## Phase 0 prompt

Select `Portfolio Inventory Planner` and submit:

```text
Audit the current portfolio repository and the two approved read-only source repositories. Produce the complete Phase 0 inventory and migration plan required by your agent profile. Make no repository changes and do not open a pull request. Include the current-path-to-proposed-path matrix, evidence-to-skill summary, sensitive-data risks, retained duplicate report, broken-link/deployment risks, and phased pull-request sequence.
```

Save and review the returned plan before starting implementation. Resolve any unclear source or publication decisions first.

## Phase 1 prompt

Select `Job Readiness Presentation` and submit:

```text
Implement Phase 1 only. Reframe the homepage and create the Systems Administration Readiness page around experienced IT support plus demonstrated junior systems administration capability. Add target roles, practical contribution tasks, capability groups, professional-to-lab connection, a readiness matrix, recruiter-oriented calls to action, metadata, navigation, sitemap updates, responsive visual review, and full validation. Do not move evidence. Work on a dedicated branch and open a pull request without merging it.
```

## Phase 2 prompt

Select `Site Architecture Foundation` and submit:

```text
Implement Phase 2 only using the approved Phase 0 plan and merged Phase 1 work. Create a technology-first, deployment-compatible foundation for Microsoft 365, Home Lab, Systems Skills, and Evidence, including schemas, templates or generators, provenance fields, route compatibility, redirects, validation, and architecture documentation. Do not mass-migrate evidence. Open a focused pull request and do not merge it.
```

## Phase 3A prompt

Select `Microsoft 365 Evidence Organizer` and submit:

```text
Implement the approved Microsoft 365 migration only. Inventory the current repository and original public repository first, then preserve and organize every Microsoft 365, Entra, SharePoint, Exchange, Intune, Teams, security, application, and automation artifact by technology and evidence type. Build provenance, manifests, hashes, claim mappings, public-safe derivatives, technology pages, redirects, and validation. Do not delete evidence, classify it as historical, or begin Home Lab migration. Open a pull request without merging it.
```

## Phase 3B prompt

Select `Home Lab Evidence Organizer` and submit:

```text
Implement the approved Home Lab migration only. Inventory the current repository, the authoritative home-lab operations repository, and any source-only original portfolio artifacts first. Preserve and organize every Home Lab artifact by technology and evidence type, maintain authoritative-source references, create public-safe snapshots where needed, retain duplicates, build provenance and claim mappings, create technology pages, preserve result boundaries, update redirects and validation, and open a pull request without merging it. Do not begin Phase 4.
```

## Phase 4 prompt

Select `Evidence Skill Mapper` and submit:

```text
Implement Phase 4 only after both migration phases are merged. Build the machine-readable evidence catalog, human-readable proof indexes, Systems Skills pages, junior administrator readiness matrix, practical contribution statements, recruiter-friendly filters, and complete evidence-to-skill and evidence-to-claim relationships. Preserve all evidence and exact scope limitations. Open a focused pull request without merging it.
```

## Phase 5 prompt

Select `Portfolio QA Auditor` and submit:

```text
Perform final full-site QA and release-readiness work only. Audit repository structure, evidence preservation, claims, sensitive data, generated files, hashes, metadata, all links, all routes, sitemap, redirects, accessibility, SEO, Lighthouse, responsive overflow, visual quality at every configured viewport, browser behavior, Linux build preflight, and GitHub Pages compatibility. Correct defects without weakening validation or deleting evidence. Open a pull request and provide an explicit READY or NOT READY recommendation. Do not merge or bypass the normal deployment workflow.
```

## Pull request review gate

Before merging any implementation phase, confirm:

- the pull request changes only the assigned phase;
- no evidence was deleted, hidden, overwritten, or historically labeled;
- professional and lab claims remain distinct;
- source paths and hashes are recorded for imported evidence;
- sensitive data was reviewed;
- old public routes still work or have tested redirects;
- visual captures cover every primary page and supported viewport;
- exact validation commands and results are included;
- unresolved findings are visible;
- the agent did not begin the next phase.
