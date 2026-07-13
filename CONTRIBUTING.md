# Contributing

## Workflow

- Keep changes small and focused.
- Check git status before starting work.
- Use branches and pull requests when branch protection requires it.
- Do not move public files unless references are updated.
- Validate before committing.

## Validation

Run before commit:

git status
git diff --check

For JavaScript:
node --check .\path\to\file.js

For generated evidence pages:
npm ci
npm run build:evidence
npm run check:evidence
npx playwright install chromium
npm run test:browser

Markdown sources listed in `scripts/config/evidence-pages.json` are authoritative. Do not edit their generated same-basename HTML files directly. See `docs/evidence-page-generation.md` for the allowlist and removal workflow.

For PowerShell:
pwsh -NoProfile -File .\scripts\validation\validate-powershell.ps1

## Commit Standard

Use clear commit messages.
