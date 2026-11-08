const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const domain = 'https://jeremyfontenot.online';
const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1].trim());

const failures = [];
const seen = new Set();

const forbiddenPatterns = [
  '/evidence-library/preserved-sharepoint/',
  '/wrappers/',
  '/source-html/',
  '/assets/projects/evidence/preserved/'
];

for (const url of urls) {
  if (seen.has(url)) {
    failures.push(`Duplicate sitemap URL: ${url}`);
    continue;
  }

  seen.add(url);

  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    failures.push(`Invalid sitemap URL: ${url}`);
    continue;
  }

  if (parsed.origin !== domain) {
    failures.push(`Unexpected domain: ${url}`);
    continue;
  }

  if (parsed.search || parsed.hash) {
    failures.push(`Noncanonical query or fragment: ${url}`);
  }

  if (forbiddenPatterns.some((pattern) => parsed.pathname.includes(pattern))) {
    failures.push(`Preserved/raw evidence included: ${url}`);
  }

  const relative = decodeURIComponent(parsed.pathname)
    .replace(/^\/+/, '');

  const file = relative === '' || relative.endsWith('/')
    ? path.join(root, relative, 'index.html')
    : path.join(root, relative);

  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    failures.push(`Missing HTML page: ${url}`);
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');

  const canonical = html.match(
    /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/i
  );

  if (!canonical || canonical[1] !== url) {
    failures.push(`Canonical mismatch: ${url}`);
  }
}

const inventory = JSON.parse(
  fs.readFileSync(
    path.join(root, 'docs/static-release/site-files.json'),
    'utf8'
  )
);

const inventoryText = JSON.stringify(inventory);

if (!inventoryText.includes('project-15.html')) {
  failures.push('Project 15 missing from publication inventory.');
}

const projectUrls = urls.filter((url) =>
  new URL(url).pathname.startsWith('/projects/')
);

if (projectUrls.length !== 14 ||
    !seen.has(`${domain}/project-15.html`)) {
  failures.push(
    `Expected 14 project directory URLs plus Project 15; found ${projectUrls.length} project directory URLs.`
  );
}

if (failures.length) {
  console.error('Sitemap validation failed.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `Sitemap validation passed: ${urls.length} canonical URLs; 15 project case studies.`
  );
}
