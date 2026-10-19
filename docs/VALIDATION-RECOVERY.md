# Repository validation recovery

This repair restores the validation entry points removed by commit `5f5c9192bf993cd4747f958e4415f38beeb128c2`. The recoverable source is its parent, `c4afad9a6a97a1165a724412433188aed5dfb5b9`.

## Restored checks

The 13 PowerShell entry points listed in AGENTS.md now exist. JSON syntax, PowerShell syntax, repository structure, evidence hashes, evidence metadata, evidence discoverability, HTML structure, accessibility basics, public content, date policy, SEO, sitemap XML/routes, and link/CTA checks are available through one command:

```sh
npm run check:powershell
```

PowerShell 7 is required. The local repair was tested with PowerShell 7.6.7 from Microsoft's Ubuntu package repository; the downloaded package's SHA-256 was verified against that repository's package metadata. The runtime is a local QA dependency, not a website asset. Future testing sessions must provide PowerShell independently.

The GitHub workflow now explicitly checks its PowerShell runtime and runs the restored checks. It also installs Chromium and runs the reproducible browser suite:

```sh
npm run test:browser
```

The original hiring-review PowerShell command remains available and invokes the rendered-browser hiring-review checks instead of assuming a retired navigation layout:

```powershell
pwsh -NoProfile -File ./tests/Test-HiringManagerPortfolioReview.ps1
```

## Adaptations

- HTML and accessibility checks use the publication inventory, avoiding generated browser reports and nonpublished material.
- Date/content policy checks authored headings and controls while preserving dates, product versions, commands, and chronology in source evidence. A source's mention of a placeholder is not treated as unfinished site copy.
- SEO checks canonical pages. Retained evidence indexes must retain usable title, description, and canonical metadata; social-card tags are enforced on authored presentation pages.
- The sitemap check parses XML and validates canonical routes without requiring an optional XSL stylesheet.
- The hash check honors an inventory's explicit publicPath when the original entry's path was previously removed by the owner. It still requires the expected digest to match.
- The evidence keyword check is labeled a metadata-discoverability heuristic; it does not establish technical validation or promote a project status.
- Hiring-review checks exercise the rendered site rather than requiring Proof and Dashboard in a particular navigation position or searching unrendered JavaScript shells for dynamic anchors.
- Older authored presentation shells now receive canonical/Open Graph fallback metadata through the foundation generator. Source evidence is unchanged. The public evidence-library landing page is treated as a generator-managed derivative while its recorded source relationship stays pinned.
- Project-card Evidence links now target each project's retained proof or validation location instead of the generic evidence browser. This repairs a regression exposed by the new hiring-review test.

## Verification

Results are recorded in `artifacts/validation-recovery/results.json`. Browser coverage consists of 30 presentation/case-study pages at four viewport widths, plus search, filtering, keyboard/menu/gallery behavior, and hiring-review paths: 140 tests total.

Local build, standard checks, all 13 PowerShell validators, all 140 browser tests, and packaged-site validation passed. Malformed JSON and PowerShell fixtures were correctly rejected. The restored hiring-review command passed its eight tests. Build drift and GitHub CI are also checked before merge. Lighthouse remains a separate manual audit; this repair does not claim a Lighthouse score.

## GitHub queue investigation

The initial connector response reported the portfolio job queued. Direct run/job details and logs subsequently showed that all steps had completed successfully while the overall run status lagged. Run `39284002895` finalized successfully at `2026-10-19T16:34:18Z`, and approved portfolio PR #105 was merged as `a6b29db95d4a57bd26e4683140c6a03ab2afeb60`.

GitHub's official incident report identifies degraded Actions, Pages, and Webhooks availability beginning `2026-10-19T15:49:25Z`, including delayed workflows and site builds:

https://www.githubstatus.com/incidents/8tzbpcnl75jp

The symptoms are consistent with that incident. No repository billing, permission, or runner settings were changed, and successful checks were not bypassed.
