const fs = require('node:fs');
const path = require('node:path');

const sitemapPath = path.join(process.cwd(), 'sitemap.xml');
const xml = fs.readFileSync(sitemapPath, 'utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());

const expected = [
  'https://jeremyfontenot.online/',
  'https://jeremyfontenot.online/systems-administration.html',
  'https://jeremyfontenot.online/projects.html',
  'https://jeremyfontenot.online/proof.html',
  'https://jeremyfontenot.online/resume.html',
  'https://jeremyfontenot.online/contact.html',
  'https://jeremyfontenot.online/windows-laps-gpo.html',
  'https://jeremyfontenot.online/entra-cloud-sync.html',
  'https://jeremyfontenot.online/on-prem-home-lab.html',
  'https://jeremyfontenot.online/windows-admin-center-lab.html',
  'https://jeremyfontenot.online/infrastructure.html',
  'https://jeremyfontenot.online/app01-storage-expansion.html',
  'https://jeremyfontenot.online/evidence-library/',
  'https://jeremyfontenot.online/evidence/claim-map.html',
  'https://jeremyfontenot.online/home-lab/evidence-catalog.html',
  'https://jeremyfontenot.online/microsoft-365/',
  'https://jeremyfontenot.online/systems-skills/'
];

const forbiddenPatterns = [
  '/evidence-library/preserved-sharepoint/',
  '/wrappers/',
  '/source-html/',
  '/assets/projects/evidence/preserved/'
];

const failures = [];
const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index);
if (duplicates.length) failures.push(`Duplicate sitemap URLs: ${[...new Set(duplicates)].join(', ')}`);

const forbidden = urls.filter((url) => forbiddenPatterns.some((pattern) => url.includes(pattern)));
if (forbidden.length) failures.push(`Preserved/raw evidence leaked into sitemap: ${forbidden.slice(0, 10).join(', ')}`);

const missing = expected.filter((url) => !urls.includes(url));
const unexpected = urls.filter((url) => !expected.includes(url));
if (missing.length) failures.push(`Missing canonical portfolio URLs: ${missing.join(', ')}`);
if (unexpected.length) failures.push(`Unexpected sitemap URLs: ${unexpected.join(', ')}`);

if (failures.length) {
  console.error('Sitemap validation failed.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Sitemap validation passed: ${urls.length} canonical portfolio URLs.`);
