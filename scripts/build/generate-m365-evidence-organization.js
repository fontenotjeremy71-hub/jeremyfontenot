#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..', '..');
const checkMode = process.argv.includes('--check');
const config = JSON.parse(fs.readFileSync(path.join(root, 'content/microsoft-365/evidence-organization.json'), 'utf8'));
const outputs = new Map();

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function listFiles(directory) {
  const files = [];
  function visit(current) {
    for (const entry of fs.readdirSync(current, {withFileTypes: true})) {
      const absolute = path.join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symbolic link is not allowed in Microsoft 365 evidence: ${path.relative(root, absolute)}`);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) files.push(absolute);
    }
  }
  visit(directory);
  return files.sort();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  const headers = rows.shift();
  return rows.filter((values) => values.some(Boolean)).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

const technologyRules = [
  ['intune', /\bintune\b|managed[-_ ]?device|endpoint management|compliance policy/i],
  ['exchange-online', /\bexchange\b|\bexo\b|mailbox|mail flow|transport rule|mail-enabled/i],
  ['teams', /\bteams?\b|channels?|collaboration/i],
  ['sharepoint', /sharepoint|onedrive|site collection|document librar/i],
  ['security-compliance', /conditional access|named location|security default|authentication method|authorization polic|legacy auth|mfa|security baseline|compliance/i],
  ['applications', /service principal|enterprise application|app registration|oauth|permission grant|application governance/i],
  ['entra-id', /\bentra\b|azure ad|directory role|directory audit|sign[-_ ]?in|group member|identity|users?\.csv|groups?\.csv|devices?\.csv/i],
  ['automation', /powershell|\.ps1\b|microsoft graph|\bgraph\b|automation|script library|scriptpack/i],
  ['tenant-administration', /tenant|organization|verified domain|subscribed sku|service plan|licen[cs]|admin center/i]
];

function technologiesFor(value, fallback) {
  const matches = technologyRules.filter(([, pattern]) => pattern.test(value)).map(([slug]) => slug);
  return [...new Set(matches.length ? matches : [fallback])];
}

function evidenceType(relativePath) {
  const value = relativePath.toLowerCase();
  const ext = path.extname(value);
  if (/manifest/.test(value)) return 'manifests';
  if (/screenshot|screen-shot|\.png$|\.jpe?g$|\.webp$/.test(value)) return 'screenshots';
  if (/validation|attempt|test-result/.test(value)) return 'validation';
  if (/inventory|directory-roles|service-principal|oauth|users|groups|devices|sign-ins|audit/.test(value)) return 'inventories';
  if (/report|summary|proof-map/.test(value)) return 'reports';
  if (/conditional-access|named-location|authentication|authorization|policy|configuration|config/.test(value)) return 'configuration';
  if (/script-output|command-output|console/.test(value)) return 'scripts-output';
  if (/test|check/.test(value)) return 'testing';
  if (ext === '.ps1' || ext === '.js' || ext === '.py') return 'scripts';
  if (['.csv', '.json', '.xml'].includes(ext)) return 'exports';
  return 'documentation';
}

function logicalDestination(primaryTechnology, type, basename) {
  const folder = type === 'scripts' ? 'scripts' : type === 'documentation' ? 'documentation' : `evidence/${type}`;
  return `content/microsoft-365/${primaryTechnology}/${folder}/${basename}`;
}

const currentRoot = path.join(root, config.sources.currentPortfolio.root);
const inventoryPath = path.join(root, config.sources.preservedSharePoint.inventory);
if (!fs.existsSync(currentRoot)) throw new Error(`Missing Microsoft 365 evidence root: ${config.sources.currentPortfolio.root}`);
if (!fs.existsSync(inventoryPath)) throw new Error(`Missing SharePoint inventory: ${config.sources.preservedSharePoint.inventory}`);

const records = [];
for (const absolute of listFiles(currentRoot)) {
  const sourcePath = path.relative(root, absolute).split(path.sep).join('/');
  const buffer = fs.readFileSync(absolute);
  const type = evidenceType(sourcePath);
  const relationships = technologiesFor(sourcePath, 'tenant-administration');
  const primaryTechnology = relationships[0];
  records.push({
    id: `m365-core-${sha256(Buffer.from(sourcePath)).slice(0, 16)}`,
    collection: 'microsoft-365-core',
    sourceRepository: config.sources.currentPortfolio.repository,
    sourceCommit: config.sources.currentPortfolio.commit,
    sourcePath,
    publicPath: sourcePath,
    size: buffer.length,
    sha256: sha256(buffer),
    evidenceType: type,
    primaryTechnology,
    technologyRelationships: relationships,
    logicalDestination: logicalDestination(primaryTechnology, type, path.basename(sourcePath)),
    publicationClassification: 'public-original',
    collectionContext: 'Existing public Microsoft 365 lab evidence preserved in the portfolio repository and logically organized without moving the source file.'
  });
}

const sharePointRows = parseCsv(fs.readFileSync(inventoryPath, 'utf8'));
for (const item of sharePointRows) {
  const searchable = `${item.source_rel} ${item.title} ${item.category} ${item.excerpt}`;
  const related = technologiesFor(searchable, 'sharepoint');
  const relationships = [...new Set(['sharepoint', ...related])];
  records.push({
    id: `m365-sharepoint-${sha256(Buffer.from(item.source_rel)).slice(0, 16)}`,
    collection: 'preserved-sharepoint-export',
    sourceRepository: config.sources.preservedSharePoint.repository,
    sourceCommit: config.sources.preservedSharePoint.commit,
    sourcePath: item.source_rel,
    publicPath: item.site_rel,
    size: Number(item.size || 0),
    sha256: String(item.sha256).toLowerCase(),
    evidenceType: 'exports',
    primaryTechnology: 'sharepoint',
    technologyRelationships: relationships,
    logicalDestination: `content/microsoft-365/sharepoint/evidence/exports/preserved-site/source/${item.source_rel}`,
    publicationClassification: 'public-original',
    collectionContext: 'Byte-preserved offline SharePoint documentation export indexed from the original public portfolio repository; the exported page is not a live SharePoint resource.',
    title: item.title,
    category: item.category,
    extension: item.ext
  });
}

records.sort((a, b) => a.id.localeCompare(b.id));
const technologyMap = new Map(config.technologies.map((technology) => [technology.slug, {...technology, evidenceIds: [], counts: {}}]));
for (const record of records) {
  for (const slug of record.technologyRelationships) {
    const technology = technologyMap.get(slug);
    if (!technology) throw new Error(`Unknown Microsoft 365 technology relationship: ${slug}`);
    technology.evidenceIds.push(record.id);
    technology.counts[record.evidenceType] = (technology.counts[record.evidenceType] || 0) + 1;
  }
}

const duplicateGroups = [...records.reduce((groups, record) => {
  if (!groups.has(record.sha256)) groups.set(record.sha256, []);
  groups.get(record.sha256).push(record.id);
  return groups;
}, new Map())]
  .filter(([, evidenceIds]) => evidenceIds.length > 1)
  .map(([hash, evidenceIds]) => ({sha256: hash, count: evidenceIds.length, evidenceIds}))
  .sort((a, b) => b.count - a.count || a.sha256.localeCompare(b.sha256));

const dangerousExtensions = new Set(['.pfx', '.p12', '.key', '.pem', '.kdbx', '.env']);
const sensitiveFindings = records
  .filter((record) => dangerousExtensions.has(path.extname(record.publicPath || record.sourcePath).toLowerCase()))
  .map((record) => ({evidenceId: record.id, path: record.publicPath || record.sourcePath, reason: 'Restricted file extension'}));

const summary = {
  schemaVersion: 1,
  phase: config.phase,
  generatedFrom: {
    currentPortfolio: config.sources.currentPortfolio,
    preservedSharePoint: config.sources.preservedSharePoint
  },
  totals: {
    artifacts: records.length,
    coreArtifacts: records.filter((record) => record.collection === 'microsoft-365-core').length,
    preservedSharePointArtifacts: sharePointRows.length,
    exactDuplicateGroups: duplicateGroups.length,
    exactDuplicateArtifacts: duplicateGroups.reduce((total, group) => total + group.count, 0),
    sensitiveFindings: sensitiveFindings.length
  },
  technologies: [...technologyMap.values()].map((technology) => ({
    slug: technology.slug,
    label: technology.label,
    destination: technology.destination,
    claimId: technology.claimId,
    claim: technology.claim,
    supportLevel: technology.supportLevel,
    evidenceCount: technology.evidenceIds.length,
    counts: technology.counts,
    evidenceIds: technology.evidenceIds
  })),
  boundaries: config.boundaries,
  records
};

const matrixHeader = ['evidence_id','source_repository','source_commit','source_path','public_path','sha256','size','evidence_type','primary_technology','technology_relationships','logical_destination','publication_classification','collection_context'];
const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const matrix = [matrixHeader.join(','), ...records.map((record) => [
  record.id,
  record.sourceRepository,
  record.sourceCommit,
  record.sourcePath,
  record.publicPath,
  record.sha256,
  record.size,
  record.evidenceType,
  record.primaryTechnology,
  record.technologyRelationships.join('|'),
  record.logicalDestination,
  record.publicationClassification,
  record.collectionContext
].map(csvCell).join(','))].join('\n') + '\n';

const curated = sharePointRows
  .map((item) => ({...item, score: technologyRules.reduce((score, [, pattern]) => score + (pattern.test(`${item.title} ${item.excerpt}`) ? 1 : 0), 0)}))
  .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title) || a.site_rel.localeCompare(b.site_rel))
  .filter((item, index, values) => values.findIndex((candidate) => candidate.site_rel === item.site_rel) === index)
  .slice(0, 36);

const technologyCards = [...technologyMap.values()].map((technology) => `
      <article class="capability-card" id="${escapeHtml(technology.slug)}">
        <span class="tile-code">${escapeHtml(String(technology.evidenceIds.length))}</span>
        <h2>${escapeHtml(technology.label)}</h2>
        <p>${escapeHtml(technology.claim)}</p>
        <dl class="claim-details"><div><dt>Support</dt><dd>${escapeHtml(technology.supportLevel)}</dd></div><div><dt>Logical destination</dt><dd><code>${escapeHtml(technology.destination)}</code></dd></div></dl>
        <div class="proof-links"><a href="/assets/data/m365-evidence-catalog.json">Inspect catalog records</a></div>
      </article>`).join('');

const catalogHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Microsoft 365 Evidence Catalog | Jeremy Fontenot</title><meta name="description" content="Technology-first catalog of Microsoft 365, Entra, SharePoint, Exchange, Intune, Teams, application, security, and automation evidence with provenance and limitations."><meta name="robots" content="index, follow"><link rel="canonical" href="https://jeremyfontenot.online/microsoft-365/evidence-catalog.html"><link rel="icon" href="/assets/logos/favicon_64x64.png"><link rel="stylesheet" href="/assets/css/site.css"><script src="/assets/js/site.js" defer></script></head>
<body class="foundation-page microsoft-365-page"><!-- GENERATED FILE — DO NOT EDIT DIRECTLY. --><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><nav class="nav" aria-label="Primary navigation"><a class="brand" href="/"><img src="/assets/logos/header_logo_88x88.png" alt="Jeremy Fontenot logo" width="44" height="44"><span>Jeremy Fontenot</span><small>Support · systems · evidence</small></a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu">Menu</button><div class="nav-links" id="primary-menu"><a href="/">Home</a><a href="/systems-administration.html">Readiness</a><a href="/systems-skills/">Skills</a><a href="/microsoft-365/" aria-current="page">Microsoft 365</a><a href="/evidence/">Evidence</a><a href="/resume.html">Resume</a><a href="/contact.html">Contact</a></div></nav></header>
<main id="main"><section class="page page-hero"><div class="section-head reveal is-visible"><p class="eyebrow">Microsoft 365 evidence organization</p><h1>Technology-first proof with preserved source paths.</h1><p class="lead">${summary.totals.artifacts} artifacts are cataloged across personal-tenant administration, identity, security, applications, Exchange, Intune, SharePoint, Teams, and automation. Existing evidence files and URLs remain unchanged.</p><div class="actions"><a class="button primary" href="/assets/data/m365-evidence-catalog.json">Open complete JSON catalog</a><a class="button" href="/microsoft-365/source-to-destination-matrix.csv">Open source matrix</a><a class="button text-button" href="/microsoft-365/duplicate-groups.json">Review retained duplicates</a></div></div></section>
<section class="section"><div class="section-head reveal"><p class="eyebrow">Coverage</p><h2>Skill, task, result, proof, scope, and limitations remain connected.</h2><p>The organization is logical rather than destructive: every record points from its preserved source path to an approved technology destination and one or more supported claims.</p></div><div class="capability-grid reveal">${technologyCards}</div></section>
<section class="section"><div class="scope-note-card reveal"><p class="eyebrow">Integrity and boundaries</p><h2>Duplicates are retained and sensitive publication remains blocked.</h2><p>${summary.totals.exactDuplicateGroups} exact SHA-256 duplicate groups are reported without deleting any artifact. Restricted file extensions detected: ${summary.totals.sensitiveFindings}. This personal-tenant collection does not prove client, production, enterprise-scale, Intune-fleet, Exchange mail-flow, or live SharePoint ownership.</p><div class="inline-actions"><a href="/evidence-library/projects/microsoft-365-lab/m365-entra-site-proof-map-20260605.html">Open Entra proof map</a><a href="/evidence-library/preserved-sharepoint/index.html">Browse preserved SharePoint sources</a></div></div></section></main>
<footer class="site-footer"><p class="footer-meta">Jeremy Fontenot · Abbeville, Louisiana · Central Time</p></footer></body></html>\n`;

const curatedCards = curated.map((item) => `<article class="capability-card"><span class="tile-code">${escapeHtml(item.category || 'source')}</span><h2>${escapeHtml(item.title || path.basename(item.source_rel))}</h2><p>${escapeHtml(item.excerpt || 'Preserved source export.')}</p><div class="proof-links"><a href="/${escapeHtml(item.site_rel)}">Open preserved export</a></div></article>`).join('');
const preservedIndexHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Preserved SharePoint Exports | Jeremy Fontenot</title><meta name="description" content="Indexed preserved-source SharePoint and Microsoft 365 personal-lab documentation exports. These files are offline evidence, not live SharePoint resources."><meta name="robots" content="index, follow"><link rel="canonical" href="https://jeremyfontenot.online/evidence-library/preserved-sharepoint/index.html"><link rel="icon" href="/assets/logos/favicon_64x64.png"><link rel="stylesheet" href="/assets/css/site.css"><script src="/assets/js/site.js" defer></script></head>
<body class="foundation-page sharepoint-page"><!-- GENERATED FILE — DO NOT EDIT DIRECTLY. --><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><nav class="nav" aria-label="Primary navigation"><a class="brand" href="/"><img src="/assets/logos/header_logo_88x88.png" alt="Jeremy Fontenot logo" width="44" height="44"><span>Jeremy Fontenot</span><small>Support · systems · evidence</small></a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu">Menu</button><div class="nav-links" id="primary-menu"><a href="/">Home</a><a href="/microsoft-365/">Microsoft 365</a><a href="/microsoft-365/evidence-catalog.html">Evidence catalog</a><a href="/evidence/">Evidence</a><a href="/resume.html">Resume</a><a href="/contact.html">Contact</a></div></nav></header>
<main id="main"><section class="page page-hero"><div class="section-head reveal is-visible"><p class="eyebrow">Preserved Microsoft 365 documentation</p><h1>Offline SharePoint source exports with verified inventory records.</h1><p class="lead">${sharePointRows.length} exported artifacts remain available at their established public paths. The collection is preserved source evidence and is not presented as a live SharePoint tenant.</p><div class="actions"><a class="button primary" href="/microsoft-365/evidence-catalog.html#sharepoint">Open SharePoint catalog</a><a class="button" href="/evidence-library/preserved-sharepoint/sharepoint-export-inventory.csv">Open inventory CSV</a></div></div></section>
<section class="section"><div class="section-head reveal"><p class="eyebrow">Curated source review</p><h2>Representative exports selected through deterministic technology relevance.</h2><p>The complete collection remains discoverable through the inventory and JSON catalog. Exact duplicates remain retained for owner review.</p></div><div class="capability-grid reveal">${curatedCards}</div></section></main><footer class="site-footer"><p class="footer-meta">Preserved personal-lab documentation · Offline source collection</p></footer></body></html>\n`;

outputs.set('assets/data/m365-evidence-catalog.json', `${JSON.stringify(summary, null, 2)}\n`);
outputs.set('microsoft-365/evidence-catalog.html', catalogHtml);
outputs.set('microsoft-365/source-to-destination-matrix.csv', matrix);
outputs.set('microsoft-365/duplicate-groups.json', `${JSON.stringify({schemaVersion: 1, groups: duplicateGroups}, null, 2)}\n`);
outputs.set('microsoft-365/sensitive-data-review.json', `${JSON.stringify({schemaVersion: 1, checkedExtensions: [...dangerousExtensions].sort(), findings: sensitiveFindings}, null, 2)}\n`);
outputs.set('evidence-library/preserved-sharepoint/index.html', preservedIndexHtml);

let failed = false;
for (const [relativePath, content] of outputs) {
  const absolute = path.join(root, relativePath);
  if (checkMode) {
    if (!fs.existsSync(absolute) || fs.readFileSync(absolute, 'utf8') !== content) {
      console.error(`Microsoft 365 generated output drift: ${relativePath}`);
      failed = true;
    }
  } else {
    fs.mkdirSync(path.dirname(absolute), {recursive: true});
    fs.writeFileSync(absolute, content, 'utf8');
  }
}

if (sensitiveFindings.length) {
  for (const finding of sensitiveFindings) console.error(`Restricted Microsoft 365 evidence file: ${finding.path}`);
  failed = true;
}
if (sharePointRows.length !== 802) {
  console.error(`Expected 802 preserved SharePoint artifacts, found ${sharePointRows.length}.`);
  failed = true;
}
if (records.length === 0) {
  console.error('Microsoft 365 evidence catalog is empty.');
  failed = true;
}
for (const technology of technologyMap.values()) {
  if (!technology.evidenceIds.length) {
    console.error(`Microsoft 365 technology has no evidence relationship: ${technology.slug}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log(`Microsoft 365 evidence organization ${checkMode ? 'check' : 'build'} passed: ${records.length} artifacts, ${sharePointRows.length} preserved SharePoint exports, ${duplicateGroups.length} retained duplicate groups.`);
