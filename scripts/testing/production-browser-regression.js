// Read-only browser regression against the deployed production site.
// Runs independently of the repository's local-server Playwright suite.
const { chromium, request } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const ORIGIN = 'https://jeremyfontenot.online';
const VIEWPORTS = [
  { name: 'mobile', width: 360, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 900 },
  { name: 'desktop', width: 1440, height: 1000 },
];
const OUTPUT = 'artifacts/production-browser-regression';
const normalize = (url) => new URL(url, ORIGIN).href;

async function main() {
  fs.mkdirSync(OUTPUT, { recursive: true });
  const api = await request.newContext({ timeout: 30000 });
  const sitemap = await api.get(ORIGIN + '/sitemap.xml');
  if (!sitemap.ok()) throw new Error('Production sitemap HTTP ' + sitemap.status());
  const xml = await sitemap.text();
  const urls = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)]
    .map((match) => normalize(match[1].replace(/&amp;/g, '&')))
    .filter((url) => new URL(url).origin === ORIGIN);
  const routes = [...new Set([ORIGIN + '/', ...urls])];
  if (routes.length < 13) throw new Error('Production sitemap has too few routes: ' + routes.length);
  const browser = await chromium.launch({ headless: true });
  const failures = [];
  const results = [];
  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      const page = await context.newPage();
      for (const url of routes) {
        try {
          const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
          const status = response?.status() ?? 0;
          if (status < 200 || status >= 400) throw new Error('HTTP ' + status);
          const overflow = await page.evaluate(() => ({
            documentWidth: document.documentElement.scrollWidth,
            viewportWidth: window.innerWidth
          }));
          // Archived third-party exports are preserved and may have fixed-width content.
          const isPreservedExport = /\/evidence-library\/preserved-sharepoint\//i.test(new URL(url).pathname);
          if (!isPreservedExport && overflow.documentWidth > overflow.viewportWidth + 2) {
            throw new Error('Horizontal overflow: ' + overflow.documentWidth + ' > ' + overflow.viewportWidth);
          }
          results.push({ viewport: viewport.name, url, status, outcome: 'PASS' });
        } catch (error) {
          const failure = { viewport: viewport.name, url, outcome: 'FAIL', error: String(error.message || error) };
          failures.push(failure);
          results.push(failure);
          console.error('FAIL', viewport.name, url, failure.error);
        }
      }
      await context.close();
      console.log(viewport.name + ': ' + routes.length + ' routes checked');
    }
  } finally {
    await browser.close();
    await api.dispose();
  }
  const report = { origin: ORIGIN, routes: routes.length, viewports: VIEWPORTS.map((v) => v.name),
    checks: results.length, passed: results.length - failures.length, failed: failures.length, failures };
  fs.writeFileSync(path.join(OUTPUT, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ routes: report.routes, checks: report.checks, passed: report.passed, failed: report.failed }));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
