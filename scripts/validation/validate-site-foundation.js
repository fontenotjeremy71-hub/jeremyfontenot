#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..', '..');
const failures = [];
const datePatterns = [
  /\b(?:19|20)\d{2}\b/,
  /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/i,
  /\b(?:recent|recently|latest|newest|fresh|freshness)\b/i,
  /\b(?:date|dates|dated|year|years|month|months|timestamp|timestamps)\b/i
];
const forbiddenClassifications = /\b(?:historical|legacy|obsolete|superseded)\b/i;

function readJson(relativePath) {
  const absolute = path.join(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(absolute, 'utf8'));
  } catch (error) {
    failures.push(`${relativePath}: ${error.message}`);
    return null;
  }
}

function requireFields(record, fields, context) {
  for (const field of fields) {
    if (!(field in record)) failures.push(`${context}: missing required field ${field}`);
  }
}

function scanPublicLabel(value, context) {
  if (typeof value !== 'string') return;
  for (const pattern of datePatterns) {
    if (pattern.test(value)) failures.push(`${context}: public label contains date or recency terminology: ${value}`);
  }
  if (forbiddenClassifications.test(value)) failures.push(`${context}: public label contains a forbidden evidence classification: ${value}`);
}

function routeToPath(route) {
  const clean = route.split('#')[0].split('?')[0];
  if (clean === '/') return 'index.html';
  const relative = clean.replace(/^\//, '');
  if (relative.endsWith('/')) return `${relative}index.html`;
  return relative;
}

function assertRouteExists(route, context) {
  if (!route.startsWith('/')) {
    failures.push(`${context}: internal route must begin with /: ${route}`);
    return;
  }
  const relative = routeToPath(route);
  if (!fs.existsSync(path.join(root, relative))) failures.push(`${context}: route target does not exist: ${route} -> ${relative}`);
}

const expectedTaxonomies = {
  'microsoft-365': ['tenant-administration', 'entra-id', 'intune', 'exchange-online', 'sharepoint', 'teams', 'security-compliance', 'applications', 'automation'],
  'home-lab': ['environment', 'proxmox', 'active-directory', 'dns-dhcp', 'networking', 'pfsense', 'windows-server', 'windows-clients', 'linux', 'backup-recovery', 'monitoring-logging', 'security', 'automation']
};
const statusValues = new Set(['validated', 'tested', 'configured', 'documented', 'limitation', 'inconclusive', 'not-tested']);

for (const relativePath of ['content/microsoft-365/technologies.json', 'content/home-lab/technologies.json']) {
  const taxonomy = readJson(relativePath);
  if (!taxonomy) continue;
  requireFields(taxonomy, ['schemaVersion', 'platform', 'label', 'route', 'sourceRoot', 'summary', 'technologies'], relativePath);
  if (taxonomy.schemaVersion !== 1) failures.push(`${relativePath}: schemaVersion must be 1`);
  if (!expectedTaxonomies[taxonomy.platform]) failures.push(`${relativePath}: unsupported platform ${taxonomy.platform}`);
  if (taxonomy.route !== `/${taxonomy.platform}/`) failures.push(`${relativePath}: route must match platform slug`);
  if (taxonomy.sourceRoot !== `content/${taxonomy.platform}`) failures.push(`${relativePath}: sourceRoot must match the technology-first content root`);
  scanPublicLabel(taxonomy.label, `${relativePath} label`);
  scanPublicLabel(taxonomy.summary, `${relativePath} summary`);
  const seen = new Set();
  for (const [index, technology] of taxonomy.technologies.entries()) {
    const context = `${relativePath} technologies[${index}]`;
    requireFields(technology, ['slug', 'label', 'status', 'statusLabel', 'skill', 'task', 'result', 'proof', 'scope', 'limitations'], context);
    if (seen.has(technology.slug)) failures.push(`${context}: duplicate technology slug ${technology.slug}`);
    seen.add(technology.slug);
    if (!statusValues.has(technology.status)) failures.push(`${context}: unsupported status ${technology.status}`);
    for (const field of ['label', 'statusLabel', 'skill', 'task', 'result', 'scope', 'limitations']) scanPublicLabel(technology[field], `${context} ${field}`);
    if (!technology.proof || typeof technology.proof !== 'object') failures.push(`${context}: proof must be an object`);
    else {
      requireFields(technology.proof, ['label', 'href'], `${context} proof`);
      scanPublicLabel(technology.proof.label, `${context} proof label`);
      if (technology.proof.href) assertRouteExists(technology.proof.href, `${context} proof`);
    }
  }
  const expected = expectedTaxonomies[taxonomy.platform] || [];
  const missing = expected.filter((slug) => !seen.has(slug));
  const unexpected = [...seen].filter((slug) => !expected.includes(slug));
  if (missing.length) failures.push(`${relativePath}: missing required technology slugs: ${missing.join(', ')}`);
  if (unexpected.length) failures.push(`${relativePath}: unexpected technology slugs: ${unexpected.join(', ')}`);
}

const landing = readJson('content/site/landing-pages.json');
if (landing) {
  requireFields(landing, ['schemaVersion', 'siteOrigin', 'pages'], 'content/site/landing-pages.json');
  const ids = new Set();
  const routes = new Set();
  const outputs = new Set();
  for (const [pageIndex, page] of landing.pages.entries()) {
    const context = `content/site/landing-pages.json pages[${pageIndex}]`;
    requireFields(page, ['id', 'route', 'outputPath', 'title', 'description', 'eyebrow', 'headline', 'summary', 'primaryActions', 'sections', 'scopeHeading', 'scopeText'], context);
    if (ids.has(page.id)) failures.push(`${context}: duplicate page id ${page.id}`);
    if (routes.has(page.route)) failures.push(`${context}: duplicate route ${page.route}`);
    if (outputs.has(page.outputPath)) failures.push(`${context}: duplicate outputPath ${page.outputPath}`);
    ids.add(page.id); routes.add(page.route); outputs.add(page.outputPath);
    if (routeToPath(page.route) !== page.outputPath) failures.push(`${context}: route and outputPath do not resolve to the same file`);
    for (const field of ['title', 'description', 'eyebrow', 'headline', 'summary', 'scopeHeading', 'scopeText']) scanPublicLabel(page[field], `${context} ${field}`);
    for (const [actionIndex, action] of page.primaryActions.entries()) {
      requireFields(action, ['label', 'href', 'style'], `${context} primaryActions[${actionIndex}]`);
      scanPublicLabel(action.label, `${context} action label`);
      if (action.href) assertRouteExists(action.href, `${context} action`);
    }
    const sectionIds = new Set();
    for (const [sectionIndex, section] of page.sections.entries()) {
      const sectionContext = `${context} sections[${sectionIndex}]`;
      requireFields(section, ['id', 'eyebrow', 'heading', 'summary', 'cards'], sectionContext);
      if (sectionIds.has(section.id)) failures.push(`${sectionContext}: duplicate section id ${section.id}`);
      sectionIds.add(section.id);
      for (const field of ['eyebrow', 'heading', 'summary']) scanPublicLabel(section[field], `${sectionContext} ${field}`);
      for (const [cardIndex, card] of section.cards.entries()) {
        const cardContext = `${sectionContext} cards[${cardIndex}]`;
        requireFields(card, ['code', 'title', 'text', 'href', 'linkLabel'], cardContext);
        for (const field of ['code', 'title', 'text', 'linkLabel']) scanPublicLabel(card[field], `${cardContext} ${field}`);
        if (card.href) assertRouteExists(card.href, cardContext);
      }
    }
    const output = path.join(root, page.outputPath);
    if (!fs.existsSync(output)) failures.push(`${context}: generated output is missing: ${page.outputPath}`);
  }
  for (const requiredId of ['systems-skills', 'evidence']) {
    if (!ids.has(requiredId)) failures.push(`content/site/landing-pages.json: missing required landing page ${requiredId}`);
  }
}

const legacyRoutes = readJson('content/site/legacy-routes.json');
if (legacyRoutes) {
  requireFields(legacyRoutes, ['schemaVersion', 'routes'], 'content/site/legacy-routes.json');
  const seen = new Set();
  for (const [index, route] of legacyRoutes.routes.entries()) {
    const context = `content/site/legacy-routes.json routes[${index}]`;
    requireFields(route, ['legacyRoute', 'targetRoute', 'strategy', 'status', 'reason'], context);
    if (seen.has(route.legacyRoute)) failures.push(`${context}: duplicate legacy route ${route.legacyRoute}`);
    seen.add(route.legacyRoute);
    if (!['retained-route', 'compatibility-page', 'redirect'].includes(route.strategy)) failures.push(`${context}: unsupported strategy ${route.strategy}`);
    if (!['active', 'planned', 'validated'].includes(route.status)) failures.push(`${context}: unsupported status ${route.status}`);
    assertRouteExists(route.legacyRoute, `${context} legacyRoute`);
    assertRouteExists(route.targetRoute, `${context} targetRoute`);
  }
}

const schema = readJson('schemas/site-foundation.schema.json');
if (schema) {
  const requiredEvidenceFields = ['id', 'lab', 'technology', 'evidenceType', 'sourceRepository', 'sourcePath', 'sourceCommit', 'hashAlgorithm', 'hash', 'supportedClaims', 'skill', 'task', 'result', 'scope', 'limitations', 'publicationClassification', 'publicRoute'];
  const actual = schema.$defs?.evidenceRecord?.required || [];
  for (const field of requiredEvidenceFields) {
    if (!actual.includes(field)) failures.push(`schemas/site-foundation.schema.json: evidenceRecord must require ${field}`);
  }
  for (const definition of ['technologyRecord', 'technologyTaxonomy', 'landingPage', 'evidenceRecord', 'claimRelationship', 'legacyRoute', 'publicationManifest']) {
    if (!schema.$defs?.[definition]) failures.push(`schemas/site-foundation.schema.json: missing $defs.${definition}`);
  }
}

const publication = readJson('config/publication-manifest.json');
if (publication) {
  requireFields(publication, ['schemaVersion', 'outputDirectory', 'requiredRootFiles', 'optionalRootFiles', 'rootExtensions', 'directories', 'forbiddenOutputRoots'], 'config/publication-manifest.json');
  for (const file of publication.requiredRootFiles) {
    if (!fs.existsSync(path.join(root, file))) failures.push(`config/publication-manifest.json: missing required public root file ${file}`);
  }
  for (const directory of publication.directories) {
    if (!fs.existsSync(path.join(root, directory))) failures.push(`config/publication-manifest.json: missing public directory ${directory}`);
  }
  for (const forbidden of publication.forbiddenOutputRoots) {
    if (publication.directories.includes(forbidden)) failures.push(`config/publication-manifest.json: forbidden source root is included for publication: ${forbidden}`);
  }
}

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(header).update(buffer).digest('hex');
}

