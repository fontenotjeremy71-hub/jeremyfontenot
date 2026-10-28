# Completed static portfolio replacement

Source: owner-supplied `Jeremy-Fontenot-Static-Site-Brand-Colors-Sitewide-Fixed (1).zip`.
Baseline main: `feda65a89fb0873eb2d2aae2975f211eee077161`.
Scope: one release replacing the website presentation with the supplied literal HTML, CSS, vanilla JavaScript, and immutable downloads. No site build, framework, package installation, or generator is required.

Pages settings inspected: deploy from branch `main`, `/ (root)`, custom domain `jeremyfontenot.online`, HTTPS enforced. CNAME and .nojekyll remain unchanged. No DNS changes.

All 13 supplied case studies and direct proof links are retained. Root presentation pages are replaced with supplied pages or compatibility redirects. Three extra aliases cover Azure Arc, SCVMM and cross-platform administration. `URL-REDIRECT-MAP.csv` records routes; these are HTML refresh redirects with fallback links, not HTTP 301 responses.

Originals are preserved through `original-files.json` with source path, retained path and SHA-256. Existing evidence, project files, source documentation, scripts, manifests and audit artifacts remain. Overwritten presentation narratives are additionally retained byte-for-byte in `docs/source-pages`. The evidence catalog links the complete original inventory. Assets still used by retained source HTML remain for compatibility. No original technical evidence was deleted or rewritten.

Obsolete active generation/browser workflows and npm configuration are retained as inert reference documentation under `docs/workflow-reference`. Active CI now uses Python's standard library for validation only and never generates site files. Existing script sources remain as technical documentation. The standing repository instructions describe the former workflow; the owner's explicit static replacement and merge request governs this release.

Branding is supplied navy (#080d16), teal (#49c2c8), orchid magenta (#b44ca5) and ice cyan (#8adde3). No technical claims were added. Personal-lab boundaries and documentary limitations remain in the supplied case studies. Downloads retain their original bytes; review was limited to owner-supplied public artifacts, integrity and link preservation, not an independent verification of employment or certification.

Validation: `python scripts/validation/validate-static-release.py` checks all shipped local links, fragments, redirects, sitemap, 13 case studies, shared branding, CNAME and original hashes. `git diff --check` checks patch formatting. Production validation adds `--base-url https://jeremyfontenot.online` and compares shipped pages/assets and direct proof downloads to the exact release bytes. Prior npm, PowerShell, generator and Playwright checks are replaced for this release because their generated-content and old presentation contracts no longer apply. Browser review of production is reported in the delivery report.
