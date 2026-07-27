#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');
const TEXT_EXTENSIONS = new Set(['.csv', '.json', '.xml', '.svg', '.html', '.htm', '.md', '.txt', '.ps1', '.js', '.mjs', '.cjs', '.yaml', '.yml', '.log', '.patch']);
const BINARY_RESTRICTED_EXTENSIONS = new Set(['.pfx', '.p12', '.key', '.pem', '.kdbx']);
const GENERATED_OUTPUT_ROOTS = [
  'site/', '.site-preflight/', 'test-results/', 'node_modules/',
  'coverage/', '.cache/', 'dist/', 'build/', 'artifacts/redesign/final/',
  'evidence-library/preserved-sharepoint/wrappers/'
];
const HIGH_SEVERITY_PATTERNS = [
  {type: 'private-key', regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/gim},
  {type: 'client-secret', regex: /\b(?:client[_-]?secret|clientsecret)\b["']?\s*[:=]\s*["']?([A-Za-z0-9+/_~.-]{12,})/gim, valueGroup: 1},
  {type: 'access-token', regex: /\baccess[_-]?token\b["']?\s*[:=]\s*["']?([A-Za-z0-9+/_~.-]{20,})/gim, valueGroup: 1},
  {type: 'refresh-token', regex: /\brefresh[_-]?token\b["']?\s*[:=]\s*["']?([A-Za-z0-9+/_~.-]{20,})/gim, valueGroup: 1},
  {type: 'bearer-authorization-header', regex: /\bauthorization\b["']?\s*:\s*["']?\s*bearer\s+([A-Za-z0-9+/_~.-]{20,})/gim, valueGroup: 1},
  {type: 'jwt-like-value', regex: /\b(eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/gm, valueGroup: 1},
  {type: 'password-or-connection-secret', regex: /\b(?:password|pwd)\b["']?\s*[:=]\s*["']?([^"'\s;,]{8,})/gim, valueGroup: 1, valueFilter: isHardCodedSecretValue},
  {type: 'connection-string-secret', regex: /\b(?:accountkey|sharedaccesskey|sharedaccesssignature)\b\s*=\s*([^;"'\s]{8,})/gim, valueGroup: 1},
  {type: 'api-key', regex: /\b(?:api[_-]?key|subscription[_-]?key)\b["']?\s*[:=]\s*["']?([A-Za-z0-9+/_=-]{16,})/gim, valueGroup: 1}
];
const IDENTIFIER_PATTERNS = [
  {type: 'personal-email-or-upn', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gim},
  {type: 'tenant-or-object-identifier', regex: /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gim},
  {type: 'account-level-identifier', regex: /\bS-1-5-(?:\d+-){1,14}\d+\b/gim},
  {type: 'local-user-profile-identifier', regex: /(?:\b[A-Z]:\\|\/)Users[\\/][A-Z0-9._-]+/gim},
  {type: 'tenant-domain-identifier', regex: /\b[A-Z0-9][A-Z0-9.-]*\.onmicrosoft\.com\b/gim},
  {type: 'public-ipv4-identifier', regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/gm, valueFilter: isPublicIpv4},
  {type: 'public-ipv6-identifier', regex: /\b(?:[0-9A-F]{1,4}:){7}[0-9A-F]{1,4}\b/gim}
];
const IDENTIFIER_FINDING_TYPES = new Set(IDENTIFIER_PATTERNS.map((definition) => definition.type));

const technologyRules = [
  ['intune', /\bintune\b|managed device|endpoint management|compliance policy/i],
  ['exchange-online', /\bexchange\b|\bexo\b|mailbox|mail flow|transport rule|transportrule|mail enabled/i],
  ['teams', /\bteams?\b|channels?|collaboration/i],
  ['sharepoint', /sharepoint|onedrive|site collection|document librar/i],
  ['security-compliance', /conditional access|named location|security default|authentication method|authorization polic|legacy auth|mfa|security baseline|compliance/i],
  ['applications', /service principal|enterprise application|app registration|oauth|permission grant|application governance/i],
  ['entra-id', /\bentra\b|azure ad|directory role|directory audit|sign in|group member|identity|users?\.csv|groups?\.csv|devices?\.csv/i],
  ['automation', /powershell|\.ps1\b|microsoft graph|\bgraph\b|automation|script library|scriptpack/i],
  ['tenant-administration', /tenant|organization|verified domain|subscribed sku|service plan|licen[cs]|admin center/i]
];

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function toPosix(value) {
  return String(value).replaceAll('\\', '/').replace(/^\.\/+/, '');
}

function normalizeForTechnologyMatching(value) {
  return String(value).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function technologiesFor(value, fallback) {
  const normalized = normalizeForTechnologyMatching(value);
  const matches = technologyRules.filter((rule) => rule[1].test(normalized)).map((rule) => rule[0]);
  return [...new Set(matches.length ? matches : [fallback])];
}

function evidenceType(relativePath) {
  const value = normalizeForTechnologyMatching(relativePath.toLowerCase());
  const ext = path.extname(relativePath).toLowerCase();
  if (['.ps1', '.js', '.mjs', '.cjs'].includes(ext) && /(?:^|[\\/])scripts(?:[\\/]|$)/i.test(relativePath)) return 'scripts';
  if (/manifest/.test(value)) return 'manifests';
  if (/screenshot|screen shot/.test(value) || ['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) return 'screenshots';
  if (/validation|attempt|test result/.test(value)) return 'validation';
  if (/inventory|directory role|service principal|oauth|users|groups|devices|sign ins|audit/.test(value)) return 'inventories';
  if (/report|summary|proof map/.test(value)) return 'reports';
  if (/conditional access|named location|authentication|authorization|policy|configuration|config/.test(value)) return 'configuration';
  if (/script output|command output|console|transcript/.test(value) || ['.log', '.txt'].includes(ext)) return 'scripts-output';
  if (/test|check/.test(value)) return 'testing';
  if (['.csv', '.json', '.xml', '.yaml', '.yml'].includes(ext)) return 'exports';
  return 'documentation';
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
  const headers = rows.shift() || [];
  return rows.filter((values) => values.some(Boolean)).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function csvCell(value) {
  return '"' + String(value === undefined || value === null ? '' : value).replaceAll('"', '""') + '"';
}

function wrapperPathFor(sourceRelativePath) {
  return 'evidence-library/preserved-sharepoint/wrappers/' + toPosix(sourceRelativePath);
}

function publicUrlFor(relativePath) {
  return new URL('/' + toPosix(relativePath), 'https://jeremyfontenot.online').href;
}

function compactDescription(record, item) {
  const title = recruiterTitle(item.title || path.basename(item.source_rel));
  const category = String(item.category || 'SharePoint').replace(/\s+/g, ' ').trim();
  const suffix = record.id.slice(-8);
  const text = `Review ${title} as ${category} SharePoint evidence with provenance, scope, limitations, source access, and record ${suffix}.`;
  return text.length <= 160 ? text : `Review ${title.slice(0, 82).trim()} SharePoint evidence with provenance, limitations, source access, and record ${suffix}.`;
}

function recruiterTitle(value) {
  const cleaned = String(value)
    .replace(/\b(?:19|20)\d{2}(?:[-_.]?\d{2}){0,5}\b/g, ' ')
    .replace(/\b\d{8,14}\b/g, ' ')
    .replace(/[._-]{2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || 'SharePoint evidence artifact';
}

function renderSharePointWrapper(record, item, linkFindings) {
  const wrapperUrl = publicUrlFor(record.wrapperPath);
  const sourceUrl = publicUrlFor(item.site_rel);
  const title = String(item.title || path.basename(item.source_rel)).replace(/\s+/g, ' ').trim();
  const uniqueTitle = `${recruiterTitle(title)} | SharePoint Evidence ${record.id.slice(-8)}`;
  const description = compactDescription(record, item);
  const linkStatus = linkFindings.length
    ? `${linkFindings.length} unavailable archival reference${linkFindings.length === 1 ? '' : 's'} recorded without changing the preserved derivative.`
    : 'No unavailable archival references from this page were recorded in the supplied crawl.';
  const findingList = linkFindings.length
    ? '<details><summary>Inspect classified unavailable references</summary><ul>' + linkFindings.map((finding) => `<li><code>${escapeHtml(finding.targetPath)}</code> — ${escapeHtml(finding.classification.replaceAll('-', ' '))}</li>`).join('') + '</ul></details>'
    : '';
  const technologies = record.technologyRelationships.map((value) => value.replaceAll('-', ' ')).join(', ');
  return [
    '<!doctype html>',
    '<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>' + escapeHtml(uniqueTitle) + '</title><meta name="description" content="' + escapeHtml(description) + '"><meta name="robots" content="index, follow">',
    '<link rel="canonical" href="' + escapeHtml(wrapperUrl) + '"><meta property="og:title" content="' + escapeHtml(uniqueTitle) + '"><meta property="og:description" content="' + escapeHtml(description) + '">',
    '<link rel="icon" href="/assets/logos/favicon_64x64.png"><link rel="stylesheet" href="/assets/css/site.css"><link rel="stylesheet" href="/assets/css/evidence-document.css"><script src="/assets/js/site.js" defer></script></head>',
    '<body class="foundation-page sharepoint-page"><!-- GENERATED FILE — DO NOT EDIT DIRECTLY. --><a class="skip-link" href="#main">Skip to content</a>',
    '<header class="site-header"><nav class="nav" aria-label="Primary navigation"><a class="brand" href="/"><img src="/assets/logos/header_logo_88x88.png" alt="Jeremy Fontenot logo" width="44" height="44"><span>Jeremy Fontenot</span><small>Support · systems · evidence</small></a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu">Menu</button><div class="nav-links" id="primary-menu"><a href="/">Home</a><a href="/systems-administration.html">Readiness</a><a href="/microsoft-365/">Microsoft 365</a><a href="/microsoft-365/evidence-catalog.html">Evidence catalog</a><a href="/evidence/">Evidence</a></div></nav></header>',
    '<main id="main"><section class="page page-hero"><div class="section-head reveal is-visible"><p class="eyebrow">Generated SharePoint evidence wrapper</p><h1 data-allow-evidence-date>' + escapeHtml(title) + '</h1><p class="lead">Recruiter-readable context for one public derivative from the preserved SharePoint export collection. This wrapper does not rewrite or replace the linked artifact.</p><div class="actions"><a class="button primary" href="' + escapeHtml(sourceUrl) + '">Open exact public derivative</a><a class="button" href="/evidence-library/preserved-sharepoint/index.html">Return to preserved SharePoint catalog</a></div></div></section>',
    '<section class="section"><div class="section-head"><p class="eyebrow">Skill and task</p><h2>What this artifact demonstrates</h2></div><dl class="claim-details"><div><dt>Artifact title</dt><dd><code>' + escapeHtml(title) + '</code></dd></div><div><dt>Technology category</dt><dd>' + escapeHtml(technologies) + '</dd></div><div><dt>Source collection</dt><dd>Preserved SharePoint export</dd></div><div><dt>Evidence type</dt><dd>' + escapeHtml(record.evidenceType) + '</dd></div><div><dt>Skill demonstrated</dt><dd>' + escapeHtml(record.skill) + '</dd></div><div><dt>Action performed</dt><dd>' + escapeHtml(record.task) + '</dd></div><div><dt>Output captured</dt><dd>Offline SharePoint HTML presentation or sanitization derivative.</dd></div><div><dt>Result</dt><dd>' + escapeHtml(record.result) + '</dd></div></dl></section>',
    '<section class="section"><div class="section-head"><p class="eyebrow">Boundaries</p><h2>Scope, limitations, and provenance</h2></div><dl class="claim-details"><div><dt>Scope</dt><dd>' + escapeHtml(record.scope) + '</dd></div><div><dt>Limitations</dt><dd>' + escapeHtml(record.limitations) + '</dd></div><div><dt>Source repository</dt><dd><code>' + escapeHtml(record.sourceRepository) + '</code></dd></div><div><dt>Source path</dt><dd><code>' + escapeHtml(record.sourcePath) + '</code></dd></div><div><dt>Source commit</dt><dd><code>' + escapeHtml(record.sourceCommit) + '</code></dd></div><div><dt>Public derivative SHA-256</dt><dd><code>' + escapeHtml(record.publicIntegrity.hash) + '</code></dd></div><div><dt>Manifest reference</dt><dd><a href="/evidence-library/preserved-sharepoint/sharepoint-export-inventory.csv">SharePoint export inventory</a></dd></div></dl></section>',
    '<section class="section"><div class="section-head"><p class="eyebrow">Archival-link status</p><h2>Unavailable references are classified, not concealed</h2><p>' + escapeHtml(linkStatus) + '</p></div>' + findingList + '<p><a href="/evidence-library/preserved-sharepoint/link-integrity.html">Review collection-wide link-integrity findings</a></p></section></main>',
    '<footer class="site-footer"><p class="footer-meta">Personal-lab documentation · Generated evidence context</p></footer></body></html>',
    ''
  ].join('\n');
}

function renderLinkIntegrityPage(linkStatus, compatibilityRoutes) {
  const allFindings = Object.values(linkStatus.sources).flat();
  const classificationCounts = new Map();
  for (const finding of allFindings) classificationCounts.set(finding.classification, (classificationCounts.get(finding.classification) || 0) + 1);
  const cards = [...classificationCounts.entries()].sort((a, b) => b[1] - a[1]).map(([classification, count]) => `<article class="capability-card"><span class="tile-code">${count}</span><h2>${escapeHtml(classification.replaceAll('-', ' '))}</h2><p>Deterministically classified target references from the supplied SiteOne crawl.</p></article>`).join('');
  const description = 'SharePoint evidence link-integrity summary separating repaired compatibility assets, archival limitations, and Cloudflare-generated findings.';
  return [
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>SharePoint Evidence Link Integrity | Jeremy Fontenot</title><meta name="description" content="' + description + '"><meta name="robots" content="index, follow"><link rel="canonical" href="https://jeremyfontenot.online/evidence-library/preserved-sharepoint/link-integrity.html"><meta property="og:title" content="SharePoint Evidence Link Integrity | Jeremy Fontenot"><meta property="og:description" content="' + description + '"><link rel="icon" href="/assets/logos/favicon_64x64.png"><link rel="stylesheet" href="/assets/css/site.css"><script src="/assets/js/site.js" defer></script></head>',
    '<body class="foundation-page sharepoint-page"><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><nav class="nav" aria-label="Primary navigation"><a class="brand" href="/"><img src="/assets/logos/header_logo_88x88.png" alt="Jeremy Fontenot logo" width="44" height="44"><span>Jeremy Fontenot</span><small>Support · systems · evidence</small></a><div class="nav-links" id="primary-menu"><a href="/">Home</a><a href="/microsoft-365/">Microsoft 365</a><a href="/evidence-library/preserved-sharepoint/index.html">SharePoint evidence</a></div></nav></header>',
    '<main id="main"><section class="page page-hero"><div class="section-head"><p class="eyebrow">Evidence integrity</p><h1>Preserved SharePoint link-integrity classification</h1><p class="lead">The source derivatives remain unchanged. Missing references are separated into reviewed compatibility mappings and documented archival limitations rather than hidden or converted into misleading content.</p></div></section>',
    '<section class="section"><div class="section-head"><h2>Classification totals</h2><p>' + escapeHtml(linkStatus.totalUniqueMissingTargets) + ' unique missing targets and ' + escapeHtml(linkStatus.totalSourceReferences) + ' source references were analyzed. ' + compatibilityRoutes.mappings.length + ' byte-identical compatibility asset routes are reviewed for publication.</p></div><div class="capability-grid">' + cards + '</div></section>',
    '<section class="section"><div class="section-head"><h2>Preservation boundary</h2><p>Unavailable links embedded in preserved derivatives are retained as provenance. Generated wrappers disclose their status and link to the exact artifact, inventory, and catalog.</p></div><div class="actions"><a class="button primary" href="/evidence-library/preserved-sharepoint/index.html">Browse evidence wrappers</a><a class="button" href="/microsoft-365/evidence-catalog.html">Open Microsoft 365 catalog</a></div></section></main>',
    '<footer class="site-footer"><p class="footer-meta">Evidence preserved · Findings classified</p></footer></body></html>',
    ''
  ].join('\n');
}

function sitemapWithWrapperRoutes(xml, routes) {
  const withoutWrappers = xml.replace(/\s*<url>\s*<loc>https:\/\/jeremyfontenot\.online\/evidence-library\/preserved-sharepoint\/(?:wrappers\/[^<]+|link-integrity\.html)<\/loc>\s*<\/url>/g, '');
  const entries = routes.map((route) => `  <url>\n    <loc>${escapeHtml(publicUrlFor(route))}</loc>\n  </url>`).join('\n');
  return withoutWrappers.replace(/\s*<\/urlset>\s*$/, '\n' + entries + '\n</urlset>\n');
}

function listTrackedFiles() {
  const output = execFileSync('git', ['ls-files', '-z'], {cwd: root, encoding: 'utf8'});
  return [...new Set(output.split('\0').filter(Boolean).map(toPosix))].sort();
}

function discoverSourceFiles(outputRoots = GENERATED_OUTPUT_ROOTS) {
  return listTrackedFiles().filter((file) => !outputRoots.some((prefix) => file.startsWith(prefix)));
}

function discoverCandidateFiles(sourceFiles, sourceManifest) {
  const candidatePattern = new RegExp(sourceManifest.candidatePathTerms.map((term) => '(?:' + term + ')').join('|'), 'i');
  const contentRoots = sourceManifest.contentCandidateRoots || [];
  if (!Array.isArray(contentRoots) || contentRoots.some((prefix) => !prefix || !prefix.endsWith('/') || prefix.includes('..'))) {
    throw new Error('Microsoft 365 content-candidate roots must be safe repository-relative directory prefixes.');
  }
  return [...new Set([
    ...sourceFiles.filter((file) => candidatePattern.test(file)),
    ...sourceFiles.filter((file) =>
      contentRoots.some((prefix) => file.startsWith(prefix)) &&
      TEXT_EXTENSIONS.has(path.extname(file).toLowerCase()) &&
      candidatePattern.test(fs.readFileSync(path.join(root, file), 'utf8')),
    ),
  ])].sort();
}

function readGitObject(commit, sourcePath) {
  return execFileSync('git', ['show', commit + ':' + toPosix(sourcePath)], {
    cwd: root,
    encoding: null,
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function readGitObjects(commit, sourcePaths) {
  const normalizedPaths = [...new Set(sourcePaths.map(toPosix))];
  const input = normalizedPaths.map((sourcePath) => commit + ':' + sourcePath).join('\n') + '\n';
  const output = execFileSync('git', ['cat-file', '--batch'], {
    cwd: root,
    encoding: null,
    input,
    maxBuffer: 512 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  const result = new Map();
  let offset = 0;
  for (const sourcePath of normalizedPaths) {
    const newline = output.indexOf(10, offset);
    if (newline < 0) throw new Error('Unexpected git cat-file output for ' + sourcePath);
    const header = output.subarray(offset, newline).toString('utf8');
    const parts = header.split(' ');
    if (parts[1] === 'missing') throw new Error('Missing source blob: ' + commit + ':' + sourcePath);
    const size = Number(parts[2]);
    const start = newline + 1;
    result.set(sourcePath, output.subarray(start, start + size));
    offset = start + size + 1;
  }
  return result;
}

function normalizeDestinationPath(relativePath) {
  const parts = toPosix(relativePath).split('/');
  if (!parts.length || parts.some((part) => !part || part === '.' || part === '..')) {
    throw new Error('Unsafe logical destination source path: ' + relativePath);
  }
  return parts.map((part) => {
    const normalized = part.normalize('NFKC').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!normalized || normalized === '.' || normalized === '..') throw new Error('Unsafe logical destination segment: ' + part);
    return normalized;
  }).join('/');
}

function logicalDestination(technology, type, collection, relativeSourcePath) {
  const folder = type === 'documentation' ? 'documentation' : type === 'scripts' ? 'scripts' : 'evidence/' + type;
  return 'content/microsoft-365/' + technology + '/' + folder + '/' + collection + '/' + normalizeDestinationPath(relativeSourcePath);
}

function publicRouteFor(sourcePath, publicationManifest) {
  const normalized = toPosix(sourcePath);
  const first = normalized.split('/')[0];
  if (publicationManifest.directories.includes(first)) return '/' + normalized;
  if (!normalized.includes('/') && publicationManifest.rootExtensions.includes(path.extname(normalized))) return '/' + normalized;
  return null;
}

function isHardCodedSecretValue(value) {
  const normalized = String(value).trim();
  if (!normalized || normalized.startsWith('$')) return false;
  return !/^(?:<\s*(?:password|pwd|secret|redacted|placeholder)\s*>|\[\s*(?:password|pwd|secret|redacted|placeholder)\s*\]|\{\{\s*(?:password|pwd|secret|redacted|placeholder)\s*\}\}|redacted|placeholder|test_fixture_placeholder)$/i.test(normalized);
}

function exceptionFor(finding, sourcePath, exceptionManifest, matchedExceptionIds) {
  for (const exception of exceptionManifest.exceptions) {
    if (exception.findingType !== finding.type) continue;
    if (!exception.scope.includes(sourcePath)) continue;
    const valueHash = sha256(Buffer.from(finding.value));
    const fingerprintMatch = Array.isArray(exception.valueFingerprints) && exception.valueFingerprints.includes(valueHash);
    if (fingerprintMatch) {
      if (matchedExceptionIds) matchedExceptionIds.add(exception.id);
      return exception;
    }
  }
  return null;
}

function validateExceptionManifest(exceptionManifest, trackedSet) {
  const errors = [];
  const ids = new Set();
  for (const [index, exception] of (exceptionManifest.exceptions || []).entries()) {
    const context = 'sensitive-data exceptions[' + index + ']';
    if (!exception.id || ids.has(exception.id)) errors.push(context + ': missing or duplicate stable id');
    ids.add(exception.id);
    if (!exception.findingType || !IDENTIFIER_FINDING_TYPES.has(exception.findingType)) errors.push(context + ': missing or invalid identifier findingType');
    if (!exception.reason) errors.push(context + ': missing reason');
    if (!exception.reviewerNote) errors.push(context + ': missing reviewerNote');
    if (!Array.isArray(exception.scope) || !exception.scope.length) errors.push(context + ': scope must contain at least one reviewed path');
    if (exception.pattern) errors.push(context + ': reviewed identifiers must use exact SHA-256 fingerprints');
    if (!Array.isArray(exception.valueFingerprints) || !exception.valueFingerprints.length || exception.valueFingerprints.some((value) => !/^[0-9a-f]{64}$/.test(value))) {
      errors.push(context + ': reviewed identifiers require exact SHA-256 fingerprints');
    }
    for (const scope of exception.scope || []) {
      if (!trackedSet.has(toPosix(scope))) errors.push(context + ': reviewed identifier scope must be one exact tracked file: ' + scope);
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
}

function isPublicIpv4(value, match, text) {
  const octets = String(value).split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false;
  const context = text.slice(Math.max(0, match.index - 48), match.index + value.length + 48);
  const escaped = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (new RegExp('(?:serialization|protocol|stack|module|package)?\\s*version\\s*[:=/ -]*' + escaped, 'i').test(context)) return false;
  if (new RegExp('[/\\\\]\\s*' + escaped + '\\s*[/\\\\]').test(context)) return false;
  if (value === '1.4.8.1' && (/PackageManagement/i.test(context) || /href=['"][^'"]*1\.4\.8\.1\/index\.html/i.test(context))) return false;
  const [a, b, c] = octets;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false;
  if (a === 198 && (b === 18 || b === 19 || b === 51 && c === 100)) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  return true;
}

function scanText(buffer, sourcePath, exceptionManifest, isPublic, matchedExceptionIds) {
  const text = buffer.toString('utf8');
  const findings = [];
  function collect(definition, severity) {
    definition.regex.lastIndex = 0;
    let match;
    while ((match = definition.regex.exec(text)) !== null) {
      const value = match[definition.valueGroup || 0];
      if (definition.valueFilter && !definition.valueFilter(value, match, text)) continue;
      const finding = {
        type: definition.type,
        severity,
        value,
        fingerprint: sha256(Buffer.from(value)).slice(0, 16),
        line: text.slice(0, match.index).split(/\r?\n/).length
      };
      const reviewedException = severity === 'medium' ? exceptionFor(finding, sourcePath, exceptionManifest, matchedExceptionIds) : null;
      finding.reviewStatus = reviewedException ? 'reviewed-exception' : (isPublic ? 'review-required' : 'not-published-source');
      finding.exceptionId = reviewedException ? reviewedException.id : null;
      findings.push(finding);
      if (match[0].length === 0) definition.regex.lastIndex += 1;
    }
  }
  for (const definition of HIGH_SEVERITY_PATTERNS) collect(definition, 'high');
  for (const definition of IDENTIFIER_PATTERNS) collect(definition, 'medium');
  return findings;
}

function summarizeFindings(findings) {
  const groups = new Map();
  for (const finding of findings) {
    const key = [finding.type, finding.severity, finding.reviewStatus, finding.exceptionId || ''].join('|');
    if (!groups.has(key)) {
      groups.set(key, {
        type: finding.type,
        severity: finding.severity,
        reviewStatus: finding.reviewStatus,
        exceptionId: finding.exceptionId,
        occurrences: 0,
        lines: [],
        valueFingerprints: []
      });
    }
    const group = groups.get(key);
    group.occurrences += 1;
    if (!group.lines.includes(finding.line)) group.lines.push(finding.line);
    if (!group.valueFingerprints.includes(finding.fingerprint)) group.valueFingerprints.push(finding.fingerprint);
  }
  return [...groups.values()].map((group) => ({
    ...group,
    lines: group.lines.slice(0, 50).sort((a, b) => a - b),
    valueFingerprints: group.valueFingerprints.sort()
  })).sort((a, b) => a.severity.localeCompare(b.severity) || a.type.localeCompare(b.type) || a.reviewStatus.localeCompare(b.reviewStatus));
}

function reviewArtifact(buffer, sourcePath, publicRoute, exceptionManifest, matchedExceptionIds) {
  const ext = path.extname(sourcePath).toLowerCase();
  if (BINARY_RESTRICTED_EXTENSIONS.has(ext)) {
    return {
      status: 'manual-review-required',
      highSeverityFindings: 1,
      identifierFindings: 0,
      manualReviewRequired: true,
      findings: [{type: 'restricted-binary-container', severity: 'high', reviewStatus: 'review-required', exceptionId: null, occurrences: 1, lines: [], valueFingerprints: []}]
    };
  }
  if (!TEXT_EXTENSIONS.has(ext)) {
    return {status: 'manual-review-required', highSeverityFindings: 0, identifierFindings: 0, manualReviewRequired: true, findings: []};
  }
  const rawFindings = scanText(buffer, sourcePath, exceptionManifest, Boolean(publicRoute), matchedExceptionIds);
  const highSeverityFindings = rawFindings.filter((finding) => finding.severity === 'high').length;
  const identifierFindings = rawFindings.filter((finding) => finding.severity === 'medium').length;
  const reviewed = rawFindings.some((finding) => finding.reviewStatus === 'reviewed-exception');
  return {
    status: reviewed ? 'reviewed-exceptions-applied' : 'automated-no-high-severity-findings',
    highSeverityFindings,
    identifierFindings,
    manualReviewRequired: false,
    findings: summarizeFindings(rawFindings)
  };
}

function validateValue(value, definition, schema, context, errors) {
  if (definition.$ref) {
    const name = definition.$ref.split('/').pop();
    return validateValue(value, schema.$defs[name], schema, context, errors);
  }
  if (definition.const !== undefined && value !== definition.const) errors.push(context + ': must equal ' + definition.const);
  if (definition.enum && !definition.enum.includes(value)) errors.push(context + ': unsupported value ' + value);
  const allowedTypes = definition.type ? (Array.isArray(definition.type) ? definition.type : [definition.type]) : [];
  if (allowedTypes.length) {
    const actualType = value === null ? 'null' : Array.isArray(value) ? 'array' : Number.isInteger(value) ? 'integer' : typeof value;
    if (!allowedTypes.includes(actualType) && !(actualType === 'integer' && allowedTypes.includes('number'))) {
      errors.push(context + ': expected ' + allowedTypes.join('|') + ', received ' + actualType);
      return;
    }
  }
  if (typeof value === 'string') {
    if (definition.minLength !== undefined && value.length < definition.minLength) errors.push(context + ': shorter than minLength');
    if (definition.pattern && !new RegExp(definition.pattern).test(value)) errors.push(context + ': does not match ' + definition.pattern);
  }
  if (typeof value === 'number' && definition.minimum !== undefined && value < definition.minimum) errors.push(context + ': below minimum');
  if (Array.isArray(value)) {
    if (definition.minItems !== undefined && value.length < definition.minItems) errors.push(context + ': too few items');
    if (definition.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) errors.push(context + ': duplicate array items');
    if (definition.items) value.forEach((item, index) => validateValue(item, definition.items, schema, context + '[' + index + ']', errors));
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const required of definition.required || []) {
      if (!(required in value)) errors.push(context + ': missing required property ' + required);
    }
    if (definition.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!definition.properties || !(key in definition.properties)) errors.push(context + ': unexpected property ' + key);
      }
    }
    for (const [key, propertyDefinition] of Object.entries(definition.properties || {})) {
      if (key in value) validateValue(value[key], propertyDefinition, schema, context + '.' + key, errors);
    }
  }
  for (const clause of definition.allOf || []) {
    let apply = true;
    if (clause.if) {
      const probe = [];
      validateValue(value, clause.if, schema, context, probe);
      apply = probe.length === 0;
    }
    if (apply && clause.then) validateValue(value, clause.then, schema, context, errors);
    if (!apply && clause.else) validateValue(value, clause.else, schema, context, errors);
  }
}

function validateEvidenceRecord(record, schema, context) {
  const errors = [];
  validateValue(record, schema.$defs.evidenceRecord, schema, context, errors);
  return errors;
}

function build() {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'content/microsoft-365/evidence-organization.json'), 'utf8'));
  const sourceManifest = JSON.parse(fs.readFileSync(path.join(root, 'content/microsoft-365/source-manifest.json'), 'utf8'));
  const exceptionManifest = JSON.parse(fs.readFileSync(path.join(root, 'content/microsoft-365/sensitive-data-exceptions.json'), 'utf8'));
  const sharePointAttestation = JSON.parse(fs.readFileSync(path.join(root, config.sharePointSourceAttestation), 'utf8'));
  const sharePointLinkStatus = JSON.parse(fs.readFileSync(path.join(root, config.sharePointArchivalLinkStatus), 'utf8'));
  const sharePointCompatibilityRoutes = JSON.parse(fs.readFileSync(path.join(root, config.sharePointCompatibilityRoutes), 'utf8'));
  const taxonomy = JSON.parse(fs.readFileSync(path.join(root, 'content/microsoft-365/technologies.json'), 'utf8'));
  const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas/site-foundation.schema.json'), 'utf8'));
  const publicationManifest = JSON.parse(fs.readFileSync(path.join(root, 'config/publication-manifest.json'), 'utf8'));
  if (sharePointAttestation.sourceRepository !== config.sources.preservedSharePoint.repository ||
      sharePointAttestation.sourceCommit !== config.sources.preservedSharePoint.commit ||
      toPosix(sharePointAttestation.inventoryPath) !== toPosix(config.sources.preservedSharePoint.inventory) ||
      sharePointAttestation.inventoryCommit !== config.sources.currentPortfolio.commit) {
    throw new Error('Configured SharePoint provenance does not match the independent reviewed attestation.');
  }
  const trackedFiles = listTrackedFiles();
  const trackedSet = new Set(trackedFiles);
  const outputRoots = sourceManifest.generatedOutputRoots || GENERATED_OUTPUT_ROOTS;
  if (!Array.isArray(outputRoots) || outputRoots.some((prefix) => !prefix || !prefix.endsWith('/') || prefix.includes('..'))) {
    throw new Error('Microsoft 365 generated-output roots must be safe repository-relative directory prefixes.');
  }
  const sourceFiles = discoverSourceFiles(outputRoots);
  validateExceptionManifest(exceptionManifest, trackedSet);
  const candidates = discoverCandidateFiles(sourceFiles, sourceManifest);
  const exclusions = new Map(sourceManifest.reviewedExclusions.map((item) => [toPosix(item.path), item.reason]));
  const approved = new Map();

  for (const rootEntry of sourceManifest.approvedRecursiveRoots) {
    const sourceRoot = toPosix(rootEntry.path).replace(/\/+$/, '');
    const files = sourceFiles.filter((file) => file.startsWith(sourceRoot + '/'));
    if (!files.length) throw new Error('Approved Microsoft 365 recursive root is empty or missing: ' + sourceRoot);
    for (const file of files) approved.set(file, {...rootEntry, path: file, sourceRoot});
  }
  for (const item of sourceManifest.approvedIndividualFiles) {
    const file = toPosix(item.path);
    if (!sourceFiles.includes(file)) throw new Error('Approved Microsoft 365 individual file is missing or belongs to a generated output root: ' + file);
    approved.set(file, {...item, path: file, sourceRoot: null});
  }
  for (const excludedPath of exclusions.keys()) {
    if (approved.has(excludedPath)) approved.delete(excludedPath);
  }

  const workingTreeDrift = new Set(execFileSync('git', ['diff', '--name-only', 'HEAD', '--'], {cwd: root, encoding: 'utf8'}).split(/\r?\n/).filter(Boolean).map(toPosix));
  const generatorManagedSources = new Set(['evidence-library/integrity/evidence-hashes.json']);
  const driftedSources = [...approved.keys()].filter((file) => workingTreeDrift.has(file) && !generatorManagedSources.has(file));
  if (driftedSources.length) throw new Error('Approved sources have uncommitted drift; regenerate only after recording their source commits:\n' + driftedSources.join('\n'));

  const uncovered = candidates.filter((file) => !approved.has(file) && !exclusions.has(file));
  if (uncovered.length) throw new Error('Microsoft 365 candidate files require catalog records or reviewed exclusions:\n' + uncovered.join('\n'));
  for (const excludedPath of exclusions.keys()) {
    if (!trackedSet.has(excludedPath) && !['assets/data/m365-evidence-catalog.json','microsoft-365/evidence-catalog.html','microsoft-365/index.html','microsoft-365/source-to-destination-matrix.csv','microsoft-365/duplicate-groups.json','microsoft-365/sensitive-data-review.json','content/microsoft-365/generated-output-hashes.json'].includes(excludedPath)) {
      throw new Error('Reviewed Microsoft 365 exclusion path is missing: ' + excludedPath);
    }
  }

  const technologyBySlug = new Map(taxonomy.technologies.map((item) => [item.slug, item]));
  const claimConfigBySlug = new Map(config.technologies.map((item) => [item.slug, item]));
  const claimConfigById = new Map([
    ...config.technologies.map((item) => [item.claimId, item]),
    ...(config.additionalClaims || []).map((item) => [item.claimId, item])
  ]);
  const approvedTechnologies = new Set(config.technologies.map((item) => item.slug));
  const currentCommit = config.sources.currentPortfolio.commit;
  const currentRepository = config.sources.currentPortfolio.repository;
  const sharePointRoot = toPosix(config.sources.preservedSharePoint.publicRoot);
  const inventoryPath = toPosix(config.sources.preservedSharePoint.inventory);
  const directSourcePaths = [...approved.keys()].filter((file) => !file.startsWith(sharePointRoot + '/'));
  const headObjects = readGitObjects('HEAD', [...approved.keys(), inventoryPath]);
  const defaultCommitSourcePaths = directSourcePaths.filter((file) => !approved.get(file).sourceCommit);
  const recordedObjects = readGitObjects(currentCommit, [...defaultCommitSourcePaths, inventoryPath]);
  const inventoryBuffer = headObjects.get(inventoryPath);
  const inventoryCommitBuffer = recordedObjects.get(inventoryPath);
  if (sha256(inventoryBuffer) !== sha256(inventoryCommitBuffer)) throw new Error('SharePoint attestation inventory differs from recorded commit ' + currentCommit);
  if (sha256(inventoryCommitBuffer) !== sharePointAttestation.inventorySha256) throw new Error('SharePoint inventory hash does not match the independent reviewed attestation.');
  const sharePointRows = parseCsv(inventoryBuffer.toString('utf8'));
  if (sharePointRows.length !== sharePointAttestation.expectedRecords) throw new Error('SharePoint inventory record count does not match the independent reviewed attestation.');
  const sharePointPhysicalPaths = new Set(sharePointRows.map((item) => toPosix(item.site_rel)));
  const approvedSharePointPaths = [...approved.keys()].filter((file) => file.startsWith(sharePointRoot + '/'));
  const missingInventoryRows = approvedSharePointPaths.filter((file) => !sharePointPhysicalPaths.has(file));
  const missingPublicDerivatives = [...sharePointPhysicalPaths].filter((file) => !approved.has(file));
  if (missingInventoryRows.length || missingPublicDerivatives.length) {
    throw new Error('SharePoint inventory/public derivative mismatch:\nUnattested derivatives:\n' + missingInventoryRows.join('\n') + '\nMissing derivatives:\n' + missingPublicDerivatives.join('\n'));
  }

  const records = [];
  const sharePointWrappers = new Map();
  const reviewEntries = [];
  const highSeverityFailures = [];
  const unresolvedPublicIdentifiers = [];
  const matchedExceptionIds = new Set();

  function reviewForRecord(record, buffer, physicalPath) {
    const review = reviewArtifact(buffer, physicalPath, record.publicRoute, exceptionManifest, matchedExceptionIds);
    record.sensitiveDataReview = {
      status: review.status,
      highSeverityFindings: review.highSeverityFindings,
      identifierFindings: review.identifierFindings,
      manualReviewRequired: review.manualReviewRequired
    };
    if (review.findings.length || review.manualReviewRequired) {
      reviewEntries.push({evidenceId: record.id, path: physicalPath, publicationClassification: record.publicationClassification, status: review.status, findings: review.findings});
    }
    if (review.highSeverityFindings) highSeverityFailures.push(physicalPath);
    for (const finding of review.findings) {
      if (record.publicRoute && finding.severity === 'medium' && finding.reviewStatus === 'review-required') unresolvedPublicIdentifiers.push(physicalPath + ' [' + finding.type + ']');
    }
  }

  for (const [sourcePath, manifestEntry] of [...approved.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (sourcePath.startsWith(sharePointRoot + '/')) continue;
    const buffer = headObjects.get(sourcePath);
    const sourceCommit = manifestEntry.sourceCommit || currentCommit;
    const recordedBuffer = manifestEntry.sourceCommit ? readGitObject(sourceCommit, sourcePath) : recordedObjects.get(sourcePath);
    if (sha256(buffer) !== sha256(recordedBuffer)) throw new Error('Approved source differs from recorded commit ' + sourceCommit + ': ' + sourcePath);
    const type = evidenceType(sourcePath);
    const configuredRelationships = manifestEntry.technologyRelationships || technologiesFor(sourcePath, 'tenant-administration');
    const relationships = [...new Set(configuredRelationships)].filter((slug) => approvedTechnologies.has(slug));
    if (!relationships.length || relationships.length !== new Set(configuredRelationships).size) {
      throw new Error('Approved source has an invalid technology relationship: ' + sourcePath);
    }
    const technology = relationships[0];
    const claimTechnologySlugs = manifestEntry.claimTechnologies || relationships;
    const claimIds = manifestEntry.supportedClaimIds || [...new Set(claimTechnologySlugs)].map((slug) => claimConfigBySlug.get(slug)?.claimId);
    if (!claimIds.length || claimIds.some((claimId) => !claimConfigById.has(claimId)) ||
        (!manifestEntry.supportedClaimIds && claimTechnologySlugs.some((slug) => !relationships.includes(slug) || !claimConfigBySlug.has(slug)))) {
      throw new Error('Approved source has an invalid supported claim: ' + sourcePath);
    }
    const taxonomyRecord = technologyBySlug.get(technology);
    const publicRoute = publicRouteFor(sourcePath, publicationManifest);
    const classification = publicRoute ? 'public-original' : 'metadata-only';
    const relativeSource = manifestEntry.sourceRoot ? toPosix(path.relative(manifestEntry.sourceRoot, sourcePath)) : sourcePath;
    const sourceHash = sha256(buffer);
    const record = {
      id: 'm365-' + manifestEntry.collection + '-' + sha256(Buffer.from(sourcePath)).slice(0, 16),
      lab: 'microsoft-365',
      technology,
      evidenceType: type,
      sourceRepository: currentRepository,
      sourcePath,
      sourceCommit,
      sourceVerificationMethod: 'direct-git-object',
      collectionContext: classification === 'public-original'
        ? manifestEntry.reason + ' The tracked public artifact remains at its established route and is logically organized without moving or rewriting it.'
        : manifestEntry.reason + ' This repository-only source is cataloged as metadata and is not assigned a public route.',
      hashAlgorithm: 'sha256',
      hash: sourceHash,
      supportedClaims: claimIds,
      skill: taxonomyRecord.skill,
      task: taxonomyRecord.task,
      result: taxonomyRecord.result,
      scope: taxonomyRecord.scope,
      limitations: taxonomyRecord.limitations + (TEXT_EXTENSIONS.has(path.extname(sourcePath).toLowerCase()) ? '' : ' Binary content is subject to documented manual-review limitations.'),
      publicationClassification: classification,
      publicRoute,
      collection: manifestEntry.collection,
      publicPath: publicRoute ? sourcePath : null,
      size: buffer.length,
      technologyRelationships: relationships,
      logicalDestination: logicalDestination(technology, type, manifestEntry.collection, relativeSource),
      sourceIntegrity: {algorithm: 'sha256', hash: sourceHash, size: buffer.length, verificationMethod: 'direct-git-object'}
    };
    if (publicRoute) record.publicIntegrity = {algorithm: 'sha256', hash: sourceHash, size: buffer.length, verificationMethod: 'current-working-tree'};
    reviewForRecord(record, buffer, sourcePath);
    records.push(record);
  }

  const attestationHash = sha256(inventoryBuffer);
  for (const item of sharePointRows) {
    const publicPath = toPosix(item.site_rel);
    const absolute = path.join(root, publicPath);
    if (!fs.existsSync(absolute)) throw new Error('Missing preserved SharePoint public derivative: ' + publicPath);
    const publicBuffer = headObjects.get(publicPath);
    const publicHash = sha256(publicBuffer);
    const searchable = [item.source_rel, item.title, item.category, item.excerpt].join(' ');
    const related = technologiesFor(searchable, 'sharepoint').filter((slug) => approvedTechnologies.has(slug));
    const relationships = [...new Set(['sharepoint', ...related])];
    const taxonomyRecord = technologyBySlug.get('sharepoint');
    const record = {
      id: 'm365-preserved-sharepoint-' + sha256(Buffer.from(item.source_rel)).slice(0, 16),
      lab: 'microsoft-365',
      technology: 'sharepoint',
      evidenceType: 'exports',
      sourceRepository: config.sources.preservedSharePoint.repository,
      sourcePath: toPosix(item.source_rel),
      sourceCommit: config.sources.preservedSharePoint.commit,
      sourceVerificationMethod: 'manifest-attested-source',
      attestationPath: inventoryPath,
      attestationCommit: currentCommit,
      attestationHashAlgorithm: 'sha256',
      attestationHash,
      collectionContext: 'Original SharePoint export integrity is attested by the reviewed inventory. The linked public copy is a presentation or sanitization derivative and is not described as byte-preserved or as a live SharePoint resource.',
      hashAlgorithm: 'sha256',
      hash: publicHash,
      supportedClaims: [claimConfigBySlug.get('sharepoint').claimId],
      skill: taxonomyRecord.skill,
      task: taxonomyRecord.task,
      result: 'The reviewed source export is represented by an established public presentation or sanitization derivative with separately verified integrity.',
      scope: taxonomyRecord.scope,
      limitations: taxonomyRecord.limitations + ' Original bytes are attested by inventory; the public copy has different presentation bytes.',
      publicationClassification: 'sanitized-derivative',
      publicRoute: '/' + publicPath,
      wrapperRoute: '/' + wrapperPathFor(item.source_rel),
      wrapperPath: wrapperPathFor(item.source_rel),
      collection: 'preserved-sharepoint-export',
      publicPath,
      size: publicBuffer.length,
      technologyRelationships: relationships,
      logicalDestination: logicalDestination('sharepoint', 'exports', 'preserved-sharepoint-export', item.source_rel),
      sourceIntegrity: {
        algorithm: 'sha256',
        hash: String(item.sha256).toLowerCase(),
        size: Number(item.size),
        verificationMethod: 'manifest-attested-source'
      },
      publicIntegrity: {
        algorithm: 'sha256',
        hash: publicHash,
        size: publicBuffer.length,
        verificationMethod: 'current-working-tree'
      },
      title: item.title,
      category: item.category,
      extension: item.ext
    };
    const linkFindings = sharePointLinkStatus.sources[publicPath] || [];
    record.archivalLinkStatus = {
      unavailableTargetCount: linkFindings.length,
      classifications: [...new Set(linkFindings.map((finding) => finding.classification))].sort()
    };
    reviewForRecord(record, publicBuffer, publicPath);
    records.push(record);
    sharePointWrappers.set(record.wrapperPath, renderSharePointWrapper(record, item, linkFindings));
  }

  if (highSeverityFailures.length) {
    throw new Error('High-severity secret material or restricted binary containers detected:\n' + [...new Set(highSeverityFailures)].sort().join('\n'));
  }
  if (unresolvedPublicIdentifiers.length) {
    throw new Error('Public identifier findings require reviewed exceptions:\n' + [...new Set(unresolvedPublicIdentifiers)].sort().join('\n'));
  }
  const unmatchedExceptions = exceptionManifest.exceptions.filter((exception) => !matchedExceptionIds.has(exception.id));
  if (unmatchedExceptions.length) {
    throw new Error('Reviewed sensitive-data exceptions must match a current reviewed finding:\n' + unmatchedExceptions.map((exception) => exception.id).sort().join('\n'));
  }

  records.sort((a, b) => a.id.localeCompare(b.id));
  const recordIds = new Set();
  const sourceKeys = new Set();
  const physicalKeys = new Set();
  const destinations = new Map();
  const schemaErrors = [];
  for (const [index, record] of records.entries()) {
    schemaErrors.push(...validateEvidenceRecord(record, schema, 'records[' + index + ']'));
    if (recordIds.has(record.id)) schemaErrors.push('records[' + index + ']: duplicate evidence id ' + record.id);
    recordIds.add(record.id);
    const sourceKey = record.sourceRepository + '@' + record.sourceCommit + ':' + record.sourcePath;
    if (sourceKeys.has(sourceKey)) schemaErrors.push('records[' + index + ']: physical source is represented more than once: ' + sourceKey);
    sourceKeys.add(sourceKey);
    const physicalKey = record.publicPath || record.sourcePath;
    if (physicalKeys.has(physicalKey)) schemaErrors.push('records[' + index + ']: working-tree artifact is represented more than once: ' + physicalKey);
    physicalKeys.add(physicalKey);
    const destinationKey = record.logicalDestination.toLowerCase();
    if (destinations.has(destinationKey)) schemaErrors.push('records[' + index + ']: logical destination collision with ' + destinations.get(destinationKey) + ': ' + record.logicalDestination);
    destinations.set(destinationKey, record.id);
    const resolvedDestination = path.resolve(root, record.logicalDestination);
    const approvedContentRoot = path.resolve(root, 'content/microsoft-365');
    if (!(resolvedDestination === approvedContentRoot || resolvedDestination.startsWith(approvedContentRoot + path.sep))) schemaErrors.push('records[' + index + ']: logical destination escapes approved root');
    if (toPosix(record.logicalDestination).split('/').some((part) => part === '.' || part === '..')) schemaErrors.push('records[' + index + ']: logical destination contains traversal');
    if (record.publicRoute) {
      const routePath = record.publicRoute.replace(/^\//, '');
      if (!fs.existsSync(path.join(root, routePath))) schemaErrors.push('records[' + index + ']: public route does not exist: ' + record.publicRoute);
      if (!record.publicIntegrity || record.hash !== record.publicIntegrity.hash || record.size !== record.publicIntegrity.size) schemaErrors.push('records[' + index + ']: linked route hash and size must use public derivative integrity');
    } else if (!['metadata-only', 'source-reference-only'].includes(record.publicationClassification)) {
      schemaErrors.push('records[' + index + ']: public classification requires a public route');
    }
  }
  const expectedPhysicalPaths = [...approved.keys()].sort();
  const missingRepresentations = expectedPhysicalPaths.filter((file) => !physicalKeys.has(file) && !sourceKeys.has(currentRepository + '@' + currentCommit + ':' + file));
  if (missingRepresentations.length) schemaErrors.push('Approved physical artifacts missing records: ' + missingRepresentations.join(', '));
  if (records.length !== expectedPhysicalPaths.length) schemaErrors.push('One-to-one source relationship failed: ' + records.length + ' records for ' + expectedPhysicalPaths.length + ' approved physical artifacts');

  const technologyMap = new Map(config.technologies.map((technology) => [technology.slug, {...technology, evidenceIds: [], counts: {}}]));
  for (const record of records) {
    for (const slug of record.technologyRelationships) {
      const technology = technologyMap.get(slug);
      if (!technology) schemaErrors.push('Unknown Microsoft 365 technology relationship: ' + slug);
      else {
        technology.evidenceIds.push(record.id);
        technology.counts[record.evidenceType] = (technology.counts[record.evidenceType] || 0) + 1;
      }
    }
  }
  const claimRelationships = [...technologyMap.values()].map((technology) => ({
    claimId: technology.claimId,
    claimText: technology.claim,
    evidenceIds: records.filter((record) => record.supportedClaims.includes(technology.claimId)).map((record) => record.id).sort(),
    supportLevel: technology.supportLevel,
    scope: technologyBySlug.get(technology.slug).scope,
    limitations: technologyBySlug.get(technology.slug).limitations
  })).concat((config.additionalClaims || []).map((claim) => ({
    claimId: claim.claimId,
    claimText: claim.claim,
    evidenceIds: records.filter((record) => record.supportedClaims.includes(claim.claimId)).map((record) => record.id).sort(),
    supportLevel: claim.supportLevel,
    scope: claim.scope,
    limitations: claim.limitations
  })));
  const claimById = new Map(claimRelationships.map((claim) => [claim.claimId, claim]));
  for (const record of records) {
    for (const claimId of record.supportedClaims) {
      const claim = claimById.get(claimId);
      if (!claim) schemaErrors.push(record.id + ': unknown supported claim ' + claimId);
      else if (!claim.evidenceIds.includes(record.id)) schemaErrors.push(record.id + ': claim relationship is not reciprocal for ' + claimId);
    }
  }
  for (const claim of claimRelationships) {
    const claimErrors = [];
    validateValue(claim, schema.$defs.claimRelationship, schema, 'claimRelationships.' + claim.claimId, claimErrors);
    schemaErrors.push(...claimErrors);
    for (const evidenceId of claim.evidenceIds) {
      const record = records.find((item) => item.id === evidenceId);
      if (!record || !record.supportedClaims.includes(claim.claimId)) schemaErrors.push(claim.claimId + ': evidence relationship is not reciprocal for ' + evidenceId);
    }
  }
  if (schemaErrors.length) throw new Error('Microsoft 365 catalog contract validation failed:\n' + [...new Set(schemaErrors)].sort().join('\n'));

  function duplicateGroupsFor(integrityField, eligible) {
    const groups = new Map();
    for (const record of records.filter(eligible)) {
      const integrity = record[integrityField];
      if (!integrity) continue;
      if (!groups.has(integrity.hash)) groups.set(integrity.hash, []);
      groups.get(integrity.hash).push(record.id);
    }
    return [...groups.entries()]
      .filter((entry) => entry[1].length > 1)
      .map((entry) => ({algorithm: 'sha256', hash: entry[0], count: entry[1].length, evidenceIds: entry[1].sort()}))
      .sort((a, b) => b.count - a.count || a.hash.localeCompare(b.hash));
  }
  const sourceDuplicateGroups = duplicateGroupsFor('sourceIntegrity', () => true);
  const publicDuplicateGroups = duplicateGroupsFor('publicIntegrity', (record) => Boolean(record.publicRoute));
  const reviewSummary = {
    artifactsReviewed: records.length,
    textArtifactsInspected: records.filter((record) => !record.sensitiveDataReview.manualReviewRequired).length,
    manualReviewRequired: records.filter((record) => record.sensitiveDataReview.manualReviewRequired).length,
    highSeveritySecretFindings: records.reduce((sum, record) => sum + record.sensitiveDataReview.highSeverityFindings, 0),
    identifierFindings: records.reduce((sum, record) => sum + record.sensitiveDataReview.identifierFindings, 0),
    unresolvedPublicIdentifierFindings: 0
  };

  const summary = {
    schemaVersion: 2,
    phase: config.phase,
    generatedFrom: {
      currentPortfolio: config.sources.currentPortfolio,
      preservedSharePoint: config.sources.preservedSharePoint,
      sourceManifest: 'content/microsoft-365/source-manifest.json',
      sensitiveDataExceptions: 'content/microsoft-365/sensitive-data-exceptions.json'
    },
    totals: {
      artifacts: records.length,
      preservedSharePointArtifacts: sharePointRows.length,
      sourceDuplicateGroups: sourceDuplicateGroups.length,
      publicDuplicateGroups: publicDuplicateGroups.length,
      sensitiveDataReview: reviewSummary
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
      evidenceIds: [...new Set(technology.evidenceIds)].sort()
    })),
    claimRelationships,
    boundaries: config.boundaries,
    records
  };

  const matrixHeader = ['evidence_id','source_repository','source_commit','source_path','public_path','wrapper_path','source_sha256','source_size','public_sha256','public_size','evidence_type','primary_technology','technology_relationships','logical_destination','publication_classification','supported_claims','collection_context'];
  const matrix = [matrixHeader.join(','), ...records.map((record) => [
    record.id, record.sourceRepository, record.sourceCommit, record.sourcePath, record.publicPath, record.wrapperPath,
    record.sourceIntegrity.hash, record.sourceIntegrity.size,
    record.publicIntegrity ? record.publicIntegrity.hash : '', record.publicIntegrity ? record.publicIntegrity.size : '',
    record.evidenceType, record.technology, record.technologyRelationships.join('|'), record.logicalDestination,
    record.publicationClassification, record.supportedClaims.join('|'), record.collectionContext
  ].map(csvCell).join(','))].join('\n') + '\n';

  const technologyCards = [...technologyMap.values()].map((technology) => {
    const capability = technologyBySlug.get(technology.slug);
    return [
      '<article class="capability-card" id="' + escapeHtml(technology.slug) + '">',
      '<span class="tile-code">' + escapeHtml(String(new Set(technology.evidenceIds).size)) + '</span>',
      '<h2>' + escapeHtml(technology.label) + '</h2>',
      '<dl class="claim-details"><div><dt>Skill</dt><dd>' + escapeHtml(capability.skill) + '</dd></div><div><dt>Task</dt><dd>' + escapeHtml(capability.task) + '</dd></div><div><dt>Result</dt><dd>' + escapeHtml(capability.result) + '</dd></div></dl>',
      '<p><strong>Supporting claim:</strong> ' + escapeHtml(technology.claim) + '</p>',
      '<div class="proof-links"><a href="/assets/data/m365-evidence-catalog.json">Inspect supporting catalog records</a></div>',
      '<dl class="claim-details"><div><dt>Scope</dt><dd>' + escapeHtml(capability.scope) + '</dd></div><div><dt>Limitations</dt><dd>' + escapeHtml(capability.limitations) + '</dd></div><div><dt>Support level</dt><dd>' + escapeHtml(technology.supportLevel) + '</dd></div></dl>',
      '</article>'
    ].join('');
  }).join('');
  const catalogTitle = 'Microsoft 365 Evidence Catalog | Jeremy Fontenot';
  const catalogDescription = 'Technology-first catalog of Microsoft 365, Entra, SharePoint, Exchange, Intune, Teams, application, security, and automation evidence with provenance and limitations.';
  const reviewWording = 'No high-severity secret patterns were detected. ' + reviewSummary.identifierFindings + ' identifier findings were reviewed through explicit exceptions or kept outside the public build. ' + reviewSummary.manualReviewRequired + ' binary artifacts remain subject to documented manual-review limitations; OCR was not used.';
  const catalogHtml = [
    '<!doctype html>',
    '<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>' + catalogTitle + '</title><meta name="description" content="' + escapeHtml(catalogDescription) + '"><meta name="robots" content="index, follow">',
    '<link rel="canonical" href="https://jeremyfontenot.online/microsoft-365/evidence-catalog.html">',
    '<meta property="og:title" content="' + escapeHtml(catalogTitle) + '"><meta property="og:description" content="' + escapeHtml(catalogDescription) + '">',
    '<link rel="icon" href="/assets/logos/favicon_64x64.png"><link rel="stylesheet" href="/assets/css/site.css"><script src="/assets/js/site.js" defer></script></head>',
    '<body class="foundation-page microsoft-365-page"><!-- GENERATED FILE — DO NOT EDIT DIRECTLY. --><a class="skip-link" href="#main">Skip to content</a>',
    '<header class="site-header"><nav class="nav" aria-label="Primary navigation"><a class="brand" href="/"><img src="/assets/logos/header_logo_88x88.png" alt="Jeremy Fontenot logo" width="44" height="44"><span>Jeremy Fontenot</span><small>Support · systems · evidence</small></a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu">Menu</button><div class="nav-links" id="primary-menu"><a href="/">Home</a><a href="/systems-administration.html">Readiness</a><a href="/systems-skills/">Skills</a><a href="/microsoft-365/" aria-current="page">Microsoft 365</a><a href="/evidence/">Evidence</a><a href="/resume.html">Resume</a><a href="/contact.html">Contact</a></div></nav></header>',
    '<main id="main"><section class="page page-hero"><div class="section-head reveal is-visible"><p class="eyebrow">Microsoft 365 evidence organization</p><h1>Technology-first proof with preserved source paths.</h1><p class="lead">' + summary.totals.artifacts + ' physical artifacts are cataloged across personal-tenant administration, identity, security, applications, Exchange, Intune, SharePoint, Teams, and automation. Review the demonstrated capability, task, result, proof, scope, and limitation before opening raw artifacts.</p><div class="actions"><a class="button primary" href="#capabilities">Review demonstrated capabilities</a><a class="button text-button" href="/microsoft-365/">Return to Microsoft 365 overview</a></div></div></section>',
    '<section class="section" id="capabilities"><div class="section-head reveal"><p class="eyebrow">Capability context</p><h2>Skill, task, result, proof, scope, and limitations remain connected.</h2><p>The organization is logical rather than destructive: every record points from one physical source to one unique destination and one or more reciprocal supported claims.</p></div><div class="capability-grid reveal">' + technologyCards + '</div></section>',
    '<section class="section"><div class="section-head reveal"><p class="eyebrow">Evidence contract downloads</p><h2>Inspect the complete generated contract after reviewing capability context.</h2><p>These machine-readable outputs preserve every physical record, unique logical destination, retained duplicate relationship, and sensitive-data review status.</p></div><div class="actions"><a class="button primary" href="/assets/data/m365-evidence-catalog.json">Open complete JSON catalog</a><a class="button" href="/microsoft-365/source-to-destination-matrix.csv">Open source matrix</a><a class="button text-button" href="/microsoft-365/duplicate-groups.json">Review retained duplicates</a></div></section>',
    '<section class="section"><div class="scope-note-card reveal"><p class="eyebrow">Integrity and review boundaries</p><h2>Source and publication integrity are reported separately.</h2><p>' + escapeHtml(reviewWording) + ' Exact duplicate groups are calculated separately for original-source bytes and linked public bytes; every copy remains retained.</p><div class="inline-actions"><a href="/microsoft-365/sensitive-data-review.json">Open sensitive-data review</a><a href="/evidence-library/preserved-sharepoint/index.html">Browse preserved SharePoint derivatives</a></div></div></section></main>',
    '<footer class="site-footer"><p class="footer-meta">Jeremy Fontenot · Abbeville, Louisiana · Central Time</p></footer></body></html>',
    ''
  ].join('\n');

  const curated = sharePointRows
    .map((item) => ({...item, score: technologyRules.reduce((score, rule) => score + (rule[1].test(normalizeForTechnologyMatching(item.title + ' ' + item.excerpt)) ? 1 : 0), 0)}))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title) || a.site_rel.localeCompare(b.site_rel))
    .slice(0, 36);
  const curatedCards = curated.map((item) => '<article class="capability-card"><span class="tile-code">' + escapeHtml(item.category || 'source') + '</span><h2>' + escapeHtml(item.title || path.basename(item.source_rel)) + '</h2><p>' + escapeHtml(item.excerpt || 'Preserved source export.') + '</p><div class="proof-links"><a href="/' + escapeHtml(wrapperPathFor(item.source_rel)) + '">Review evidence context</a><a href="/' + escapeHtml(item.site_rel) + '">Open exact public derivative</a></div></article>').join('');
  const sharePointTitle = 'Preserved SharePoint Exports | Jeremy Fontenot';
  const sharePointDescription = 'Indexed public derivatives of preserved SharePoint and Microsoft 365 personal-lab documentation exports with separately attested source integrity.';
  const preservedIndexHtml = [
    '<!doctype html>',
    '<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>' + sharePointTitle + '</title><meta name="description" content="' + escapeHtml(sharePointDescription) + '"><meta name="robots" content="index, follow">',
    '<link rel="canonical" href="https://jeremyfontenot.online/evidence-library/preserved-sharepoint/index.html">',
    '<meta property="og:title" content="' + escapeHtml(sharePointTitle) + '"><meta property="og:description" content="' + escapeHtml(sharePointDescription) + '">',
    '<link rel="icon" href="/assets/logos/favicon_64x64.png"><link rel="stylesheet" href="/assets/css/site.css"><script src="/assets/js/site.js" defer></script></head>',
    '<body class="foundation-page sharepoint-page"><!-- GENERATED FILE — DO NOT EDIT DIRECTLY. --><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><nav class="nav" aria-label="Primary navigation"><a class="brand" href="/"><img src="/assets/logos/header_logo_88x88.png" alt="Jeremy Fontenot logo" width="44" height="44"><span>Jeremy Fontenot</span><small>Support · systems · evidence</small></a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu">Menu</button><div class="nav-links" id="primary-menu"><a href="/">Home</a><a href="/microsoft-365/">Microsoft 365</a><a href="/microsoft-365/evidence-catalog.html">Evidence catalog</a><a href="/evidence/">Evidence</a><a href="/resume.html">Resume</a><a href="/contact.html">Contact</a></div></nav></header>',
    '<main id="main"><section class="page page-hero"><div class="section-head reveal is-visible"><p class="eyebrow">Preserved Microsoft 365 documentation</p><h1>Public SharePoint derivatives with separately attested source integrity.</h1><p class="lead">' + sharePointRows.length + ' presentation or sanitization derivatives remain available at their established public paths. Original source sizes and SHA-256 values are attested by the reviewed inventory; linked public sizes and hashes are calculated from the files served here.</p><div class="actions"><a class="button primary" href="/microsoft-365/evidence-catalog.html#sharepoint">Open SharePoint catalog</a><a class="button" href="/evidence-library/preserved-sharepoint/sharepoint-export-inventory.csv">Open source attestation inventory</a></div></div></section>',
    '<section class="section"><div class="section-head reveal"><p class="eyebrow">Curated derivative review</p><h2>Representative pages selected through deterministic technology relevance.</h2><p>The complete collection remains discoverable through generated wrappers, the inventory, and the JSON catalog. Public derivatives are not described as byte-preserved or as live SharePoint resources.</p></div><div class="capability-grid reveal">' + curatedCards + '</div><p><a href="/evidence-library/preserved-sharepoint/link-integrity.html">Review collection-wide link-integrity classification</a></p></section></main>',
    '<footer class="site-footer"><p class="footer-meta">Personal-lab documentation · Offline public derivatives</p></footer></body></html>',
    ''
  ].join('\n');

  const sensitiveReport = {
    schemaVersion: 1,
    policy: {
      highSeveritySecretMaterial: 'build-failing',
      publicIdentifiers: 'reviewed exception required',
      binaryInspection: 'manual review required; OCR not used',
      valuesInReport: 'redacted; stable fingerprints only'
    },
    summary: reviewSummary,
    reviewedExceptions: exceptionManifest.exceptions.map(({pattern, valueFingerprints, ...reviewedException}) => reviewedException),
    artifacts: reviewEntries.sort((a, b) => a.path.localeCompare(b.path))
  };
  const duplicateReport = {
    schemaVersion: 2,
    note: 'Original-source and published-byte duplicate groups are calculated independently. No files are removed.',
    sourceGroups: sourceDuplicateGroups,
    publicGroups: publicDuplicateGroups
  };

  const outputs = new Map();
  outputs.set('assets/data/m365-evidence-catalog.json', JSON.stringify(summary, null, 2) + '\n');
  outputs.set('microsoft-365/evidence-catalog.html', catalogHtml);
  outputs.set('microsoft-365/source-to-destination-matrix.csv', matrix);
  outputs.set('microsoft-365/duplicate-groups.json', JSON.stringify(duplicateReport, null, 2) + '\n');
  outputs.set('microsoft-365/sensitive-data-review.json', JSON.stringify(sensitiveReport, null, 2) + '\n');
  outputs.set('evidence-library/preserved-sharepoint/index.html', preservedIndexHtml);
  for (const [wrapperPath, wrapperHtml] of sharePointWrappers) outputs.set(wrapperPath, wrapperHtml);
  outputs.set('evidence-library/preserved-sharepoint/link-integrity.html', renderLinkIntegrityPage(sharePointLinkStatus, sharePointCompatibilityRoutes));
  const wrapperSitemapRoutes = [...sharePointWrappers.keys(), 'evidence-library/preserved-sharepoint/link-integrity.html'].sort();
  outputs.set('sitemap.xml', sitemapWithWrapperRoutes(fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8'), wrapperSitemapRoutes));

  const generatedHashes = {
    schemaVersion: 1,
    algorithm: 'sha256',
    outputs: [...outputs.entries()].map((entry) => ({
      path: entry[0],
      size: Buffer.byteLength(entry[1], 'utf8'),
      hash: sha256(Buffer.from(entry[1], 'utf8')),
      metadataCoverage: entry[0].endsWith('.html') ? ['integrity', 'seo'] : ['integrity']
    }))
  };
  outputs.set('content/microsoft-365/generated-output-hashes.json', JSON.stringify(generatedHashes, null, 2) + '\n');

  const integrityPath = 'evidence-library/integrity/evidence-hashes.json';
  const integrityRecords = JSON.parse(fs.readFileSync(path.join(root, integrityPath), 'utf8'));
  const generatedIndexPath = 'evidence-library\\preserved-sharepoint\\index.html';
  const integrityRecord = integrityRecords.find((item) => item.path === generatedIndexPath);
  if (!integrityRecord) throw new Error('Integrity record is missing: ' + generatedIndexPath);
  const generatedIndexBuffer = Buffer.from(outputs.get('evidence-library/preserved-sharepoint/index.html'), 'utf8');
  integrityRecord.sha256 = sha256(generatedIndexBuffer).toUpperCase();
  integrityRecord.size = generatedIndexBuffer.length;
  delete integrityRecord.lastModified;
  outputs.set(integrityPath, JSON.stringify(integrityRecords, null, 2) + '\n');

  return {outputs, summary};
}

function main() {
  const checkMode = process.argv.includes('--check');
  try {
    const result = build();
    let failed = false;
    for (const [relativePath, content] of result.outputs) {
      const absolute = path.join(root, relativePath);
      if (checkMode) {
        if (!fs.existsSync(absolute) || fs.readFileSync(absolute, 'utf8') !== content) {
          console.error('Microsoft 365 generated output drift: ' + relativePath);
          failed = true;
        }
      } else {
        fs.mkdirSync(path.dirname(absolute), {recursive: true});
        fs.writeFileSync(absolute, content, 'utf8');
      }
    }
    if (failed) process.exit(1);
    console.log('Microsoft 365 evidence organization ' + (checkMode ? 'check' : 'generation') + ' passed: ' + result.summary.totals.artifacts + ' artifacts.');
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = {
  build,
  evidenceType,
  normalizeForTechnologyMatching,
  reviewArtifact,
  scanText,
  discoverSourceFiles,
  discoverCandidateFiles,
  listTrackedFiles,
  technologiesFor,
  logicalDestination,
  validateEvidenceRecord,
  validateExceptionManifest
};
