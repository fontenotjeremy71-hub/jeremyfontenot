const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..", "..");
const SITE_CSS = fs.readFileSync(path.join(ROOT, "assets", "css", "site.css"), "utf8");
const EVIDENCE_CONFIG = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts", "config", "evidence-pages.json"), "utf8"),
);

test("shared typography keeps multiline headings readable", () => {
  assert.match(SITE_CSS, /\.hero h1,\s*\.page-hero h1\s*\{[\s\S]*?line-height:\s*1\.02/);
  assert.match(SITE_CSS, /\.hero h1\s*\{[\s\S]*?font-size:\s*clamp\(3rem,\s*5\.4vw,\s*5\.5rem\)/);
  assert.match(
    SITE_CSS,
    /@media\(max-width:700px\)\s*\{[\s\S]*?\.hero h1,[\s\S]*?line-height:\s*1\.08/,
  );
  assert.match(SITE_CSS, /\.content-block h2\s*\{[\s\S]*?line-height:\s*1\.12/);
});

test("configured generated evidence pages use the canonical footer structure", () => {
  for (const entry of EVIDENCE_CONFIG) {
    const outputPath = path.join(ROOT, entry.output);
    const html = fs.readFileSync(outputPath, "utf8");
    assert.match(html, /<footer class="site-footer compact-footer"/, entry.output);
    assert.match(html, /class="compact-footer-grid"/, entry.output);
    assert.match(html, /class="compact-footer-links"/, entry.output);
    assert.match(html, /class="compact-footer-contact"/, entry.output);
    assert.match(html, /class="credibility"/, entry.output);
    assert.match(html, /class="footer-meta"/, entry.output);
  }
});
