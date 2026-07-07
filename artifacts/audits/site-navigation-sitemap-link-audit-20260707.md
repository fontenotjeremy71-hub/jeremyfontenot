# Site Navigation, Sitemap, Link, and Evidence Routing Audit - 20260707

Repository: `C:\Users\jeremy\Documents\projects\jeremyfontenot`

Audit date: 2026-07-07

## Final Summary

Final status: PASS after targeted repairs.

The active indexable public page set is eight root HTML pages. `sitemap.xml` now matches those eight canonical `index, follow` pages exactly. `evidence-library/index.html` remains public and reachable by direct URL, but it is classified as a supporting evidence landing page and is marked `noindex, follow`, so it is intentionally not in `sitemap.xml`.

## Active Public Page Inventory

| Page | Classification | Robots | Canonical | Sitemap |
| --- | --- | --- | --- | --- |
| `index.html` | Active public page | `index, follow` | `https://jeremyfontenot.online/` | Included |
| `projects.html` | Active public page | `index, follow` | `https://jeremyfontenot.online/projects.html` | Included |
| `on-prem-home-lab.html` | Active public case-study page | `index, follow` | `https://jeremyfontenot.online/on-prem-home-lab.html` | Included |
| `proof.html` | Active public page | `index, follow` | `https://jeremyfontenot.online/proof.html` | Included |
| `dashboard.html` | Active public page | `index, follow` | `https://jeremyfontenot.online/dashboard.html` | Included |
| `resume.html` | Active public page | `index, follow` | `https://jeremyfontenot.online/resume.html` | Included |
| `contact.html` | Active public page | `index, follow` | `https://jeremyfontenot.online/contact.html` | Included |
| `home-lab-operations-proof.html` | Active public supporting evidence page | `index, follow` | `https://jeremyfontenot.online/home-lab-operations-proof.html` | Included |
| `evidence-library/index.html` | Supporting evidence page | `noindex, follow` | `https://jeremyfontenot.online/evidence-library/` | Excluded |

## Home Lab Operations Proof Decision

`home-lab-operations-proof.html` exists in the repository.

Classification: Active public supporting evidence page.

Recommendation: Keep it public, keep it in `sitemap.xml`, keep it out of the primary navbar, and keep it linked contextually from proof and project evidence paths.

Answers to the required uncertainty checks:

1. Exists: Yes, root-level `home-lab-operations-proof.html`.
2. Linked from current routing/evidence references: Yes. It is in `sitemap.xml`, linked from `proof.html`, listed in `README.md`, included in `tests/Test-HiringManagerPortfolioReview.ps1`, and referenced by rebuild/publication scripts. It is not a primary navbar page after this repair.
3. Robots metadata: `index, follow`.
4. Canonical URL: `https://jeremyfontenot.online/home-lab-operations-proof.html`.
5. Public safety: Content is bounded to sanitized personal nonproduction home-lab evidence. It links to public-safe README, JSON summary, direct evidence Markdown, and validation outputs. It explicitly excludes raw private inventories, secrets, logs, tokens, keys, ticket-cache details, and production/employer claims.
6. Duplication: Not a duplicate of `proof.html`, `projects.html`, `dashboard.html`, or `evidence-library/index.html`. It is a focused operations proof page; `proof.html` is the broad claim index, `projects.html` is the project catalog, and `dashboard.html` is a status summary.
7. Classification options: Active public page as a supporting evidence page. It is not deprecated, not a removal candidate, and not a primary-navbar candidate.
8. Public treatment: It remains in `sitemap.xml` and contextual proof links. It was not added to the primary navbar.
9. Removal/noindex treatment: Not applicable. Current content is public-safe and evidence-backed.
10. Deletion: Not performed.

## Other Home Lab and On-Prem Pages

| Page or path | Classification | Decision |
| --- | --- | --- |
| `on-prem-home-lab.html` | Active public case-study page | Keep public and keep in sitemap. It is routed from homepage, project cards, proof links, footer evidence references, and home-lab proof content. |
| `home-lab-operations-proof.html` | Active public supporting evidence page | Keep public and keep in sitemap, but do not place in primary navbar. |
| `home-lab-operations.html` | Not present | No action. |
| `home-lab-proof.html` | Not present | No action. |
| `operations-proof.html` | Not present | No action. |
| `evidence-library/projects/on-prem-home-lab/` | Supporting evidence directory | Keep as linked public evidence artifacts. |
| `evidence-library/projects/home-lab/` | Not present | No action. |

## Sitemap Status

Status: Repaired and verified.

The sitemap contains only canonical `index, follow` public pages:

```text
https://jeremyfontenot.online/
https://jeremyfontenot.online/projects.html
https://jeremyfontenot.online/on-prem-home-lab.html
https://jeremyfontenot.online/proof.html
https://jeremyfontenot.online/dashboard.html
https://jeremyfontenot.online/resume.html
https://jeremyfontenot.online/contact.html
https://jeremyfontenot.online/home-lab-operations-proof.html
```

No missing sitemap entries remain for active indexable public pages. No `noindex` or supporting-only pages are listed.

## Navbar Status

Status: Repaired and verified.

Primary navbar order is now consistent across audited public HTML pages:

```text
Home
Projects
Proof
Dashboard
Resume
Contact
```

`Home Lab` was removed from the primary navbar to align with the current six-item primary navigation pattern. `on-prem-home-lab.html` and `home-lab-operations-proof.html` retain contextual project/evidence links and use Projects as the parent primary-nav context.

Mobile menu controls were checked:

