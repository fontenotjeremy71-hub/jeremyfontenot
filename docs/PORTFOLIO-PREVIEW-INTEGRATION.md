# Portfolio preview integration

Phase: owner-requested presentation integration with established magenta branding.

The uploaded `Jeremy-Fontenot-Portfolio-Preview(1).html` was generated from repository commit `5c130c816cd22a70f734b2c2ee6d6480732b1dc2`, which matched main when implementation began. Its SHA-256 and image extraction provenance are recorded in `content/site/preview/source.json`.

## Result

- Converted the preview into 158 static presentation routes with canonical URLs, normal navigation, and crawlable content. The internal unpublished-preview review report is retained in presentation input but excluded from public navigation and output.
- Applied the repository's established magenta `#d946ef` to buttons, headings, navigation indicators, borders, and accents. Kept the official existing header logo.
- Added About, Experience, Skills, Certifications, Architecture, Home Lab overview, searchable evidence browsing, Gallery, Automation, Troubleshooting, Additional Labs, Documentation, and Site Map pages. Integrated the 13 project case studies at their compatible existing routes or additive routes.
- Kept every existing public route and original evidence artifact. Added compatibility anchors for existing project links. No project statuses or technical completion claims were promoted.
- Preserved existing evidence hubs and catalogs in navigation. The imported evidence browser contains 1,268 source references; these are references, not claims of new validation.
- Removed preview-only notices and noindex metadata from production output. Expanded sitemap discovery from 36 to 180 canonical routes, retaining all existing entries.
- Extracted embedded images byte-for-byte to `assets/preview/`, retaining SHA-256 values. Linked the resume to the existing downloadable assets.
- Sanitized local Windows profile paths in generated presentation copies. Moved one no-longer-emitted exact-file identifier exception into `resolvedExceptions`, preserving its prior record. No new exception was granted for sensitive values.
- Recorded exact reviewed catalog exclusions for generated presentation derivatives; original technical evidence remains independently cataloged.
- Included existing Windows LAPS validation and troubleshooting Markdown documents in the publication manifest so the packaged site's existing links work.

## Build and integrity

`npm run build:preview` rebuilds the presentation from `content/site/preview/` inputs and writes `generated-hashes.json`. Both regular and publication build commands include it. Existing evidence generators and their manifests remain synchronized. The source presentation input is separate from original technical evidence.

No original evidence files were moved, renamed, deleted, or rewritten. Changed evidence-related files are generated catalogs, review reports, matrices, and integrity metadata reflecting the new public presentation.

## Validation

Passed:

- `npm ci`
- `npm run build`
- Repeat `npm run build`, followed by `git diff --stat`: no unstaged drift after staging the generated result.
- `npm run check`: 25 CTA unit tests, 3 typography tests, preserved SharePoint navigation checks, sitemap checks, internal target checks, and CTA semantics checks.
- Internal link audit: 1,806 published HTML pages, 23,862 unique internal targets, and 2,890 fragment targets checked.
- CTA semantics audit: 15,875 visible/literal links and 2,660 label-to-destination contracts checked.
- `node scripts/build/prepare-public-site.js` and `node scripts/build/prepare-public-site.js --check`: validated publication packaging, canonical routes, existing routes, and packaged local links.
- `node --check assets/js/portfolio-preview.js`
- `node --check scripts/build/integrate-portfolio-preview.js`
- `git diff --check`
- Headless Chromium: 17 primary pages at widths 360, 768, 1024, and 1440 pixels: 68 checks with zero overflow, missing primary headings, broken loaded images, or script errors. Project search, evidence filtering, mobile-menu open/Escape behavior, and gallery-dialog open/close also passed.

Browser results and desktop/mobile screenshots are in `artifacts/preview-integration/`. Chromium was supplied through a temporary local QA installation after the standard Playwright browser download failed. QA dependencies were not added to the website.

Unavailable or not run:

- Initial implementation limitation: PowerShell and the referenced validation scripts were unavailable. The subsequent validation repair restores these entry points and tests them; see `docs/VALIDATION-RECOVERY.md`.
- Initial implementation used a separate Chromium audit. The subsequent validation repair supplies `npm run test:browser` and the rendered hiring-review checks.
- Lighthouse score validation was not run.
- The owner subsequently authorized merge of PR #105. Deployment and live verification must be confirmed independently; GitHub reported an Actions/Pages service incident during this work.

## Publication

One focused branch and pull request contain this phase. Main, GitHub Pages, DNS, domain settings, and Cloudflare were not changed. The next action is review and merge of this presentation change; then verify the GitHub Pages deployment and live domain.
