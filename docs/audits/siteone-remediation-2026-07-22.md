# SiteOne Full-Site Audit Remediation

## Scope

This record tracks remediation of the SiteOne crawl completed against `https://jeremyfontenot.online` on July 22, 2026. The baseline crawl visited 1,663 URLs and reported an overall quality score of 7.1. The primary portfolio routes were fast and structurally healthy; most severe counts originated from raw preserved SharePoint exports and Cloudflare-generated utility paths.

The remediation preserves evidence-source bytes. Changes are limited to crawler policy, generated presentation outputs, validation gates, sitemap contents, and documented delivery-platform controls.

## Baseline findings

| Area | Baseline finding | Ownership |
|---|---|---|
| Broken URLs | 490 reported 404 responses, overwhelmingly referenced from preserved SharePoint export pages | Repository crawl policy and archival publication boundary |
| Redirects | `/index.html` and `/powershell-automation.html` appeared as redirect hops | Sitemap and external redirect configuration |
| Heading hierarchy | `evidence/claim-map.html` skipped from the page `<h1>` to claim-card `<h3>` elements | Generated presentation output |
| Accessibility | Form-label, landmark, and unnamed-control findings were reported in raw preserved SharePoint exports | Archival source material; source bytes remain immutable |
| Cloudflare paths | `/cdn-cgi/` utility URLs contributed crawler noise, a generated 404, redirects, and uncacheable-asset warnings | Repository crawler policy and Cloudflare delivery layer |
| TLS | TLS 1.0 and TLS 1.1 were accepted by the edge | Cloudflare account setting |
| Response headers | `Permissions-Policy` was absent and `Access-Control-Allow-Origin: *` was widespread | Cloudflare response-header configuration |
| Compression | Brotli was not detected | Cloudflare delivery setting |

## Phase 1 — Crawl integrity

Completed repository controls:

- Raw preserved SharePoint source and documentation trees are disallowed in `robots.txt`.
- Cloudflare `/cdn-cgi/` utility paths are disallowed in `robots.txt`.
- The externally redirected `/powershell-automation.html` route is removed from `sitemap.xml`.
- `scripts/validation/validate-crawl-integrity.js` rejects:
  - missing crawler exclusions;
  - raw archival paths in the sitemap;
  - known redirect-only sitemap entries;
  - duplicate, off-origin, query-bearing, or fragment-bearing sitemap URLs;
  - removal of required recruiter-facing routes.
- The crawl-integrity gate runs as part of `check:publication`.

Expected effect on a fresh crawl:

- Raw archival pages should be skipped instead of treated as normal SEO and accessibility landing pages.
- Cloudflare utility paths should stop contributing crawl noise.
- The sitemap should no longer advertise the known PowerShell redirect hop.

## Phase 2 — Semantic structure and accessibility

Completed repository controls:

- Generated claim-map output now includes an explicit `<h2>` section heading before claim-card `<h3>` headings.
- The claim grid references that section heading through `aria-labelledby`.
- The generated claim-map hash manifest is refreshed after semantic normalization.
- The skill-map build and validation commands enforce deterministic normalized output.
- Regression tests require the section heading and labelled claim grid.

Preserved-source boundary:

- The reported unlabeled form controls and other legacy semantic defects occur in raw preserved SharePoint export pages.
- Those source artifacts are retained without byte changes for evidence integrity.
- Their raw source and documentation trees are excluded from crawler indexing rather than rewritten.

## Phase 3 — Security and delivery policy

### Repository-controlled work completed

- Cloudflare utility routes are removed from crawler scope.
- Delivery-platform findings are separated from repository-controlled findings in this audit record.
- No unsupported `_headers` file or HTML meta substitute is used to imply that GitHub Pages can set edge response headers.
- Cross-origin isolation headers are not enabled blindly because they can block external resources and change site behavior.

### Cloudflare controls still requiring account-level application

These items cannot be completed through the GitHub repository alone:

1. Set the edge minimum TLS version to **TLS 1.2** so TLS 1.0 and TLS 1.1 are rejected.
2. Add a scoped `Permissions-Policy` response header. A conservative starting value is:

   ```text
   camera=(), microphone=(), geolocation=(), payment=(), usb=()
   ```

3. Add an archive-path response rule for both preserved SharePoint subtrees:

   ```text
   X-Robots-Tag: noindex, nofollow, noarchive
   ```

4. Review the source and scope of `Access-Control-Allow-Origin: *`. Keep it only where cross-origin access is intentionally required, such as selected public static assets; do not remove it globally without testing.
5. Enable Brotli compression at the edge if it is disabled.
6. Do not add `Cross-Origin-Opener-Policy`, `Cross-Origin-Embedder-Policy`, or `Cross-Origin-Resource-Policy` globally until external fonts, scripts, images, downloads, and embedded resources have passed compatibility testing.

The repository must not mark these account-level controls complete until a new live response and TLS scan verifies them.

## Phase 4 — Release verification gates

The remediation is complete only after all of the following are true:

- The exact pull-request head passes both Repository Validation jobs.
- Generated-output drift checks pass on Windows and Linux.
- Accessibility, HTML, SEO, sitemap, internal-link, browser, responsive visual, Lighthouse, and publication-idempotency checks pass.
- The pull request is merged through the protected workflow.
- Repository Validation and GitHub Pages deployment succeed for the exact merge commit on `main`.
- Required public routes return successful responses after deployment.
- A fresh SiteOne crawl confirms the expected reduction in 404, duplicate-description, heading, accessibility, Cloudflare-path, and redirect findings.

## Validation commands

```powershell
npm ci
npm run check:crawl
npm run check:skill-map
npm run check:publication
npm run test:browser
```

A fresh SiteOne report remains the final external validation because crawler behavior and Cloudflare edge settings cannot be proven by repository tests alone.
