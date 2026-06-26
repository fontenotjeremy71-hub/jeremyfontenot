# Final Validation

## Preflight

- Website repository confirmed: `C:\Users\jeremy\Documents\projects\jeremyfontenot`
- Website branch before edits: `main`
- Website local commit before edits: `a95259d90717695acebf8840d740fde178adda8a`
- Website remote commit before edits: `a95259d90717695acebf8840d740fde178adda8a`
- Home-lab source commit used: `3d42a4808a6a0607d78f4f4e7fd1e71783729a6b`
- Home-lab repository modification check: clean after website edits.

## Validation Commands

- `git diff --check`: passed.
- `pwsh -NoProfile -File scripts\validation\validate-json.ps1`: passed.
- `pwsh -NoProfile -File scripts\validation\validate-html.ps1`: passed.
- `pwsh -NoProfile -File scripts\validation\validate-sitemap.ps1`: passed.
- `pwsh -NoProfile -File scripts\validation\validate-seo.ps1`: passed.
- `pwsh -NoProfile -File scripts\validation\validate-accessibility.ps1`: passed.
- `pwsh -NoProfile -File scripts\validation\validate-links.ps1`: passed after correcting the PowerShell automation proof link.
- `pwsh -NoProfile -File scripts\validation\validate-screenshots.ps1`: passed.
- `pwsh -NoProfile -File scripts\validation\validate-evidence-claims.ps1`: passed.
- `pwsh -NoProfile -File scripts\validation\generate-evidence-hashes.ps1`: regenerated the evidence hash inventory.
- `pwsh -NoProfile -File scripts\validation\validate-evidence-hashes.ps1`: passed.
- `pwsh -NoProfile -File scripts\validation\validate-powershell.ps1`: passed.
- `pwsh -NoProfile -File scripts\validation\validate-repo-structure.ps1`: passed.
- `pwsh -NoProfile -File scripts\lighthouse\validate-lighthouse-scores.ps1 -BaseUrl http://127.0.0.1:4173`: existing Lighthouse report validation passed.

## Responsive Review

- Local static server: `http://127.0.0.1:4173`
- Local after-captures: 40 screenshots across 8 pages and 5 viewport sizes.
- Live before-captures: 40 screenshots across 8 pages and 5 viewport sizes.
- Viewports: 1440x1000, 1024x768, 768x1024, 390x844, 320x568.
- Result: no horizontal overflow detected; each captured primary page reported one H1.

## Lighthouse

Fresh Lighthouse reports were generated through `npx -y lighthouse` for seven primary pages, desktop and mobile, under `artifacts/site-audit/lighthouse`.

- Reports generated: 14
- Minimum performance score: 1.00
- Minimum accessibility score: 1.00
- Minimum best-practices score: 1.00
- Minimum SEO score: 1.00
- Limitation: Lighthouse emitted Windows temp-profile cleanup permission warnings after writing reports.

## DOCX

- DOCX package check: passed.
- LibreOffice conversion: produced PDF successfully.
- Rasterization: produced 9 page PNGs.
- Visual QA: contact sheet reviewed.
- Limitation: packaged `render_docx.py` failed because it treated a LibreOffice warning as conversion failure; manual conversion and rasterization completed.

## Remaining Limits Before Deployment

- The generated DOCX contains a visible TOC section, but not a clickable Word field TOC.
- Live deployment verification cannot be completed until the commit is pushed and the GitHub Pages workflow finishes.
