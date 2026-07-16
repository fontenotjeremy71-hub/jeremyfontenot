# Repository Agent Instructions

## Mission

This public repository presents Jeremy C. Fontenot as an experienced IT support professional with demonstrated junior systems administration capability. Build a clear, accessible, evidence-backed portfolio without overstating production experience.

## Scope and precedence

These instructions apply to the entire repository. A more specific `AGENTS.md` may add local requirements, but it must not weaken the evidence-preservation, security, claim-boundary, review, or validation rules below.

## Non-negotiable evidence rules

- Do not delete, discard, archive, hide, or replace evidence.
- Do not label evidence as `historical`, `legacy`, `obsolete`, or `superseded` as an evidence category or status.
- Dates may remain in filenames and metadata, but public headings, buttons, navigation labels, and status text must not be date-driven.
- Preserve original artifacts byte-for-byte whenever practical. Create derived HTML, summaries, thumbnails, or sanitized public copies alongside the originals; never silently rewrite the source artifact.
- Do not automatically deduplicate evidence. Report exact hash matches for owner review and keep every file unless the owner explicitly approves removal.
- Every evidence item must remain discoverable through an inventory, catalog, manifest, or source map and must be connected to the skill or claim it supports.
- Do not expose credentials, tokens, private keys, password material, recovery data, personal identifiers, client data, or unnecessary tenant/infrastructure identifiers. When raw evidence cannot be safely public, preserve its source reference and publish a sanitized derivative or metadata-only proof record.
- Never move or rename evidence without updating all links, manifests, hashes, generated pages, sitemap references, tests, and redirects in the same pull request.

## Claim boundaries

- Clearly separate professional experience from personal-lab demonstrations.
- Preferred positioning: `Experienced IT support professional with demonstrated junior systems administration capability.`
- Safe role targets include Junior Systems Administrator, Infrastructure Support Technician, Systems Support Specialist, Microsoft 365 Support Administrator, and IT Operations Technician.
- Do not claim production, client, enterprise-scale, high-availability, disaster-recovery, RTO, RPO, SOC, Intune-fleet, Exchange mail-flow, or business-impact ownership unless a repository artifact directly proves the exact claim.
- Use accurate result states such as `validated`, `configured`, `documented`, `inconclusive`, and `not tested`. Do not convert timeouts, missing access, or absent modules into failures without direct evidence.
- Avoid arbitrary readiness percentages. Explain readiness through demonstrated tasks and evidence.

## Source repositories

The following repositories may be inspected as read-only sources:

- Original portfolio and preserved SharePoint exports: `https://github.com/jeremyfontenot/JeremyFontenot.github.io`
- Authoritative home-lab operations source: `https://github.com/fontenotjeremy71-hub/jeremy-homelab-ops`

Do not modify either source repository from a task assigned to this repository. Import only public, reviewed, or sanitized content. Preserve source repository, original path, source commit, hash, and collection context in migration records.

## Required working method

- Read this file, `.github/copilot-instructions.md`, the active phase agent profile, `README.md`, `package.json`, and relevant workflows before editing.
- Work on one named phase only. Do not start a later phase because it appears convenient.
- Never commit directly to `main`.
- Use one focused branch and one reviewable pull request per phase.
- Do not merge the pull request.
- Keep existing live routes operational until replacement routes, redirects, links, sitemap entries, and deployment behavior are validated.
- Inspect before changing. Do not invent files, paths, evidence, results, metrics, or system state.
- Keep generated outputs and source inputs synchronized. Modify generators instead of hand-editing generated files when the repository identifies a generator as authoritative.
- Keep changes framework-free unless the task explicitly authorizes a framework migration.

## Required evidence organization

Use technology-first organization when a phase introduces or migrates content.

Microsoft 365 technologies:

- `tenant-administration`
- `entra-id`
- `intune`
- `exchange-online`
- `sharepoint`
- `teams`
- `security-compliance`
- `applications`
- `automation`

Home Lab technologies:

- `environment`
- `proxmox`
- `active-directory`
- `dns-dhcp`
- `networking`
- `pfsense`
- `windows-server`
- `windows-clients`
- `linux`
- `backup-recovery`
- `monitoring-logging`
- `security`
- `automation`

Within each technology, use the applicable folders:

- `content`
- `documentation`
- `evidence/configuration`
- `evidence/exports`
- `evidence/inventories`
- `evidence/manifests`
- `evidence/reports`
- `evidence/screenshots`
- `evidence/scripts-output`
- `evidence/testing`
- `evidence/validation`
- `scripts`

Do not force empty folders. Do not change the deployed site root without validating the build and GitHub Pages workflows.

## Design and accessibility requirements

- Present the skill and job relevance before exposing raw evidence.
- Use the sequence: skill → task performed → result → supporting proof → scope and limitations.
- All pages must work at narrow mobile, tablet, laptop, and wide desktop widths without horizontal overflow, clipped headings, or overlapping controls.
- Preserve semantic HTML, keyboard navigation, visible focus, descriptive link text, useful alternative text, reduced-motion behavior, readable line length, and sufficient contrast.
- Do not place dates in live-site call-to-action labels or status names.

## Validation

Run the checks relevant to the change and report exact commands and outcomes. For implementation and QA phases, the expected baseline is:

```text
npm ci
npm run check
pwsh -NoProfile -File ./scripts/validation/validate-no-date-proof.ps1
pwsh -NoProfile -File ./scripts/validation/validate-powershell.ps1
pwsh -NoProfile -File ./scripts/validation/validate-repo-structure.ps1
pwsh -NoProfile -File ./scripts/validation/validate-json.ps1
pwsh -NoProfile -File ./scripts/validation/validate-evidence-hashes.ps1
pwsh -NoProfile -File ./scripts/validation/validate-evidence-claims.ps1
pwsh -NoProfile -File ./scripts/validation/validate-evidence-metadata.ps1
pwsh -NoProfile -File ./scripts/validation/validate-accessibility.ps1
pwsh -NoProfile -File ./scripts/validation/validate-content.ps1
pwsh -NoProfile -File ./scripts/validation/validate-html.ps1
pwsh -NoProfile -File ./tests/Test-HiringManagerPortfolioReview.ps1
npx playwright install chromium
npm run test:browser
pwsh -NoProfile -File ./scripts/lighthouse/validate-lighthouse-scores.ps1
pwsh -NoProfile -File ./scripts/validation/validate-seo.ps1
pwsh -NoProfile -File ./scripts/validation/validate-sitemap.ps1
pwsh -NoProfile -File ./scripts/validation/validate-links.ps1
git diff --check
```

If a check cannot run, state why and do not describe it as passing.

## Pull request completion report

Every implementation pull request must summarize:

- phase and scope completed;
- files and routes changed;
- evidence added, copied, moved, or derived;
- source paths and integrity handling;
- claims introduced or revised;
- sensitive-data review;
- redirects and compatibility preserved;
- validation commands and results;
- screenshots or visual-review artifacts;
- unresolved risks and the next approved phase.
