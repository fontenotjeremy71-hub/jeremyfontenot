#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');
const checkMode = process.argv.includes('--check');
const config = JSON.parse(fs.readFileSync(path.join(root, 'content/microsoft-365/organization.json'), 'utf8'));
const taxonomy = JSON.parse(fs.readFileSync(path.join(root, 'content/microsoft-365/technologies.json'), 'utf8'));
const technologyBySlug = new Map(taxonomy.technologies.map((item) => [item.slug, item]));
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath));
}

function readText(relativePath) {
  return read(relativePath).toString('utf8');
}

function normalizePath(value) {
  return String(value || '').replaceAll('\\', '/').replace(/^\.\//, '');
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(header).update(buffer).digest('hex');
}

function stableId(value) {
  return `m365-${crypto.createHash('sha256').update(value).digest('hex').slice(0, 16)}`;
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
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  const [header, ...data] = rows.filter((item) => item.some((value) => value !== ''));
  return data.map((values) => Object.fromEntries(header.map((name, index) => [name, values[index] ?? ''])));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join('|') : String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function cleanDisplayTitle(value) {
  return String(value || '')
    .replace(/\.(?:csv|json|md|txt|png|jpe?g|html?|ps1)$/i, '')
    .replace(/[-_](?:19|20)\d{6,12}(?:[-_][a-f0-9]{6,})?/gi, '')
    .replace(/[-_](?:19|20)\d{2}[-_]\d{2}[-_]\d{2}/g, '')
    .replace(/[-_][a-f0-9]{8}$/i, '')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function classifyEvidenceType(publicPath) {
  const lower = publicPath.toLowerCase();
  const ext = path.extname(lower);
  if (lower.includes('manifest') || lower.includes('hash')) return 'manifests';
  if (lower.includes('inventory')) return 'inventories';
  if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.webp') return 'screenshots';
  if (lower.includes('transcript') || lower.includes('script-output')) return 'scripts-output';
  if (lower.includes('error') || lower.includes('attempt') || lower.includes('limitation')) return 'validation';
  if (ext === '.ps1') return 'scripts';
  if (ext === '.md' || lower.endsWith('/readme.md') || ext === '.html') return 'documentation';
  if (ext === '.csv' || ext === '.json') return 'exports';
  return 'documentation';
}

function classifyCoreTechnologies(publicPath) {
  const lower = publicPath.toLowerCase();
  const values = new Set();
  if (/exchange|mailbox|mail-enabled|transport-rule/.test(lower)) values.add('exchange-online');
  if (/intune|managed-device|endpoint/.test(lower)) values.add('intune');
  if (/application|app-registration|enterprise-app|service-principal|oauth|permission-grant/.test(lower)) values.add('applications');
  if (/conditional-access|named-location|authentication-method|authorization-policy|security-default|legacy-auth|security-proof/.test(lower)) values.add('security-compliance');
  if (/directory-role|group-membership|entra-group|entra-user|sign-in|signin|directory-audit|entra-device|directory-device/.test(lower)) values.add('entra-id');
  if (/tenant|domain|license|sku|organization|admin-center|active-users/.test(lower)) values.add('tenant-administration');
  if (/teams|collaboration/.test(lower)) values.add('teams');
  if (/transcript|powershell|graph|automation|proof-hash|proof-inventory|proof-map/.test(lower)) values.add('automation');
  if (values.size === 0) values.add('tenant-administration');
  return [...values];
}

function classifySharePointTechnologies(row) {
  const text = `${row.title} ${row.source_rel} ${row.category} ${row.excerpt}`.toLowerCase();
  const values = new Set(['sharepoint']);
  if (/tenant|domain|license|admin center|active users|microsoft 365|m365/.test(text)) values.add('tenant-administration');
  if (/entra|identity|directory role|users|groups|membership|mfa/.test(text)) values.add('entra-id');
  if (/intune|endpoint|device compliance|managed device/.test(text)) values.add('intune');
  if (/exchange|mailbox|mail flow|transport rule|exo/.test(text)) values.add('exchange-online');
  if (/teams|channel|collaboration/.test(text)) values.add('teams');
  if (/conditional access|security|authentication|authorization|compliance|baseline|legacy auth/.test(text)) values.add('security-compliance');
  if (/application|app registration|enterprise app|service principal|oauth|consent/.test(text)) values.add('applications');
  if (/script|automation|powershell|graph|workflow/.test(text)) values.add('automation');
  return [...values];
}

function publicationClassification(publicPath) {
  return /sanitized|redacted/i.test(publicPath) ? 'sanitized-derivative' : 'public-original';
}

function preservationState(classification) {
  return classification === 'sanitized-derivative' ? 'sanitized-public-derivative' : 'byte-preserved-public-artifact';
}

function technologyFields(slugs) {
  const primary = technologyBySlug.get(slugs[0]) || technologyBySlug.get('tenant-administration');
  const claimIds = [...new Set(slugs.flatMap((slug) => config.technologies[slug]?.claimIds || []))];
  return {
    supportedClaims: claimIds,
    skill: primary.skill,
    task: primary.task,
    result: primary.result,
    scope: primary.scope,
    limitations: primary.limitations
  };
}

function readGitObject(commit, sourcePath, context) {
  const objectSpec = `${commit}:${normalizePath(sourcePath)}`;
  try {
    return execFileSync('git', ['show', objectSpec], {
      cwd: root,
      encoding: null,
      maxBuffer: 256 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe']
    });
  } catch {
    failures.push(`${context}: source object is unavailable at ${objectSpec}`);
    return null;
  }
}

function verifyCurrentSourceCommit(publicPath, currentBuffer, context) {
  const source = readGitObject(config.sourceSnapshots.currentRepository.commit, publicPath, context);
  if (!source) return;
  if (!source.equals(currentBuffer)) failures.push(`${context}: current file differs from the recorded source commit for ${publicPath}`);
}

function verifyFile(publicPath, expectedHash, context, verifyRecordedCommit = false) {
  const absolute = path.join(root, publicPath);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    failures.push(`${context}: missing file ${publicPath}`);
    return {actualHash: null, sizeBytes: null, recordedHash: expectedHash ? expectedHash.toLowerCase() : null, recordedHashMatch: false};
  }
  const buffer = fs.readFileSync(absolute);
  if (verifyRecordedCommit) verifyCurrentSourceCommit(publicPath, buffer, context);
  const actualHash = sha256(buffer);
  const recordedHash = expectedHash ? expectedHash.toLowerCase() : null;
  return {
    actualHash,
    sizeBytes: buffer.length,
    recordedHash,
    recordedHashMatch: recordedHash ? actualHash.toLowerCase() === recordedHash : null
  };
}

const recordsByPath = new Map();
function addRecord(record) {
  const key = normalizePath(record.publicPath);
  if (recordsByPath.has(key)) {
    const existing = recordsByPath.get(key);
    existing.technologies = [...new Set([...existing.technologies, ...record.technologies])];
    existing.supportedClaims = [...new Set([...existing.supportedClaims, ...record.supportedClaims])];
    return;
  }
  recordsByPath.set(key, {...record, publicPath: key});
}

const coreHashRows = parseCsv(readText(config.sources.coreHashes));
for (const row of coreHashRows) {
  const publicPath = normalizePath(row.RelativePath);
  const verification = verifyFile(publicPath, row.SHA256, 'Core proof inventory', true);
  const technologies = classifyCoreTechnologies(publicPath);
  const classification = verification.recordedHashMatch === false ? 'sanitized-derivative' : publicationClassification(publicPath);
  addRecord({
    id: stableId(publicPath),
    title: cleanDisplayTitle(row.FileName),
    technologies,
    evidenceType: classifyEvidenceType(publicPath),
    evidenceSet: 'core-proof',
    sourceRepository: config.sourceSnapshots.currentRepository.repository,
    sourceCommit: config.sourceSnapshots.currentRepository.commit,
    sourcePath: publicPath,
    sourceVerificationMethod: 'direct-git-object',
    collectionContext: 'Captured Microsoft 365 and Entra proof artifact preserved in the public portfolio evidence set.',
    hashAlgorithm: 'sha256',
    hash: (verification.actualHash || row.SHA256).toLowerCase(),
    recordedSourceHash: verification.recordedHash,
    recordedSourceHashMatch: verification.recordedHashMatch,
    sizeBytes: verification.sizeBytes,
    ...technologyFields(technologies),
    publicationClassification: classification,
    preservationState: preservationState(classification),
    publicRoute: `/${publicPath}`
  });
}

const manifestRows = parseCsv(readText(config.sources.consolidatedManifest));
for (const row of manifestRows) {
  const publicPath = normalizePath(row.RelativePath);
  const isSelf = publicPath === normalizePath(config.sources.consolidatedManifest);
  const verification = verifyFile(publicPath, isSelf ? null : row.SHA256, 'Consolidated export manifest', true);
  const technologies = classifyCoreTechnologies(publicPath);
  const classification = verification.recordedHashMatch === false ? 'sanitized-derivative' : publicationClassification(publicPath);
  addRecord({
    id: stableId(publicPath),
    title: cleanDisplayTitle(row.FileName),
    technologies,
    evidenceType: classifyEvidenceType(publicPath),
    evidenceSet: 'consolidated-export',
    sourceRepository: config.sourceSnapshots.currentRepository.repository,
    sourceCommit: config.sourceSnapshots.currentRepository.commit,
    sourcePath: publicPath,
    sourceVerificationMethod: 'direct-git-object',
    collectionContext: 'Reviewed consolidated Microsoft 365 and Entra export or portal artifact from the personal tenant evidence collection.',
    hashAlgorithm: 'sha256',
    hash: (verification.actualHash || row.SHA256).toLowerCase(),
    recordedSourceHash: verification.recordedHash,
    recordedSourceHashMatch: verification.recordedHashMatch,
    sizeBytes: verification.sizeBytes,
    ...technologyFields(technologies),
    publicationClassification: classification,
    preservationState: preservationState(classification),
    publicRoute: `/${publicPath}`
  });
}

const sharePointRows = parseCsv(readText(config.sources.sharepointInventory));
for (const row of sharePointRows) {
  const publicPath = normalizePath(row.site_rel);
  const verification = verifyFile(publicPath, row.sha256, 'Preserved SharePoint inventory');
  const technologies = classifySharePointTechnologies(row);
  const classification = verification.recordedHashMatch ? 'public-original' : 'sanitized-derivative';
  addRecord({
    id: stableId(`${config.sourceSnapshots.originalRepository.repository}:${row.source_rel}`),
    title: row.title || path.basename(publicPath),
    technologies,
    evidenceType: 'exports',
    evidenceSet: 'preserved-sharepoint',
    sourceRepository: config.sourceSnapshots.originalRepository.repository,
    sourceCommit: config.sourceSnapshots.originalRepository.commit,
    sourcePath: normalizePath(row.source_rel),
    sourceVerificationMethod: 'manifest-attested-source',
    attestationPath: config.sources.sharepointInventory,
    collectionContext: 'Preserved SharePoint-based documentation export indexed by original path, public path, file size, SHA-256, and safe catalog metadata.',
    hashAlgorithm: 'sha256',
    hash: (verification.actualHash || row.sha256).toLowerCase(),
    recordedSourceHash: verification.recordedHash,
    recordedSourceHashMatch: verification.recordedHashMatch,
    sizeBytes: verification.sizeBytes ?? Number(row.size || 0),
    ...technologyFields(technologies),
    publicationClassification: classification,
    preservationState: verification.recordedHashMatch ? 'byte-preserved-from-original-inventory' : 'public-derivative-compared-to-original-inventory',
    publicRoute: `/${publicPath}`
  });
}

for (const item of config.supplementalArtifacts) {
  const publicPath = normalizePath(item.path);
  const verification = verifyFile(publicPath, null, 'Supplemental Microsoft 365 artifact', true);
  const classification = publicationClassification(publicPath);
  addRecord({
    id: stableId(publicPath),
    title: item.title,
    technologies: item.technologies,
    evidenceType: item.evidenceType,
    evidenceSet: 'control-document',
    sourceRepository: config.sourceSnapshots.currentRepository.repository,
    sourceCommit: config.sourceSnapshots.currentRepository.commit,
    sourcePath: publicPath,
    sourceVerificationMethod: 'direct-git-object',
    collectionContext: 'Repository control record used to inventory, hash, explain, or constrain Microsoft 365 evidence claims.',
    hashAlgorithm: 'sha256',
    hash: verification.actualHash,
    sizeBytes: verification.sizeBytes,
    ...technologyFields(item.technologies),
    publicationClassification: classification,
    preservationState: preservationState(classification),
    publicRoute: `/${publicPath}`
  });
}

const records = [...recordsByPath.values()].sort((a, b) => a.publicPath.localeCompare(b.publicPath));
const hashGroups = new Map();
for (const record of records) {
  if (!record.hash) continue;
  const list = hashGroups.get(record.hash) || [];
  list.push(record);
  hashGroups.set(record.hash, list);
}
const duplicateGroups = [...hashGroups.entries()]
  .filter(([, items]) => items.length > 1)
  .map(([hash, items]) => ({
    sha256: hash,
    count: items.length,
    paths: items.map((item) => item.publicPath).sort(),
    retained: true
  }))
  .sort((a, b) => b.count - a.count || a.sha256.localeCompare(b.sha256));

const countsByTechnology = Object.fromEntries(Object.keys(config.technologies).map((slug) => [slug, records.filter((record) => record.technologies.includes(slug)).length]));
const countsByEvidenceType = {};
const countsByEvidenceSet = {};
for (const record of records) {
  countsByEvidenceType[record.evidenceType] = (countsByEvidenceType[record.evidenceType] || 0) + 1;
  countsByEvidenceSet[record.evidenceSet] = (countsByEvidenceSet[record.evidenceSet] || 0) + 1;
}

const comparison = config.originalComparison.map((item) => {
  const buffer = read(item.path);
  const currentGitBlobSha = gitBlobSha(buffer);
  return {
    path: item.path,
    originalRepository: config.sourceSnapshots.originalRepository.repository,
    originalCommit: config.sourceSnapshots.originalRepository.commit,
    originalGitBlobSha: item.originalGitBlobSha,
    currentGitBlobSha,
    exactGitBlobMatch: currentGitBlobSha === item.originalGitBlobSha
  };
});
if (comparison.some((item) => !item.exactGitBlobMatch)) failures.push('One or more recorded cross-repository comparison files no longer match the reviewed original Git blob.');

const catalog = {
  schemaVersion: 1,
  phase: config.phase,
  generatedFrom: {
    currentRepository: config.sourceSnapshots.currentRepository,
    originalRepository: config.sourceSnapshots.originalRepository,
    sourceFiles: config.sources
  },
  totals: {
    uniqueArtifacts: records.length,
    sharepointArtifacts: sharePointRows.length,
    coreProofArtifacts: coreHashRows.length,
    consolidatedManifestRows: manifestRows.length,
    duplicateGroups: duplicateGroups.length,
    retainedDuplicatePaths: duplicateGroups.reduce((sum, group) => sum + group.count, 0)
  },
  countsByTechnology,
  countsByEvidenceType,
  countsByEvidenceSet,
  claims: config.claims,
  records
};

const preservationReport = {
  schemaVersion: 1,
  phase: config.phase,
  sourceComparison: comparison,
  sharepointPreservation: {
    originalInventoryGitBlobMatch: comparison.find((item) => item.path === config.sources.sharepointInventory)?.exactGitBlobMatch === true,
    inventoryRows: sharePointRows.length,
    filesComparedWithInventory: sharePointRows.length,
    hashMatches: records.filter((item) => item.evidenceSet === 'preserved-sharepoint' && item.recordedSourceHashMatch === true).length,
    hashMismatches: records.filter((item) => item.evidenceSet === 'preserved-sharepoint' && item.recordedSourceHashMatch === false).length,
    missingFiles: failures.filter((item) => item.startsWith('Preserved SharePoint inventory') && item.includes('missing file')).length,
    collectionStatus: records.some((item) => item.evidenceSet === 'preserved-sharepoint' && item.recordedSourceHashMatch === false) ? 'present-with-byte-differences' : 'byte-match-to-recorded-inventory',
    boundary: 'The inventory file is an exact Git-blob match to the reviewed original repository. Current public files are compared with the SHA-256 values in that inventory. Mismatches are disclosed as public derivatives; the build does not fetch every original repository byte.'
  },
  duplicateHandling: {
    groups: duplicateGroups.length,
    removalAuthorized: false,
    action: 'All exact-match paths are retained and listed for owner review.'
  },
  sensitiveDataReview: {
    newRawArtifactsImported: 0,
    existingEvidenceMovedOrRenamed: 0,
    catalogPublishesExcerpts: false,
    catalogPublishesTenantIdsOrUserPrincipalNames: false,
    publicationApproach: 'The phase adds metadata, relationships, generated navigation, and integrity reports around already-public evidence. It does not publish new raw tenant exports.'
  },
  routeCompatibility: {
    oldRoutesRemoved: 0,
    preservedSharepointRoute: '/evidence-library/preserved-sharepoint/index.html',
    microsoft365ProofMapRoute: '/evidence-library/projects/microsoft-365-lab/m365-entra-site-proof-map-20260605.html'
  }
};

function navigation(current) {
  const links = [
    ['home', 'Home', '/'],
    ['readiness', 'Readiness', '/systems-administration.html'],
    ['skills', 'Skills', '/systems-skills/'],
    ['m365', 'Microsoft 365', '/microsoft-365/'],
    ['home-lab', 'Home Lab', '/home-lab/'],
    ['evidence', 'Evidence', '/evidence/'],
    ['resume', 'Resume', '/resume.html'],
    ['contact', 'Contact', '/contact.html']
  ];
  return links.map(([id, label, href]) => `<a href="${href}"${id === current ? ' aria-current="page"' : ''}>${label}</a>`).join('');
}

function pageShell({title, description, canonicalPath, eyebrow, heading, lead, body, current = 'm365'}) {
  const canonical = `https://jeremyfontenot.online${canonicalPath}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | Jeremy Fontenot</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#0f172a">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <link rel="canonical" href="${canonical}">
  <meta property="og:site_name" content="Jeremy Fontenot">
  <meta property="og:title" content="${escapeHtml(title)} | Jeremy Fontenot">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://jeremyfontenot.online/assets/og/og-portfolio.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/logos/favicon_64x64.png">
  <link rel="stylesheet" href="/assets/css/site.css">
  <link rel="stylesheet" href="/assets/css/m365-organization.css">
  <script src="/assets/js/site.js" defer></script>
  <script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage',name:title,description,url:canonical})}</script>
</head>
<body class="m365-organization-page">
  <!-- GENERATED FILE — DO NOT EDIT DIRECTLY. -->
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><nav class="nav" aria-label="Primary navigation"><a class="brand" href="/"><img src="/assets/logos/header_logo_88x88.png" alt="Jeremy Fontenot logo" width="44" height="44" decoding="async"><span>Jeremy Fontenot</span><small>Support · systems · evidence</small></a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu">Menu</button><div class="nav-links" id="primary-menu">${navigation(current)}</div></nav></header>
  <main id="main">
    <section class="page page-hero m365-hero" aria-labelledby="page-title"><div class="section-head reveal is-visible"><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1 id="page-title">${escapeHtml(heading)}</h1><p class="lead">${escapeHtml(lead)}</p></div></section>
    ${body}
  </main>
  <footer class="site-footer"><div class="compact-footer-grid"><div class="compact-footer-brand"><img src="/assets/logos/header_logo_88x88.png" alt="" width="44" height="44"><div><strong>Jeremy Fontenot</strong><p>Experienced IT support professional with demonstrated junior systems administration capability.</p></div></div><nav class="compact-footer-links" aria-label="Microsoft 365 routes"><a href="/microsoft-365/">Microsoft 365</a><a href="/microsoft-365/evidence-catalog/">Evidence catalog</a><a href="/microsoft-365/preservation/">Preservation</a><a href="/evidence/">Evidence architecture</a></nav><div class="compact-footer-contact"><a href="/resume.html">Resume</a><a href="/contact.html">Contact</a></div></div><p class="footer-meta">Jeremy Fontenot · Personal Microsoft 365 lab · Explicit scope boundaries</p></footer>
</body>
</html>
`;
}

function evidenceLink(record) {
  return `<li><a href="${escapeHtml(record.publicRoute)}">${escapeHtml(record.title)}</a><span>${escapeHtml(record.evidenceType)} · ${escapeHtml(record.publicationClassification)}</span></li>`;
}

function technologyPage(slug) {
  const technology = technologyBySlug.get(slug);
  const organization = config.technologies[slug];
  const related = records.filter((record) => record.technologies.includes(slug));
  const featured = organization.featuredProofs.map((route) => records.find((record) => record.publicRoute === route)).filter(Boolean);
  const representatives = [...featured, ...related.filter((record) => !featured.includes(record))].slice(0, 18);
  const typeCounts = {};
  const setCounts = {};
  for (const record of related) {
    typeCounts[record.evidenceType] = (typeCounts[record.evidenceType] || 0) + 1;
    setCounts[record.evidenceSet] = (setCounts[record.evidenceSet] || 0) + 1;
  }
  const claimCards = organization.claimIds.map((claimId) => {
    const claim = config.claims[claimId];
    return `<article><span>${escapeHtml(claim.supportLevel.replaceAll('-', ' '))}</span><h3>${escapeHtml(claim.claimText)}</h3><p>${escapeHtml(claim.scope)}</p><p><strong>Boundary:</strong> ${escapeHtml(claim.limitations)}</p></article>`;
  }).join('');
  const body = `
    <nav class="section-jump-nav page-shell" aria-label="Page sections"><a href="#capability">Capability</a><a href="#claims">Claims</a><a href="#evidence-sets">Evidence sets</a><a href="#representative-proof">Representative proof</a><a href="#scope">Scope</a></nav>
    <section class="section" id="capability" aria-labelledby="capability-title"><div class="m365-capability-grid"><article class="scope-note-card reveal"><p class="eyebrow">Demonstrated capability</p><h2 id="capability-title">${escapeHtml(technology.skill)}</h2><dl class="claim-details"><div><dt>Task</dt><dd>${escapeHtml(technology.task)}</dd></div><div><dt>Result</dt><dd>${escapeHtml(technology.result)}</dd></div><div><dt>Job relevance</dt><dd>${escapeHtml(organization.jobRelevance)}</dd></div></dl></article><aside class="m365-metrics reveal" aria-label="Evidence totals"><div><strong>${related.length}</strong><span>Related artifacts</span></div><div><strong>${Object.keys(typeCounts).length}</strong><span>Evidence types</span></div><div><strong>${organization.claimIds.length}</strong><span>Bounded claims</span></div></aside></div></section>
    <section class="section" id="claims" aria-labelledby="claims-title"><div class="section-head reveal"><p class="eyebrow">Bounded claims</p><h2 id="claims-title">Exact wording connected to this evidence.</h2><p>Support levels distinguish direct proof, limited support, and documentation-only material.</p></div><div class="m365-claim-grid reveal">${claimCards}</div></section>
    <section class="section" id="evidence-sets" aria-labelledby="sets-title"><div class="section-head reveal"><p class="eyebrow">Evidence sets</p><h2 id="sets-title">One artifact record, reusable technology relationships.</h2><p>Files remain at their established public paths. The catalog connects them to this technology without destructive moves or duplicate copies.</p></div><div class="m365-count-grid reveal">${Object.entries(setCounts).sort().map(([name, count]) => `<article><strong>${count}</strong><span>${escapeHtml(name.replaceAll('-', ' '))}</span></article>`).join('')}${Object.entries(typeCounts).sort().map(([name, count]) => `<article><strong>${count}</strong><span>${escapeHtml(name.replaceAll('-', ' '))}</span></article>`).join('')}</div></section>
    <section class="section" id="representative-proof" aria-labelledby="proof-title"><div class="section-head reveal"><p class="eyebrow">Representative proof</p><h2 id="proof-title">Review the evidence before using the claim.</h2><p>The complete machine-readable catalog remains available for full path, hash, provenance, classification, and relationship review.</p></div><ul class="m365-evidence-list reveal">${representatives.map(evidenceLink).join('')}</ul><div class="inline-actions"><a href="/microsoft-365/evidence-catalog/">Open the complete evidence catalog</a><a href="/assets/data/microsoft-365-evidence-catalog.json">Open catalog JSON</a></div></section>
    <section class="section" id="scope" aria-labelledby="scope-title"><div class="scope-note-card reveal"><p class="eyebrow">Scope and limitations</p><h2 id="scope-title">${escapeHtml(technology.scope)}</h2><p>${escapeHtml(technology.limitations)}</p><div class="inline-actions"><a href="/microsoft-365/">Back to Microsoft 365</a><a href="/evidence-library/projects/microsoft-365-lab/m365-entra-site-proof-map-20260605.html">Open claim boundaries</a></div></div></section>`;
  return pageShell({
    title: technology.label,
    description: `${technology.skill}: ${organization.jobRelevance}`,
    canonicalPath: `/microsoft-365/${slug}/`,
    eyebrow: 'Microsoft 365 technology evidence',
    heading: `${technology.label} capability, evidence, and boundaries.`,
    lead: `${technology.skill}. ${organization.jobRelevance}`,
    body
  });
}

function catalogPage() {
  const body = `
    <section class="section" aria-labelledby="catalog-summary"><div class="m365-metrics wide reveal"><div><strong>${records.length}</strong><span>Unique artifact paths</span></div><div><strong>${sharePointRows.length}</strong><span>Preserved SharePoint exports</span></div><div><strong>${duplicateGroups.length}</strong><span>Exact duplicate groups retained</span></div><div><strong>${Object.keys(countsByEvidenceType).length}</strong><span>Evidence types</span></div></div></section>
    <section class="section" id="catalog-summary" aria-labelledby="catalog-title"><div class="section-head reveal"><p class="eyebrow">Technology totals</p><h2 id="catalog-title">Every artifact remains discoverable through a technology relationship.</h2><p>Counts may overlap because one preserved artifact can support more than one technology. The artifact itself is stored once and remains at its established route.</p></div><div class="m365-technology-grid reveal">${Object.entries(countsByTechnology).map(([slug, count]) => `<a href="/microsoft-365/${slug}/"><strong>${count}</strong><span>${escapeHtml(technologyBySlug.get(slug).label)}</span></a>`).join('')}</div></section>
    <section class="section" aria-labelledby="download-title"><div class="scope-note-card reveal"><p class="eyebrow">Machine-readable records</p><h2 id="download-title">Inspect provenance, hashes, classifications, duplicates, and migration relationships.</h2><div class="m365-download-grid"><a href="/assets/data/microsoft-365-evidence-catalog.json">Evidence catalog JSON</a><a href="/assets/data/microsoft-365-migration-matrix.csv">Source-to-destination matrix CSV</a><a href="/assets/data/microsoft-365-duplicate-report.json">Retained duplicate report JSON</a><a href="/assets/data/microsoft-365-preservation-report.json">Preservation report JSON</a></div></div></section>`;
  return pageShell({
    title: 'Microsoft 365 Evidence Catalog',
    description: 'Technology relationships, provenance, integrity, classifications, duplicates, and scope for Microsoft 365 evidence.',
    canonicalPath: '/microsoft-365/evidence-catalog/',
    eyebrow: 'Complete Microsoft 365 evidence catalog',
    heading: 'Every Microsoft 365 artifact mapped without destructive moves.',
    lead: 'The catalog preserves established routes while connecting tenant, identity, security, application, Exchange, Intune, SharePoint, Teams, and automation evidence to bounded administrator skills.',
    body
  });
}

function preservationPage() {
  const exactMatches = comparison.filter((item) => item.exactGitBlobMatch).length;
  const body = `
    <section class="section" aria-labelledby="preservation-title"><div class="m365-metrics wide reveal"><div><strong>${sharePointRows.length}</strong><span>Inventory rows compared</span></div><div><strong>${exactMatches}</strong><span>Cross-repository control files matched</span></div><div><strong>${preservationReport.sharepointPreservation.hashMismatches}</strong><span>Byte differences disclosed</span></div><div><strong>0</strong><span>Evidence paths removed</span></div></div></section>
    <section class="section" id="preservation-title" aria-labelledby="method-title"><div class="section-head reveal"><p class="eyebrow">Preservation method</p><h2 id="method-title">Recorded inventory plus current byte verification.</h2><p>The reviewed original inventory is an exact Git-blob match. Each current public file is compared with the SHA-256 recorded by that inventory, and any byte difference is disclosed as a derivative. This supports preservation review without copying the same artifact into several technology folders.</p></div><div class="m365-preservation-grid reveal">${comparison.map((item) => `<article><span>${item.exactGitBlobMatch ? 'MATCH' : 'MISMATCH'}</span><h3>${escapeHtml(path.basename(item.path))}</h3><p>${escapeHtml(item.path)}</p></article>`).join('')}</div></section>
    <section class="section" aria-labelledby="boundary-title"><div class="scope-note-card reveal"><p class="eyebrow">Verification boundary</p><h2 id="boundary-title">Integrity evidence is bounded.</h2><p>${escapeHtml(preservationReport.sharepointPreservation.boundary)}</p><p>No duplicate removal is authorized. No new unredacted tenant export is introduced by this phase.</p><div class="inline-actions"><a href="/assets/data/microsoft-365-preservation-report.json">Open preservation report</a><a href="/assets/data/microsoft-365-duplicate-report.json">Open duplicate report</a></div></div></section>`;
  return pageShell({
    title: 'Microsoft 365 Evidence Preservation',
    description: 'Preservation and integrity verification for the Microsoft 365 and SharePoint evidence collections.',
    canonicalPath: '/microsoft-365/preservation/',
    eyebrow: 'Microsoft 365 preservation review',
    heading: 'Preserved routes, compared hashes, retained duplicates, and explicit boundaries.',
    lead: 'The phase organizes evidence through metadata and relationships while leaving established public files and routes intact.',
    body
  });
}

function sharePointIndexPage() {
  const curated = sharePointRows
    .map((row) => ({row, technologies: classifySharePointTechnologies(row)}))
    .sort((a, b) => b.technologies.length - a.technologies.length || a.row.title.localeCompare(b.row.title))
    .slice(0, 36);
  const body = `
    <section class="section" aria-labelledby="collection-title"><div class="m365-metrics wide reveal"><div><strong>${sharePointRows.length}</strong><span>Source exports indexed</span></div><div><strong>${curated.length}</strong><span>Curated navigation records</span></div><div><strong>${duplicateGroups.filter((group) => group.paths.some((item) => item.startsWith('evidence-library/preserved-sharepoint/'))).length}</strong><span>Duplicate groups retained</span></div><div><strong>0</strong><span>Source files moved</span></div></div></section>
    <section class="section" id="collection-title" aria-labelledby="curated-title"><div class="section-head reveal"><p class="eyebrow">Curated source review</p><h2 id="curated-title">Representative exports selected through reproducible technology rules.</h2><p>These pages are preserved source exports, not live SharePoint resources. Dates remain in source filenames and metadata rather than public status labels.</p></div><div class="m365-source-grid reveal">${curated.map(({row, technologies}) => `<article><span>${escapeHtml(technologies.map((slug) => technologyBySlug.get(slug)?.label || slug).join(' · '))}</span><h3>${escapeHtml(row.title || path.basename(row.site_rel))}</h3><p>${escapeHtml(row.category)} · ${escapeHtml(row.ext.toUpperCase())}</p><a href="/${escapeHtml(normalizePath(row.site_rel))}">Open preserved export</a></article>`).join('')}</div></section>
    <section class="section" aria-labelledby="collection-records"><div class="scope-note-card reveal"><p class="eyebrow">Collection records</p><h2 id="collection-records">Inventory, preservation, and technology relationships.</h2><div class="m365-download-grid"><a href="/evidence-library/preserved-sharepoint/sharepoint-export-inventory.csv">Source inventory CSV</a><a href="/microsoft-365/sharepoint/">SharePoint capability page</a><a href="/microsoft-365/evidence-catalog/">Complete Microsoft 365 catalog</a><a href="/microsoft-365/preservation/">Preservation review</a></div><p>The collection supports documentation governance and preservation claims. It does not prove administration of a live production SharePoint environment.</p></div></section>`;
  return pageShell({
    title: 'Preserved SharePoint Exports',
    description: 'Public-safe navigation for preserved SharePoint and Microsoft 365 documentation exports with inventory and integrity records.',
    canonicalPath: '/evidence-library/preserved-sharepoint/index.html',
    eyebrow: 'Preserved Microsoft 365 documentation',
    heading: 'SharePoint exports organized without rewriting the source collection.',
    lead: 'The source routes remain directly browseable while byte comparisons and derivative classifications are disclosed. Technology relationships provide clearer navigation for SharePoint, Teams, Intune, security, applications, and automation evidence.',
    body
  });
}

const migrationHeader = ['id','source_repository','source_commit','source_path','current_public_path','technology_routes','evidence_type','publication_classification','preservation_state','sha256'];
const migrationRows = [migrationHeader.map(csvCell).join(',')];
for (const record of records) {
  migrationRows.push([
    record.id,
    record.sourceRepository,
    record.sourceCommit,
    record.sourcePath,
    record.publicPath,
    record.technologies.map((slug) => `/microsoft-365/${slug}/`),
    record.evidenceType,
    record.publicationClassification,
    record.preservationState,
    record.hash
  ].map(csvCell).join(','));
}

const outputs = new Map();
outputs.set('assets/data/microsoft-365-evidence-catalog.json', `${JSON.stringify(catalog, null, 2)}\n`);
outputs.set('assets/data/microsoft-365-duplicate-report.json', `${JSON.stringify({schemaVersion:1,phase:config.phase,groups:duplicateGroups}, null, 2)}\n`);
outputs.set('assets/data/microsoft-365-preservation-report.json', `${JSON.stringify(preservationReport, null, 2)}\n`);
outputs.set('assets/data/microsoft-365-migration-matrix.csv', `${migrationRows.join('\n')}\n`);
for (const slug of Object.keys(config.technologies)) outputs.set(`microsoft-365/${slug}/index.html`, technologyPage(slug));
outputs.set('microsoft-365/evidence-catalog/index.html', catalogPage());
outputs.set('microsoft-365/preservation/index.html', preservationPage());

for (const [relativePath, expected] of outputs) {
  const absolutePath = path.join(root, relativePath);
  if (checkMode) {
    if (!fs.existsSync(absolutePath)) failures.push(`Generated Microsoft 365 output is missing: ${relativePath}`);
    else if (fs.readFileSync(absolutePath, 'utf8') !== expected) failures.push(`Generated Microsoft 365 output drift: ${relativePath}`);
  } else {
    fs.mkdirSync(path.dirname(absolutePath), {recursive: true});
    fs.writeFileSync(absolutePath, expected, 'utf8');
    console.log(`Generated ${relativePath}`);
  }
}

if (failures.length) {
  for (const failure of [...new Set(failures)].sort()) console.error(failure);
  console.error(`Microsoft 365 evidence organization failed with ${failures.length} finding(s).`);
  process.exit(1);
}

if (checkMode) console.log(`Microsoft 365 evidence organization is current (${records.length} unique artifacts; ${sharePointRows.length} preserved SharePoint exports).`);