- `.nav-toggle` has `aria-expanded="false"`.
- `.nav-toggle` points to `aria-controls="primary-menu"`.
- `#primary-menu` exists on each audited page.
- `assets/js/site.js` closes the menu on link click, outside click, Escape, and desktop resize.

## Footer Status

Status: Repaired and verified.

Footer changes:

- Added `Dashboard` to compact footer navigation where it was missing.
- Added `Sitemap` links pointing to `./sitemap.xml` on root pages.
- Added `Sitemap` to `home-lab-operations-proof.html` premium footer.
- Added `Sitemap` to `evidence-library/index.html` footer as `../sitemap.xml`.
- Kept home-lab proof links contextual rather than promoting `home-lab-operations-proof.html` into every footer.

## Canonical, Robots, Metadata, and Structured Data Status

Status: Repaired and verified.

Repairs:

- Added Twitter title, description, and image metadata to `home-lab-operations-proof.html`.
- Added Twitter title, description, and image metadata to `evidence-library/index.html`.
- Added JSON-LD `CollectionPage` structured data to `evidence-library/index.html`.
- Changed `evidence-library/index.html` robots from `index, follow` to `noindex, follow` because current repository evidence classifies it as a supporting evidence landing page, not an active sitemap route.
- Confirmed `og:url` matches canonical for audited pages.

## Broken Links Found and Fixed

Found and fixed:

- `projects.html` linked to `./.github/workflows/validation.yml`. The Pages deployment excludes `.github`, so the local path would not be public. Replaced it with the GitHub-hosted workflow URL and added `target="_blank" rel="noopener noreferrer"`.

No missing local href/src targets, case-sensitive path mismatches, or broken HTML fragments remained in the post-repair audit pass.

## Evidence and Proof Link Issues

Status: Repaired and verified.

- `home-lab-operations-proof.html` claims were kept bounded to sanitized personal nonproduction home-lab evidence.
- Public proof links point to existing README, JSON, Markdown, TXT, CSV, DOCX, PNG, and workflow targets.
- No new proof, metric, production, enterprise, employer/client, SLA, RTO/RPO, recurring restore, or security assurance claim was added.
- Evidence hash inventory was updated only for the changed `evidence-library/index.html` entry.

## Accessibility Status

Status: Verified.

Checks performed:

- One `h1` per audited page.
- `html lang="en"` present.
- Viewport meta present.
- Skip link points to `#main`.
- `main id="main"` present.
- No duplicate IDs found.
- Buttons have accessible names.
- Images have `alt` attributes.
- Fragment links target existing IDs.
- Reduced-motion CSS behavior remains in `assets/css/site.css`.

## JavaScript Status

Status: Verified.

`assets/js/site.js` passed `node --check`. Behavior reviewed:

- Mobile menu opens and closes.
- Escape closes the menu and returns focus to the toggle.
- Nav links close the menu.
- Outside click closes the menu.
- Desktop resize closes the mobile menu.
- Reveal animations respect `prefers-reduced-motion`.
- Filter buttons are guarded by element existence checks.
- No counter logic is present, so counters cannot fail when absent.

No www redirect logic exists in the current `assets/js/site.js`.

## Validation and Reporting References

Status: Repaired and verified.

- Updated `tests/Test-HiringManagerPortfolioReview.ps1` to match the six-item primary navbar expectation and include Dashboard as a required primary navigation link.
- Preserved active required page coverage for all eight root public pages, including `home-lab-operations-proof.html`.
- Kept `home-lab-operations-proof.html` reachable from the homepage graph through contextual project/proof routing.

## Validation Commands Run

Available and passed:

```powershell
node --check assets/js/site.js
pwsh -NoProfile -File .\scripts\validation\validate-powershell.ps1
pwsh -NoProfile -File .\scripts\audits\generate-repository-health-dashboard.ps1
pwsh -NoProfile -File .\scripts\validation\validate-repo-structure.ps1
pwsh -NoProfile -File .\scripts\validation\validate-json.ps1
pwsh -NoProfile -File .\scripts\validation\validate-evidence-hashes.ps1
pwsh -NoProfile -File .\scripts\validation\validate-evidence-claims.ps1
pwsh -NoProfile -File .\scripts\validation\validate-evidence-metadata.ps1
pwsh -NoProfile -File .\scripts\validation\validate-accessibility.ps1
pwsh -NoProfile -File .\scripts\validation\validate-content.ps1
pwsh -NoProfile -File .\scripts\validation\validate-html.ps1
pwsh -NoProfile -File .\tests\Test-HiringManagerPortfolioReview.ps1
npm install --no-save playwright
npx playwright install chromium
pwsh -NoProfile -File .\scripts\validation\validate-screenshots.ps1
pwsh -NoProfile -File .\scripts\lighthouse\validate-lighthouse-scores.ps1
pwsh -NoProfile -File .\scripts\validation\validate-seo.ps1
pwsh -NoProfile -File .\scripts\validation\validate-sitemap.ps1
pwsh -NoProfile -File .\scripts\validation\validate-links.ps1
```

Not available:

- Root `package.json` is not present, so repo-root `npm test`, `npm run validate`, `npm run lint`, and `npm run build` are not available.
- `tools/package.json` exists but has no `test`, `validate`, `lint`, or `build` scripts.

## Remaining Limitations

- External URLs were not rewritten except the clearly non-public `.github` deployment path in `projects.html`.
- External network availability was not treated as proof of portfolio correctness.
- `evidence-library/index.html` remains public by direct URL but is intentionally `noindex, follow` and omitted from the sitemap.
- On project-detail/supporting evidence pages, the primary navbar uses Projects as the parent navigation context while canonical page identity remains in metadata and sitemap.