const evidenceFixtures = readJson('tests/fixtures/site-foundation/evidence-records.json');
const relationshipFixtures = readJson('tests/fixtures/site-foundation/claim-relationships.json');
const evidenceIds = new Set();
if (evidenceFixtures) {
  requireFields(evidenceFixtures, ['schemaVersion', 'records'], 'tests/fixtures/site-foundation/evidence-records.json');
  const requiredEvidenceFields = schema?.$defs?.evidenceRecord?.required || [];
  for (const [index, record] of evidenceFixtures.records.entries()) {
    const context = `tests/fixtures/site-foundation/evidence-records.json records[${index}]`;
    requireFields(record, requiredEvidenceFields, context);
    if (evidenceIds.has(record.id)) failures.push(`${context}: duplicate evidence id ${record.id}`);
    evidenceIds.add(record.id);
    if (record.sourceRepository === 'fontenotjeremy71-hub/jeremyfontenot') {
      const source = path.join(root, record.sourcePath);
      if (!fs.existsSync(source)) failures.push(`${context}: sourcePath does not exist: ${record.sourcePath}`);
      else if (record.hashAlgorithm === 'git-blob-sha1') {
        const actualHash = gitBlobSha(fs.readFileSync(source));
        if (actualHash !== record.hash) failures.push(`${context}: git blob hash mismatch for ${record.sourcePath}; expected ${record.hash}, actual ${actualHash}`);
      }
    }
    if (record.publicRoute) assertRouteExists(record.publicRoute, `${context} publicRoute`);
  }
}
if (relationshipFixtures) {
  requireFields(relationshipFixtures, ['schemaVersion', 'relationships'], 'tests/fixtures/site-foundation/claim-relationships.json');
  const requiredRelationshipFields = schema?.$defs?.claimRelationship?.required || [];
  const claimIds = new Set();
  for (const [index, relationship] of relationshipFixtures.relationships.entries()) {
    const context = `tests/fixtures/site-foundation/claim-relationships.json relationships[${index}]`;
    requireFields(relationship, requiredRelationshipFields, context);
    if (claimIds.has(relationship.claimId)) failures.push(`${context}: duplicate claim id ${relationship.claimId}`);
    claimIds.add(relationship.claimId);
    for (const evidenceId of relationship.evidenceIds || []) {
      if (!evidenceIds.has(evidenceId)) failures.push(`${context}: unknown evidence id ${evidenceId}`);
    }
  }
}

if (failures.length) {
  for (const failure of [...new Set(failures)].sort()) console.error(failure);
  console.error(`Site foundation validation failed with ${failures.length} finding(s).`);
  process.exit(1);
}

console.log('Site foundation validation passed.');
