# SiteOne evidence-integrity remediation

## Scope and preservation boundary

This audit remediates the fresh SiteOne v2.5.1.20260627 report for `https://jeremyfontenot.online/` without changing the byte-preserved SharePoint source artifacts. The baseline report ran with `--no-cache`, visited 1,663 URLs, scored 7.3, and reported 489 HTTP 404 targets plus one HTTP 503 target.

The repository now distinguishes source-of-record evidence, generated evidence wrappers, curated catalogs, compatibility assets, and retained historical references. Raw source remains publicly inspectable. Canonical wrappers are indexable, appear in the sitemap, and link to both the exact derivative and the catalog.

The pre-change snapshot records commit `f8a72c8fa17cab66524103361fa104d56b6e4d2e`, 1,755 tracked files, 1,159 evidence files, and 1,144 protected source-of-record files. Verification against that snapshot reports zero missing protected files and zero hash drift.

## Missing-target classification and remediation

| Measure | Production baseline | Exact branch crawl |
|---|---:|---:|
| SiteOne visited URLs | 1,663 | 2,449 |
| HTTP 404 targets | 489 | 484 |
| Source references represented | 1,657 | 1,658 |
| Cloudflare-generated targets | 1 | 0 |
| Recoverable first-party assets | 5 | 0 remaining |
| Documented archival limitations | 483 | 484 |
| Unclassified first-party 404s | 0 after classification | 0 |

The apparent increase from 483 to 484 archival limitations is one source-era module route that returned 503 from production but returns 404 from the local exact-head server. It is not a newly removed route.

Five raw-source relative references were provably recoverable from existing logo/favicon assets. Reviewed mappings now serve byte-identical compatibility assets at those legacy paths. The remaining 484 targets do not have an identity-proven repository artifact and are documented on their generated wrappers rather than replaced with misleading success pages.

The baseline `/cdn-cgi/` target is classified separately as Cloudflare-generated. No fake repository resource was created for it.

## Generated presentation and indexing

- 802 preserved SharePoint public derivatives now have deterministic recruiter-readable wrappers.
- Every wrapper has one H1, continuous heading levels, one `main`, valid labels and accessible names, unique title, unique description, canonical URL, provenance, hash/inventory reference, exact-source link, catalog link, scope, limitations, and archival-link status.
- Sitemap routes increased from 32 to 835: the existing 32 routes, 802 canonical wrappers, and one collection link-integrity page.
- Raw preserved source and documentation roots remain publicly accessible and retain their prior `robots.txt` treatment. They are not in the sitemap and are not rewritten.
- Compatibility-only assets are not added to the sitemap.
- The full crawl still reports the raw source collection's repeated historical description on 802 pages. This is a source-preservation exception; the 802 canonical wrappers have unique descriptions.
- The recruiter crawl reports three pre-existing noncanonical alias groups (`/` versus `/index.html`, two directory routes versus their `index.html` form, and a description also used on the on-prem lab overview). No generated SharePoint wrapper title or description is duplicated.

## Accessibility results

| SiteOne finding | Production baseline | Recruiter-facing exact branch | Full exact branch |
|---|---:|---:|---:|
| Multiple-H1 pages | 28 | 0 | 28 raw preserved pages |
| Skipped-heading pages | 1 | 0 | 1 raw preserved page |
| Missing-form-label warnings | 1 page | 0 | 4 raw-source control warnings |
| Unnamed-link/button warnings | 8 pages | 0 | 1 raw-source warning |
| Missing-main warnings | 15 pages | 0 | 1 raw-source warning |

The generated wrappers and recruiter-facing pages pass the new DOM regression gates. Full-crawl warnings that remain are confined to immutable raw derivatives and are presented through accessible wrappers; the source bytes were not rewritten merely to improve a scanner score.

## SiteOne profiles

| Profile | Scope | Score | Visited | 404 | Result |
|---|---|---:|---:|---:|---|
| Fresh production baseline | Existing live site and raw evidence | 7.3 | 1,663 | 489 | Classified input |
| Recruiter-facing exact branch | Canonical site, catalogs, and all 802 wrappers; raw robots-disallowed roots excluded | 8.1 | 1,158 | 0 | Pass |
| Full evidence-integrity exact branch | All public evidence, wrappers, and raw derivatives | 6.2 | 2,449 | 484 | Pass: all 484 classified, zero unclassified |

Local SiteOne scores include warnings for the deliberately simple test server's absent Cloudflare response headers and compression. They are valid content-integrity scores, not forecasts of the deployed edge score.

## Brotli verification

Two live requests with `Accept-Encoding: br` were made for each sampled category. Successful live homepage HTML, recruiter HTML, generated evidence HTML, preserved SharePoint derivative HTML, CSS, JavaScript, JSON, XML, and text evidence all returned `Content-Encoding: br` on both attempts. CSS and JavaScript were Cloudflare cache hits; the other successful samples were dynamic edge responses.

The new SharePoint wrapper URL returned the expected predeployment 404, also Brotli encoded. Its successful live delivery cannot be claimed until this branch is merged and deployed. The evidence does disprove a blanket conclusion that the 840 baseline warnings mean all first-party content lacks Brotli.

## Live security-header classification

The deterministic verifier inspected 1,157 successful first-party production routes from the baseline report. Every inspected route returned HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, CSP, and `Permissions-Policy`. No `Access-Control-Allow-Credentials` value was observed alongside wildcard CORS.

| Finding | Count | Classification |
|---|---:|---|
| COOP absent | 1,157 | Accepted pending cross-origin compatibility testing |
| COEP absent | 1,157 | Accepted pending cross-origin compatibility testing |
| CORP absent | 1,157 | Accepted pending cross-origin compatibility testing |
| `Server: cloudflare` | 1,157 | Edge informational |
| `Access-Control-Allow-Origin: *` | 1,157 | Static-site informational; no credentialed CORS observed |

The repository does not add deprecated `X-XSS-Protection`, and it does not enable global cross-origin isolation without compatibility testing.

## Redirect and cache findings

The baseline's three redirect rows were `/index.html` to `/`, `/powershell-automation.html` to its canonical project route, and a Cloudflare challenge utility route. The exact-head SiteOne profiles report zero redirects in their crawled canonical route sets. Cloudflare utility caching remains edge-owned; no fake files or unnecessary query-string cache busters were added.

## Deterministic controls and remaining limits

The Microsoft 365 generator owns the wrappers, wrapper metadata, archival status, catalog fields, source-to-destination matrix, sitemap entries, output hashes, and preserved-evidence integrity manifest. Validation checks regeneration, exact-case routes, canonical URLs, unique wrapper metadata, DOM accessibility, compatibility mappings, public derivative hashes, pre-change protected hashes, evidence counts, route retention, sensitive-data policy, and zero unclassified internal 404s.

Remaining limitations are explicit:

- The 484 unavailable paths are historical references retained inside immutable evidence; no identity-proven target exists for them.
- Raw preserved HTML retains its original accessibility and duplicate-description characteristics.
- New wrapper success and Brotli delivery on the live domain require postdeployment verification.
- Local SiteOne does not emulate Cloudflare headers, compression, or cache state.
- Global COOP, COEP, and CORP remain intentionally disabled pending compatibility testing.

No evidence file, public evidence route, or evidence collection was deleted, hidden, or rewritten.
