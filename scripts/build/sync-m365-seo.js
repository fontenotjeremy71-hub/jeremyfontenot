#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const checkMode = process.argv.includes('--check');
const pages = [
  {
    path: 'microsoft-365/evidence-catalog.html',
    title: 'Microsoft 365 Evidence Catalog | Jeremy Fontenot',
    description: 'Technology-first catalog of Microsoft 365, Entra, SharePoint, Exchange, Intune, Teams, application, security, and automation evidence with provenance and limitations.'
  },
  {
    path: 'evidence-library/preserved-sharepoint/index.html',
    title: 'Preserved SharePoint Exports | Jeremy Fontenot',
    description: 'Indexed public derivatives of preserved SharePoint and Microsoft 365 personal-lab documentation exports with separately attested source integrity.'
  }
];

function escapeAttribute(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;');
}

let failed = false;
for (const page of pages) {
  const absolute = path.join(root, page.path);
  if (!fs.existsSync(absolute)) throw new Error(`Generated Microsoft 365 page is missing: ${page.path}`);

  const expectedTitle = `<meta property="og:title" content="${escapeAttribute(page.title)}">`;
  const expectedDescription = `<meta property="og:description" content="${escapeAttribute(page.description)}">`;
  let html = fs.readFileSync(absolute, 'utf8');

  if (checkMode) {
    if (!html.includes(expectedTitle)) {
      console.error(`${page.path}: missing expected Open Graph title.`);
      failed = true;
    }
    if (!html.includes(expectedDescription)) {
      console.error(`${page.path}: missing expected Open Graph description.`);
      failed = true;
    }
    continue;
  }

  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*">/gi, '');
  html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*">/gi, '');
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="[^"]+">/i);
  if (!canonicalMatch) throw new Error(`${page.path}: canonical link is missing.`);
  html = html.replace(canonicalMatch[0], `${canonicalMatch[0]}${expectedTitle}${expectedDescription}`);
  fs.writeFileSync(absolute, html, 'utf8');
}

if (failed) process.exit(1);
console.log(`Microsoft 365 generated SEO metadata ${checkMode ? 'check' : 'synchronization'} passed.`);
