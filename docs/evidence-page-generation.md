# Generated Evidence Pages

## Source and publication model

Markdown files listed in `scripts/config/evidence-pages.json` are the authoritative evidence sources. Their same-basename HTML files are generated visitor presentations and must not be edited directly. Both source and generated files are committed so GitHub Pages can publish the repository as a static artifact without a deployment-time content build.

Raw Markdown remains publicly accessible through each generated page's **View source Markdown** link. Internal visitor-facing links and `sitemap.xml` use the preferred HTML URLs; raw Markdown is not added to the sitemap.

## Commands

From the repository root:

```powershell
npm ci
npm run build:evidence
npm run check:evidence
```

`npm run build:evidence` regenerates every configured HTML page. `npm run check:evidence` performs the same deterministic render in memory, compares it with the committed files, and exits nonzero without writing when an output is missing or stale.

Browser validation is fully automated:

```powershell
npx playwright install chromium
npm run test:browser
```

Playwright starts `scripts/testing/serve-static-site.js` automatically on `127.0.0.1:4174`. The suite reads this allowlist and `sitemap.xml` directly, validates the XSLT presentation and every configured evidence page, monitors console and network failures, and checks page-level overflow at the required responsive viewports. Screenshots, traces, and videos are retained only when a test fails, beneath `artifacts/playwright/`.

The generator uses `markdown-it` with raw HTML disabled. The dependency provides maintained CommonMark-style parsing and support for the tables, lists, code, blockquotes, links, and other constructs present in the configured evidence sources without introducing a full site framework.

## Adding a page

1. Add one entry to `scripts/config/evidence-pages.json` with the Markdown source, same-basename HTML output, source title, evidence category, and contextual return link.
2. Confirm the output path does not already contain a hand-authored file. The generator refuses to overwrite any file that does not carry the matching generated-file notice.
3. Add or update a visitor-facing link to the generated `.html` URL.
4. Add the canonical HTML URL to `sitemap.xml` only when the page is public, indexable, and intended for human review.
5. Run `npm run build:evidence`, then `npm run check:evidence` and the repository validation suite.

## Link and canonical behavior

Generated pages stay beside their Markdown sources. Relative links therefore retain their original destination behavior. When rendered Markdown links to another allowlisted Markdown source, the generator rewrites only that link to the corresponding generated HTML page while preserving query strings and fragments. Links to non-allowlisted Markdown, manifests, provenance records, images, and other artifacts remain unchanged.

Each generated page receives an absolute, self-referencing HTTPS canonical derived from its configured output path. Configuration metadata is escaped before insertion, Markdown raw HTML is disabled, and unsafe URL protocols are rejected.

## Removing a page

1. Remove or replace visitor-facing links to the generated HTML page.
2. Remove its URL from `sitemap.xml`.
3. Remove its allowlist entry from `scripts/config/evidence-pages.json`.
4. Delete only the generated HTML output; preserve the authoritative Markdown source unless a separate evidence-governance decision explicitly authorizes removal.
5. Run the generation check and repository validation to confirm no stale references remain.
