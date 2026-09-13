# Live browser audit

`scripts/audits/live-browser-audit.py` uses Playwright with Chromium against the deployed custom domain. It crawls manifest-published HTML pages and route-generated HTML paths, inventories visible anchors and buttons, browser-clicks unique visible link interactions, checks live destinations, applies high-confidence label-to-destination semantic checks, smoke-tests buttons, and writes a JSON report under `artifacts/`.

The `.github/workflows/live-browser-audit.yml` workflow waits for the GitHub Pages deployment for the exact commit before running the live audit. This keeps repository checks separate from live-deployment verification.

Reports include a top-level `classification`: `SUCCESS` means the published pages and interactions passed, `REAL_SITE_FAILURE` means the audit observed a site or destination defect, and `EDGE_BLOCKED` means the origin edge returned a known protection response (HTTP 403/429 or a Cloudflare challenge page). Edge-blocked pages are recorded with counts and do not create thousands of derivative page, focus, or target findings; the workflow exits successfully so the result is not misreported as a site failure.

Focus validation checks the authored `:focus`/`:focus-visible` selector contract or an observed computed-style change after focus. This avoids browser-modality false positives when pagination or other mouse interactions precede a programmatic focus probe; it does not waive focus styling for controls that have neither contract nor observed change.
