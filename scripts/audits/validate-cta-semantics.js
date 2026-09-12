#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const routeFiles = [
  'assets/js/routes-main.js',
  'assets/js/routes-projects.js',
  'assets/js/routes-cases.js',
  'assets/js/routes-support.js'
];

const errors = [];
let checked = 0;

function textOnly(value) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function isEvidenceDestination(href) {
  const h = href.toLowerCase();
  return /(?:\/evidence(?:\/|[-.]|$)|evidence-library|evidence-catalog|validation|evidence-manifest|\.(?:txt|md|json|csv)(?:[#?].*)?$)/.test(h);
}

function isCaseStudyDestination(href) {
  const h = href.toLowerCase();
  return /(?:windows-laps-gpo|entra-cloud-sync|on-prem-home-lab|windows-admin-center-lab|app01-storage-expansion|infrastructure|home-lab-operations-proof)\.html(?:#.*)?$/.test(h);
}

for (const relative of routeFiles) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const anchor = /<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi;
  for (const match of source.matchAll(anchor)) {
    const href = match[2];
    const label = textOnly(match[4]);
    if (!label || href.includes('${')) continue;
    checked += 1;

    if (/\b(evidence|validation)\b/i.test(label) && !/\bcase study\b/i.test(label) && !isEvidenceDestination(href)) {
      errors.push(`${relative}: "${label}" promises evidence but points to ${href}`);
    }
    if (/\bcase study\b/i.test(label) && !isCaseStudyDestination(href)) {
      errors.push(`${relative}: "${label}" promises a case study but points to ${href}`);
    }
    if (/\b(proof|proof summary|proof index)\b/i.test(label) && !/\/proof\.html(?:#.*)?$/.test(href)) {
      errors.push(`${relative}: "${label}" promises proof but points to ${href}`);
    }
    if (/\bresume\b/i.test(label) && !/\/resume\.html$/.test(href)) {
      errors.push(`${relative}: "${label}" promises the resume but points to ${href}`);
    }
  }
}

// Explicit regressions that previously reached production.
const projects = fs.readFileSync(path.join(root, 'assets/js/routes-projects.js'), 'utf8');
for (const bad of ['/windows-laps-gpo.html#evidence', '/entra-cloud-sync.html#evidence', '/on-prem-home-lab.html#evidence']) {
  if (projects.includes(`href="${bad}"`)) errors.push(`assets/js/routes-projects.js: proof-page evidence CTA regressed to case-study anchor ${bad}`);
}
const cases = fs.readFileSync(path.join(root, 'assets/js/routes-cases.js'), 'utf8');
if (cases.includes("['Project evidence','Case evidence and validation','/app01-storage-expansion.html#evidence']")) {
  errors.push('assets/js/routes-cases.js: APP01 evidence link is self-referential');
}

if (errors.length) {
  console.error(`CTA semantics audit failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`CTA semantics audit passed: ${checked} literal route links checked and known evidence-link regressions blocked.`);
