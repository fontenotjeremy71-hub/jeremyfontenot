#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');
const wrapperRoot = 'evidence-library/preserved-sharepoint/wrappers/';

function fail(message) {
  throw new Error(message);
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += char;
  }
  if (field.length || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  const headers = rows.shift() || [];
  return rows.filter((values) => values.some(Boolean)).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2] || null;
}

function validateWrapper(relativePath, item, titles, descriptions) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) fail('Missing generated SharePoint wrapper: ' + relativePath);
  const html = fs.readFileSync(absolute, 'utf8');
  if (!html.includes('GENERATED FILE — DO NOT EDIT DIRECTLY.')) fail(relativePath + ': missing generated marker');
  const h1 = [...html.matchAll(/<h1\b[^>]*>/gi)];
  if (h1.length !== 1) fail(relativePath + ': expected exactly one H1, found ' + h1.length);
  const mains = [...html.matchAll(/<main\b[^>]*>/gi)];
  if (mains.length !== 1) fail(relativePath + ': expected exactly one main landmark, found ' + mains.length);
  const headings = [...html.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));
  for (let index = 1; index < headings.length; index += 1) if (headings[index] > headings[index - 1] + 1) fail(relativePath + ': skipped heading level');
  const title = html.match(/<title>(.*?)<\/title>/is)?.[1];
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1];
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  if (!title || titles.has(title)) fail(relativePath + ': generated title is missing or duplicated');
  if (!description || descriptions.has(description)) fail(relativePath + ': generated description is missing or duplicated');
  titles.add(title);
  descriptions.add(description);
  const expectedCanonical = new URL('/' + relativePath.replaceAll('\\', '/'), 'https://jeremyfontenot.online').href;
  if (canonical !== expectedCanonical) fail(relativePath + ': invalid canonical URL');
  const sourceHref = new URL('/' + item.site_rel, 'https://jeremyfontenot.online').href;
  if (!html.includes('href="' + sourceHref + '"')) fail(relativePath + ': exact public derivative link is missing');
  if (!html.includes('href="/evidence-library/preserved-sharepoint/index.html"')) fail(relativePath + ': evidence catalog return link is missing');
  const ids = [...html.matchAll(/\bid\s*=\s*(["'])(.*?)\1/gi)].map((match) => match[2]);
  if (new Set(ids).size !== ids.length) fail(relativePath + ': duplicate id');
  const idSet = new Set(ids);
  for (const match of html.matchAll(/\baria-(?:labelledby|describedby)\s*=\s*(["'])(.*?)\1/gi)) {
    for (const reference of match[2].split(/\s+/).filter(Boolean)) if (!idSet.has(reference)) fail(relativePath + ': broken ARIA reference ' + reference);
  }
  for (const tag of html.match(/<(?:input|select|textarea)\b[^>]*>/gi) || []) {
    const id = attribute(tag, 'id');
    const named = attribute(tag, 'aria-label') || attribute(tag, 'aria-labelledby');
    if (!named && (!id || !new RegExp(`<label\\b[^>]*for=["']${id}["']`, 'i').test(html))) fail(relativePath + ': form control lacks an associated label');
  }
  for (const tag of html.match(/<(?:a|button)\b[^>]*>[\s\S]*?<\/(?:a|button)>/gi) || []) {
    const text = tag.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!text && !attribute(tag, 'aria-label') && !attribute(tag, 'aria-labelledby')) fail(relativePath + ': unnamed link or button');
  }
}

function main() {
  const inventory = parseCsv(fs.readFileSync(path.join(root, 'evidence-library/preserved-sharepoint/sharepoint-export-inventory.csv'), 'utf8'));
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/m365-evidence-catalog.json'), 'utf8'));
  const status = JSON.parse(fs.readFileSync(path.join(root, 'content/microsoft-365/sharepoint-archival-link-status.json'), 'utf8'));
  const compatibility = JSON.parse(fs.readFileSync(path.join(root, 'content/microsoft-365/sharepoint-compatibility-routes.json'), 'utf8'));
  const classification = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/audits/siteone-evidence-integrity/jeremyfontenot.online.fresh.20260722-122039.classification.json'), 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/audits/siteone-evidence-integrity/pre-change-preservation-snapshot.json'), 'utf8'));
  if (inventory.length !== 802) fail('Expected 802 preserved SharePoint inventory records.');
  const records = catalog.records.filter((record) => record.collection === 'preserved-sharepoint-export');
  if (records.length !== inventory.length) fail('SharePoint catalog and inventory counts differ.');
  const recordBySource = new Map(records.map((record) => [record.sourcePath, record]));
  const titles = new Set();
  const descriptions = new Set();
  for (const item of inventory) {
    const record = recordBySource.get(item.source_rel);
    if (!record) fail('Missing catalog record for ' + item.source_rel);
    const expectedWrapper = wrapperRoot + item.source_rel;
    if (record.wrapperPath !== expectedWrapper || record.wrapperRoute !== '/' + expectedWrapper) fail('Invalid wrapper mapping for ' + item.source_rel);
    validateWrapper(expectedWrapper, item, titles, descriptions);
  }
  const wrapperFiles = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile() && entry.name.endsWith('.html')) wrapperFiles.push(absolute);
    }
  }
  walk(path.join(root, wrapperRoot));
  if (wrapperFiles.length !== inventory.length) fail(`Expected ${inventory.length} wrapper files, found ${wrapperFiles.length}.`);
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  for (const record of records) if (!sitemap.includes('<loc>' + new URL(record.wrapperRoute, 'https://jeremyfontenot.online').href + '</loc>')) fail('Sitemap is missing ' + record.wrapperRoute);
  if (sitemap.includes('/evidence-library/preserved-sharepoint/source/')) fail('Raw preserved derivatives must not be in the sitemap.');
  if (classification.summary.unclassifiedInternal404s !== 0) fail('Unclassified internal 404s remain.');
  if (classification.summary.totalUniqueMissingTargets !== 489 || classification.summary.totalSourceReferences !== status.totalSourceReferences) fail('Classification and wrapper status totals differ.');
  if (compatibility.mappings.length !== classification.summary.pathsRequiringCompatibilityPages) fail('Compatibility mapping count does not match classified recoverable paths.');
  const legacyRoutes = new Set();
  for (const mapping of compatibility.mappings) {
    if (legacyRoutes.has(mapping.legacyRoute.toLowerCase())) fail('Duplicate compatibility route: ' + mapping.legacyRoute);
    legacyRoutes.add(mapping.legacyRoute.toLowerCase());
    const source = path.join(root, mapping.canonicalAsset.replace(/^\//, ''));
    if (!fs.existsSync(source)) fail('Compatibility source asset is missing: ' + mapping.canonicalAsset);
    if (path.posix.basename(mapping.legacyRoute).toLowerCase() !== path.posix.basename(mapping.canonicalAsset).toLowerCase()) fail('Compatibility asset basename mismatch: ' + mapping.legacyRoute);
  }
  for (const baseline of snapshot.publicEvidenceRoutes.sitemap) if (!sitemap.includes('<loc>' + baseline + '</loc>')) fail('Existing public sitemap route was removed: ' + baseline);
  for (const baseline of snapshot.files) if (!fs.existsSync(path.join(root, baseline.path))) fail('Baseline evidence file was deleted: ' + baseline.path);
  const verify = spawnSync(process.execPath, [path.join(root, 'scripts/audits/create-preservation-snapshot.js'), '--verify', 'artifacts/audits/siteone-evidence-integrity/pre-change-preservation-snapshot.json'], {cwd: root, encoding: 'utf8'});
  if (verify.status !== 0) fail('Preservation verification failed:\n' + verify.stdout + verify.stderr);
  const sourceDerivativeHashes = inventory.map((item) => sha256(fs.readFileSync(path.join(root, item.site_rel))));
  if (sourceDerivativeHashes.some((hash, index) => hash !== records.find((record) => record.sourcePath === inventory[index].source_rel).publicIntegrity.hash)) fail('A preserved public derivative hash drifted.');
  console.log(`SharePoint evidence integrity validated: ${inventory.length} wrappers, ${classification.summary.totalUniqueMissingTargets} classified missing targets, ${compatibility.mappings.length} compatibility assets, zero protected-source drift.`);
}

try { main(); } catch (error) { console.error(error.stack || error); process.exit(1); }
