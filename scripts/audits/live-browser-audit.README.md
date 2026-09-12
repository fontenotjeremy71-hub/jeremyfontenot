# Live browser audit

`scripts/audits/live-browser-audit.py` uses Playwright with Chromium against the deployed custom domain. It crawls reachable HTML pages, inventories visible anchors and buttons, browser-clicks unique visible link interactions, checks live destinations, applies high-confidence label-to-destination semantic checks, smoke-tests buttons, and writes a JSON report under `artifacts/`.

The `.github/workflows/live-browser-audit.yml` workflow waits for the GitHub Pages deployment for the exact commit before running the live audit. This keeps repository checks separate from live-deployment verification.
