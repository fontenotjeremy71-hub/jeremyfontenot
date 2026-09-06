#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const m365 = require('./generate-m365-evidence-organization.js');
const homeLab = require('../lib/home-lab-evidence.js');

const root = path.resolve(__dirname, '..', '..');
const OUTPUTS = [
  'assets/data/home-lab-evidence-catalog.json',
  'home-lab/evidence-catalog.html',
  'home-lab/source-to-destination-matrix.csv',
  'home-lab/duplicate-groups.json',
  'home-lab/sensitive-data-review.json',
  'home-lab/authoritative-source-decisions.json',
  'active-directory-lab.html',
  'infrastructure.html',
  'network-segmentation.html',
  'powershell-automation.html'
];
const COMPATIBILITY_ROUTES = new Map([
  ['active-directory-lab.html', {title: 'Active Directory Lab Evidence', technology: 'active-directory'}],
  ['infrastructure.html', {title: 'Home Lab Infrastructure Evidence', technology: 'environment'}],
  ['network-segmentation.html', {title: 'Network Segmentation Evidence', technology: 'networking'}],
  ['powershell-automation.html', {title: 'PowerShell Automation Evidence', technology: 'automation'}]
]);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function csvCell(value) {
  return '"' + String(value === undefined || value === null ? '' : value).replaceAll('"', '""') + '"';
}

function listTrackedFiles() {
  return execFileSync('git', ['ls-files', '-z'], {cwd: root, encoding: 'utf8'}).split('\0').filter(Boolean).map(homeLab.toPosix).sort();
}

function readGitObjects(commit, sourcePaths) {
  const paths = [...new Set(sourcePaths.map(homeLab.toPosix))];
  if (!paths.length) return new Map();
  const output = execFileSync('git', ['cat-file', '--batch'], {
    cwd: root,
    encoding: null,
    input: paths.map((sourcePath) => commit + ':' + sourcePath).join('\n') + '\n',
    maxBuffer: 1024 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  const result = new Map();
  let offset = 0;
  for (const sourcePath of paths) {
    const newline = output.indexOf(10, offset);
    const header = output.subarray(offset, newline).toString('utf8').split(' ');
    if (header[1] === 'missing') throw new Error('Missing source at recorded commit: ' + commit + ':' + sourcePath);
    const size = Number(header[2]);
    const start = newline + 1;
    result.set(sourcePath, output.subarray(start, start + size));
    offset = start + size + 1;
  }
  return result;
}

function publicRouteFor(sourcePath, publicationManifest) {
  const normalized = homeLab.toPosix(sourcePath);
  const first = normalized.split('/')[0];
  if (publicationManifest.directories.includes(first)) return '/' + normalized;
  if (!normalized.includes('/') && publicationManifest.rootExtensions.includes(path.extname(normalized))) return '/' + normalized;
  return null;
}

function candidateFiles(sourceFiles, manifest) {
  const pattern = new RegExp(manifest.candidatePathTerms.map((term) => '(?:' + term + ')').join('|'), 'i');
  const contentRoots = manifest.contentCandidateRoots || [];
  const text = homeLab.TEXT_EXTENSIONS;
  return [...new Set([
    ...sourceFiles.filter((file) => pattern.test(file)),
    ...sourceFiles.filter((file) => contentRoots.some((prefix) => file.startsWith(prefix)) && text.has(path.extname(file).toLowerCase()) && pattern.test(fs.readFileSync(path.join(root, file), 'utf8')))
  ])].sort();
}

function resultStateFor(value, fallback) {
  const normalized = homeLab.normalizeForTechnologyMatching(value);
  if (/insufficient|misleading|overstat/.test(normalized)) return 'insufficient';
  if (/not tested|untested|not available|unavailable/.test(normalized)) return 'not-tested';
  if (/inconclusive|timeout|warning|partial/.test(normalized)) return 'inconclusive';
  if (/configured|configuration/.test(normalized) && !/validat|test|pass/.test(normalized)) return 'configured-not-behavior-tested';
  if (/readme|documentation|runbook|playbook|plan|architecture|diagram/.test(normalized) && !/validat|test|inventory/.test(normalized)) return 'documented-only';
  return fallback === 'directly-proven' ? 'directly-proven' : 'supported-with-limitations';
}

function assertNoApprovedSourceDrift(approvedPaths, changedPaths) {
  const changed = new Set([...changedPaths].map(homeLab.toPosix));
  const drifted = [...approvedPaths].map(homeLab.toPosix).filter((file) => changed.has(file)).sort();
  if (drifted.length) throw new Error('Approved Home Lab source files have uncommitted drift:\n' + drifted.join('\n'));
}

function pageShell({title, description, canonicalPath, eyebrow, headline, lead, body, current = 'home-lab'}) {
  const canonical = 'https://jeremyfontenot.online/' + canonicalPath.replace(/^\/+/, '');
  const links = [['Home','/'],['Readiness','/systems-administration.html'],['Skills','/systems-skills/'],['Microsoft 365','/microsoft-365/'],['Home Lab','/home-lab/'],['Evidence','/evidence/'],['Resume','/resume.html'],['Contact','/contact.html']];
  return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>' + escapeHtml(title) + '</title><meta name="description" content="' + escapeHtml(description) + '"><meta name="robots" content="index, follow">' +
    '<link rel="canonical" href="' + canonical + '"><meta property="og:title" content="' + escapeHtml(title) + '"><meta property="og:description" content="' + escapeHtml(description) + '"><meta property="og:type" content="website"><meta property="og:url" content="' + canonical + '">' +
    '<link rel="icon" href="/assets/logos/favicon_64x64.png"><link rel="stylesheet" href="/assets/css/site.css"><script src="/assets/js/site.js" defer></script></head>' +
    '<body class="foundation-page home-lab-page"><!-- GENERATED FILE — DO NOT EDIT DIRECTLY. --><a class="skip-link" href="#main">Skip to content</a>' +
    '<header class="site-header"><nav class="nav" aria-label="Primary navigation"><a class="brand" href="/"><img src="/assets/logos/header_logo_88x88.png" alt="Jeremy Fontenot logo" width="44" height="44"><span>Jeremy Fontenot</span><small>Support · systems · evidence</small></a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu">Menu</button><div class="nav-links" id="primary-menu">' + links.map(([label, href]) => '<a href="' + href + '"' + (current === label.toLowerCase().replace(' ', '-') ? ' aria-current="page"' : '') + '>' + label + '</a>').join('') + '</div></nav></header>' +
    '<main id="main"><section class="page page-hero" aria-labelledby="page-title"><div class="section-head reveal is-visible"><p class="eyebrow">' + escapeHtml(eyebrow) + '</p><h1 id="page-title">' + escapeHtml(headline) + '</h1><p class="lead">' + escapeHtml(lead) + '</p></div></section>' + body + '</main>' +
    '<footer class="site-footer"><p class="credibility">Personal-lab evidence remains separate from professional experience. Scope and limitations stay visible.</p><p class="footer-meta">Jeremy Fontenot · Abbeville, Louisiana · Central Time</p></footer></body></html>\n';
}

function compatibilityPage(sourcePath, route) {
  const item = COMPATIBILITY_ROUTES.get(route);
  const description = item.title + ' preserved as a compatibility route with attested original-source integrity and a current public presentation derivative.';
  const body = '<section class="section" aria-labelledby="compatibility-title"><div class="scope-note-card reveal"><p class="eyebrow">Preserved route</p><h2 id="compatibility-title">Source meaning and route continuity are retained.</h2><p>The original public portfolio artifact at <code>' + escapeHtml(sourcePath) + '</code> is attested at its recorded source commit. This page is a presentation derivative, not a byte-preserved copy and not evidence of employer or production-system ownership.</p><div class="inline-actions"><a href="/home-lab/evidence-catalog.html#' + item.technology + '">Review related catalog evidence</a><a href="/home-lab/">Open the Home Lab overview</a></div></div></section>';
  return pageShell({title: item.title + ' | Jeremy Fontenot', description, canonicalPath: route, eyebrow: 'Home Lab compatibility evidence', headline: item.title, lead: 'An established public route retained through an attested, bounded presentation derivative.', body});
}

function loadAttestations(config) {
  const directory = path.join(root, config.sourceAttestationsRoot);
  const files = fs.readdirSync(directory).filter((file) => file.endsWith('.json')).sort();
  if (!files.length) throw new Error('Home Lab source attestation set is empty.');
  const identities = new Set();
  const records = [];
  const manifests = [];
  for (const file of files) {
    const relativePath = homeLab.toPosix(path.join(config.sourceAttestationsRoot, file));
    const buffer = fs.readFileSync(path.join(directory, file));
    const document = JSON.parse(buffer.toString('utf8'));
    const expectedSource = [config.sources.operationsRepository, config.sources.originalPortfolio].find((source) => source.repository === document.sourceRepository);
    if (document.schemaVersion !== 1 || !expectedSource || expectedSource.commit !== document.sourceCommit || document.sourceVerificationMethod !== 'manifest-attested-source') throw new Error('Unapproved source attestation provenance: ' + relativePath);
    if (!document.selection || !['approvedRecursiveRoots','approvedIndividualFiles','reviewedExclusions'].every((field) => Array.isArray(document.selection[field])) || !('pathPattern' in document.selection)) throw new Error('Invalid source attestation selection contract: ' + relativePath);
    if (!Array.isArray(document.records) || document.records.length !== document.totals?.artifacts || document.totals.highSeveritySecretFindings !== 0) throw new Error('Invalid source attestation totals: ' + relativePath);
    let identifiers = 0;
    let manual = 0;
    for (const record of document.records) {
      const identity = document.sourceRepository + '@' + document.sourceCommit + ':' + record.sourcePath;
      if (identities.has(identity)) throw new Error('Duplicate or overlapping source attestation identity: ' + identity);
      identities.add(identity);
      if (!/^[0-9a-f]{40}$/.test(record.gitBlobSha1 || '') || !/^[0-9a-f]{64}$/.test(record.sha256 || '') || !Number.isSafeInteger(record.size) || record.size < 0 || !Array.isArray(record.technologies) || !record.technologies.length || typeof record.evidenceType !== 'string') throw new Error('Invalid attested record contract: ' + identity);
      if (!record.sensitiveDataReview || !Array.isArray(record.sensitiveDataReview.findings) || !Number.isSafeInteger(record.sensitiveDataReview.identifierFindings) || typeof record.sensitiveDataReview.manualReviewRequired !== 'boolean') throw new Error('Invalid attested sensitive-review contract: ' + identity);
      if (record.sensitiveDataReview?.highSeverityFindings !== 0) throw new Error('Attested high-severity finding: ' + identity);
      identifiers += record.sensitiveDataReview.identifierFindings;
      manual += record.sensitiveDataReview.manualReviewRequired ? 1 : 0;
      records.push({...record, sourceRepository: document.sourceRepository, sourceCommit: document.sourceCommit, attestationPath: relativePath, attestationHash: sha256(buffer), attestationFile: file});
    }
    if (identifiers !== document.totals.identifierFindings || manual !== document.totals.manualReviewRequired) throw new Error('Attestation sensitive-review totals mismatch: ' + relativePath);
    manifests.push({path: relativePath, repository: document.sourceRepository, commit: document.sourceCommit, artifacts: document.records.length, sha256: sha256(buffer)});
  }
  return {records, manifests};
}

function build() {
  const config = readJson('content/home-lab/evidence-organization.json');
  const sourceManifest = readJson(config.sourceManifest);
  const exceptionManifest = readJson(config.sensitiveDataExceptions);
  const taxonomy = readJson('content/home-lab/technologies.json');
  const schema = readJson('schemas/site-foundation.schema.json');
  const publicationManifest = readJson('config/publication-manifest.json');
  const trackedFiles = listTrackedFiles();
  const trackedSet = new Set(trackedFiles);
  m365.validateExceptionManifest(exceptionManifest, trackedSet);
  const excludedRoots = sourceManifest.reviewedExclusionRoots || [];
  const sourceFiles = trackedFiles.filter((file) => !(sourceManifest.generatedOutputRoots || []).some((prefix) => file.startsWith(prefix)));
  const exclusions = new Map(sourceManifest.reviewedExclusions.map((item) => [homeLab.toPosix(item.path), item.reason]));
  const approved = new Map();
  for (const item of sourceManifest.approvedRecursiveRoots) {
    const sourceRoot = homeLab.toPosix(item.path).replace(/\/+$/, '');
    const matches = sourceFiles.filter((file) => file.startsWith(sourceRoot + '/') && !file.endsWith('/.gitkeep'));
    if (!matches.length) throw new Error('Approved Home Lab recursive root is empty: ' + sourceRoot);
    for (const file of matches) approved.set(file, {...item, path: file, sourceRoot});
  }
  for (const item of sourceManifest.approvedIndividualFiles) {
    const file = homeLab.toPosix(item.path);
    if (!sourceFiles.includes(file)) throw new Error('Approved Home Lab individual file is missing: ' + file);
    approved.set(file, {...item, path: file, sourceRoot: null});
  }
  for (const excluded of exclusions.keys()) approved.delete(excluded);
  const candidates = candidateFiles(sourceFiles, sourceManifest);
  const uncovered = candidates.filter((file) => !approved.has(file) && !exclusions.has(file) && !excludedRoots.some((item) => file === item.path || file.startsWith(item.path.replace(/\/+$/, '') + '/')));
  if (uncovered.length) throw new Error('Home Lab candidate files require catalog records or reviewed exclusions:\n' + uncovered.join('\n'));
  const drift = new Set(execFileSync('git', ['diff', '--name-only', 'HEAD', '--'], {cwd: root, encoding: 'utf8'}).split(/\r?\n/).filter(Boolean).map(homeLab.toPosix));
  assertNoApprovedSourceDrift(approved.keys(), drift);

  const currentSource = config.sources.currentPortfolio;
  const headObjects = readGitObjects('HEAD', [...approved.keys()]);
  const recordedObjects = readGitObjects(currentSource.commit, [...approved.keys()]);
  const taxonomyBySlug = new Map(taxonomy.technologies.map((item) => [item.slug, item]));
  const claimsBySlug = new Map(config.technologies.map((item) => [item.slug, item]));
  const approvedTechnologies = new Set(claimsBySlug.keys());
  const generatedPages = new Map();
  const reviewEntries = [];
  const matchedExceptions = new Set();
  const highFailures = [];
  const unresolvedPublicIdentifiers = [];
  const records = [];

  function attachReview(record, buffer, reviewPath, inheritedReview = null) {
    const review = inheritedReview || homeLab.reviewArtifact(buffer, reviewPath, record.publicRoute, exceptionManifest, matchedExceptions);
    record.sensitiveDataReview = {status: review.status, highSeverityFindings: review.highSeverityFindings, identifierFindings: review.identifierFindings, manualReviewRequired: review.manualReviewRequired};
    if (review.findings?.length || review.manualReviewRequired) reviewEntries.push({evidenceId: record.id, path: reviewPath, publicationClassification: record.publicationClassification, status: review.status, findings: review.findings || []});
    if (review.highSeverityFindings) highFailures.push(reviewPath);
    for (const finding of review.findings || []) if (record.publicRoute && finding.severity === 'medium' && finding.reviewStatus === 'review-required') unresolvedPublicIdentifiers.push(reviewPath + ' [' + finding.type + ']');
  }

  for (const [sourcePath, manifestEntry] of [...approved.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const buffer = headObjects.get(sourcePath);
    const recorded = recordedObjects.get(sourcePath);
    if (!recorded || sha256(buffer) !== sha256(recorded)) throw new Error('Current Home Lab source differs from recorded commit: ' + sourcePath);
    const configured = manifestEntry.technologyRelationships || homeLab.technologiesFor(sourcePath);
    const relationships = [...new Set(configured)].filter((slug) => approvedTechnologies.has(slug));
    if (!relationships.length) throw new Error('No approved Home Lab technology relationship: ' + sourcePath);
    const technology = relationships[0];
    const claimIds = relationships.map((slug) => claimsBySlug.get(slug).claimId);
    const taxonomyRecord = taxonomyBySlug.get(technology);
    const type = homeLab.evidenceType(sourcePath);
    const publicRoute = publicRouteFor(sourcePath, publicationManifest);
    const classification = publicRoute ? 'public-original' : 'metadata-only';
    const relativeSource = manifestEntry.sourceRoot ? homeLab.toPosix(path.relative(manifestEntry.sourceRoot, sourcePath)) : sourcePath;
    const hash = sha256(buffer);
    const state = resultStateFor(sourcePath, claimsBySlug.get(technology).supportLevel);
    const record = {
      id: 'home-lab-current-' + sha256(Buffer.from(sourcePath)).slice(0, 16), lab: 'home-lab', technology, evidenceType: type,
      sourceRepository: currentSource.repository, sourcePath, sourceCommit: currentSource.commit, sourceVerificationMethod: 'direct-git-object',
      collectionContext: manifestEntry.reason + (publicRoute ? ' The tracked artifact remains at its established public route and is logically organized without moving or rewriting it.' : ' This repository-only artifact is cataloged as metadata and is not assigned a public route.'),
      hashAlgorithm: 'sha256', hash, supportedClaims: claimIds, skill: manifestEntry.skill || taxonomyRecord.skill, task: manifestEntry.task || taxonomyRecord.task,
      result: taxonomyRecord.result + ' Record state: ' + state + '.', resultState: state, scope: taxonomyRecord.scope,
      limitations: taxonomyRecord.limitations + (homeLab.TEXT_EXTENSIONS.has(path.extname(sourcePath).toLowerCase()) ? '' : ' Binary content is subject to documented manual-review limitations; OCR was not used.'),
      publicationClassification: classification, publicRoute, collection: manifestEntry.collection, publicPath: publicRoute ? sourcePath : null, size: buffer.length,
      technologyRelationships: relationships, logicalDestination: homeLab.logicalDestination(technology, type, manifestEntry.collection, relativeSource),
      sourceIntegrity: {algorithm: 'sha256', hash, size: buffer.length, verificationMethod: 'direct-git-object'}
    };
    if (publicRoute) record.publicIntegrity = {algorithm: 'sha256', hash, size: buffer.length, verificationMethod: 'current-working-tree'};
    attachReview(record, buffer, sourcePath);
    records.push(record);
  }

  const attested = loadAttestations(config);
  for (const source of attested.records) {
    const relationships = [...new Set(source.technologies)].filter((slug) => approvedTechnologies.has(slug));
    if (!relationships.length) throw new Error('Attested source has no approved technology relationship: ' + source.sourcePath);
    const rootCompatibility = source.sourceRepository === config.sources.originalPortfolio.repository && !source.sourcePath.includes('/') && COMPATIBILITY_ROUTES.has(source.sourcePath);
    const publicRoute = rootCompatibility ? '/' + source.sourcePath : null;
    let publicBuffer = null;
    if (rootCompatibility) {
      publicBuffer = Buffer.from(compatibilityPage(source.sourcePath, source.sourcePath), 'utf8');
      generatedPages.set(source.sourcePath, publicBuffer.toString('utf8'));
    }
    const technology = relationships[0];
    const type = source.evidenceType;
    const taxonomyRecord = taxonomyBySlug.get(technology);
    const claimIds = relationships.map((slug) => claimsBySlug.get(slug).claimId);
    const state = resultStateFor(source.sourcePath, claimsBySlug.get(technology).supportLevel);
    const record = {
      id: 'home-lab-attested-' + sha256(Buffer.from(source.sourceRepository + ':' + source.sourcePath)).slice(0, 16), lab: 'home-lab', technology, evidenceType: type,
      sourceRepository: source.sourceRepository, sourcePath: source.sourcePath, sourceCommit: source.sourceCommit, sourceVerificationMethod: 'manifest-attested-source',
      attestationPath: source.attestationPath, attestationHashAlgorithm: 'sha256', attestationHash: source.attestationHash,
      collectionContext: rootCompatibility ? 'Original source integrity is attested by the reviewed source manifest. The linked public page is a presentation derivative retained for route compatibility and is not described as byte-preserved.' : 'Operational or original-portfolio source integrity is attested by a reviewed manifest. The artifact remains in its authoritative source repository and is represented here without copying sensitive or duplicative source bytes.',
      hashAlgorithm: 'sha256', hash: publicBuffer ? sha256(publicBuffer) : source.sha256, supportedClaims: claimIds, skill: taxonomyRecord.skill, task: taxonomyRecord.task,
      result: taxonomyRecord.result + ' Record state: ' + state + '.', resultState: state, scope: taxonomyRecord.scope,
      limitations: taxonomyRecord.limitations + (source.sensitiveDataReview.manualReviewRequired ? ' Binary source content remains subject to documented manual-review limitations; OCR was not used.' : '') + ' This source record does not imply current production operation.',
      publicationClassification: publicBuffer ? 'sanitized-derivative' : 'source-reference-only', publicRoute, collection: source.attestationFile.replace(/\.json$/, ''), publicPath: publicBuffer ? source.sourcePath : null,
      size: publicBuffer ? publicBuffer.length : source.size, technologyRelationships: relationships,
      logicalDestination: homeLab.logicalDestination(technology, type, source.attestationFile.replace(/\.json$/, ''), source.sourcePath),
      sourceIntegrity: {algorithm: 'sha256', hash: source.sha256, size: source.size, verificationMethod: 'manifest-attested-source'}
    };
    if (publicBuffer) record.publicIntegrity = {algorithm: 'sha256', hash: sha256(publicBuffer), size: publicBuffer.length, verificationMethod: 'current-working-tree'};
    attachReview(record, publicBuffer || Buffer.alloc(0), source.sourcePath, publicBuffer ? homeLab.reviewArtifact(publicBuffer, source.sourcePath, publicRoute, exceptionManifest, matchedExceptions) : source.sensitiveDataReview);
    records.push(record);
  }
  if (highFailures.length) throw new Error('High-severity Home Lab findings:\n' + [...new Set(highFailures)].sort().join('\n'));
  if (unresolvedPublicIdentifiers.length) throw new Error('Public Home Lab identifier findings require exact reviewed exceptions:\n' + [...new Set(unresolvedPublicIdentifiers)].sort().join('\n'));
  const unmatched = exceptionManifest.exceptions.filter((item) => !matchedExceptions.has(item.id));
  if (unmatched.length) throw new Error('Home Lab reviewed exceptions did not match current public findings:\n' + unmatched.map((item) => item.id).join('\n'));

  records.sort((a, b) => a.id.localeCompare(b.id));
  const errors = [];
  const ids = new Set(), identities = new Set(), destinations = new Map();
  for (const [index, record] of records.entries()) {
    errors.push(...m365.validateEvidenceRecord(record, schema, 'records[' + index + ']'));
    if (ids.has(record.id)) errors.push('Duplicate evidence id: ' + record.id); ids.add(record.id);
    const identity = record.sourceRepository + '@' + record.sourceCommit + ':' + record.sourcePath;
    if (identities.has(identity)) errors.push('Physical source represented more than once: ' + identity); identities.add(identity);
    const destination = record.logicalDestination.toLowerCase();
    if (destinations.has(destination)) errors.push('Logical destination collision: ' + record.logicalDestination); destinations.set(destination, record.id);
    const resolved = path.resolve(root, record.logicalDestination), contentRoot = path.resolve(root, 'content/home-lab');
    if (!resolved.startsWith(contentRoot + path.sep) || homeLab.toPosix(record.logicalDestination).split('/').some((part) => part === '.' || part === '..')) errors.push('Unsafe logical destination: ' + record.logicalDestination);
    if (record.publicRoute) {
      const routePath = record.publicRoute.replace(/^\//, '');
      const exists = generatedPages.has(routePath) || fs.existsSync(path.join(root, routePath));
      if (!exists) errors.push('Public route does not exist: ' + record.publicRoute);
      if (!record.publicIntegrity || record.hash !== record.publicIntegrity.hash || record.size !== record.publicIntegrity.size) errors.push('Public hash/size mismatch: ' + record.id);
    } else if (!['metadata-only','source-reference-only'].includes(record.publicationClassification)) errors.push('Public classification lacks route: ' + record.id);
  }
  if (records.length !== approved.size + attested.records.length) errors.push('One-to-one source relationship failed.');

  const technologyMap = new Map(config.technologies.map((item) => [item.slug, {...item, evidenceIds: [], counts: {}}]));
  for (const record of records) for (const slug of record.technologyRelationships) {
    const technology = technologyMap.get(slug);
    if (!technology) errors.push('Unknown Home Lab technology: ' + slug);
    else {technology.evidenceIds.push(record.id); technology.counts[record.evidenceType] = (technology.counts[record.evidenceType] || 0) + 1;}
  }
  const claimRelationships = [...technologyMap.values()].map((technology) => ({
    claimId: technology.claimId, claimText: technology.claim,
    evidenceIds: records.filter((record) => record.supportedClaims.includes(technology.claimId)).map((record) => record.id).sort(),
    supportLevel: technology.supportLevel, scope: taxonomyBySlug.get(technology.slug).scope, limitations: taxonomyBySlug.get(technology.slug).limitations
  }));
  for (const claim of claimRelationships) {
    if (!claim.evidenceIds.length) errors.push('Claim has no supporting evidence: ' + claim.claimId);
    for (const evidenceId of claim.evidenceIds) if (!records.find((record) => record.id === evidenceId)?.supportedClaims.includes(claim.claimId)) errors.push('Nonreciprocal claim: ' + claim.claimId + '/' + evidenceId);
  }
  for (const record of records) for (const claimId of record.supportedClaims) if (!claimRelationships.find((claim) => claim.claimId === claimId)?.evidenceIds.includes(record.id)) errors.push('Nonreciprocal evidence claim: ' + record.id + '/' + claimId);
  if (errors.length) throw new Error('Home Lab catalog contract validation failed:\n' + [...new Set(errors)].sort().join('\n'));

  function duplicateGroups(field, filter) {
    const groups = new Map();
    for (const record of records.filter(filter)) {const integrity = record[field]; if (!integrity) continue; if (!groups.has(integrity.hash)) groups.set(integrity.hash, []); groups.get(integrity.hash).push(record.id);}
    return [...groups.entries()].filter(([, evidenceIds]) => evidenceIds.length > 1).map(([hash, evidenceIds]) => ({algorithm: 'sha256', hash, count: evidenceIds.length, evidenceIds: evidenceIds.sort()})).sort((a, b) => b.count - a.count || a.hash.localeCompare(b.hash));
  }
  const sourceGroups = duplicateGroups('sourceIntegrity', () => true);
  const publicGroups = duplicateGroups('publicIntegrity', (record) => Boolean(record.publicRoute));
  const reviewSummary = {
    artifactsReviewed: records.length,
    textArtifactsInspected: records.filter((record) => !record.sensitiveDataReview.manualReviewRequired).length,
    manualReviewRequired: records.filter((record) => record.sensitiveDataReview.manualReviewRequired).length,
    highSeveritySecretFindings: records.reduce((sum, record) => sum + record.sensitiveDataReview.highSeverityFindings, 0),
    identifierFindings: records.reduce((sum, record) => sum + record.sensitiveDataReview.identifierFindings, 0),
    unresolvedPublicIdentifierFindings: 0
  };
  const summary = {
    schemaVersion: 1, phase: config.phase,
    generatedFrom: {currentPortfolio: currentSource, externalSources: [config.sources.operationsRepository, config.sources.originalPortfolio], sourceManifest: config.sourceManifest, sourceAttestations: attested.manifests, sensitiveDataExceptions: config.sensitiveDataExceptions},
    totals: {artifacts: records.length, currentPortfolioArtifacts: approved.size, attestedSourceArtifacts: attested.records.length, sourceAttestations: attested.manifests.length, sourceDuplicateGroups: sourceGroups.length, publicDuplicateGroups: publicGroups.length, sensitiveDataReview: reviewSummary},
    technologies: [...technologyMap.values()].map((technology) => ({slug: technology.slug, label: technology.label, claimId: technology.claimId, claim: technology.claim, supportLevel: technology.supportLevel, evidenceCount: new Set(technology.evidenceIds).size, counts: technology.counts, evidenceIds: [...new Set(technology.evidenceIds)].sort()})),
    claimRelationships, boundaries: config.boundaries, records
  };
  const matrixHeader = ['evidence_id','source_repository','source_commit','source_path','attestation_path','public_path','source_sha256','source_size','public_sha256','public_size','evidence_type','result_state','primary_technology','technology_relationships','logical_destination','publication_classification','supported_claims','collection_context'];
  const matrix = [matrixHeader.join(','), ...records.map((record) => [record.id,record.sourceRepository,record.sourceCommit,record.sourcePath,record.attestationPath || '',record.publicPath || '',record.sourceIntegrity.hash,record.sourceIntegrity.size,record.publicIntegrity?.hash || '',record.publicIntegrity?.size ?? '',record.evidenceType,record.resultState,record.technology,record.technologyRelationships.join('|'),record.logicalDestination,record.publicationClassification,record.supportedClaims.join('|'),record.collectionContext].map(csvCell).join(','))].join('\n') + '\n';
  const cards = [...technologyMap.values()].map((technology) => {
    const capability = taxonomyBySlug.get(technology.slug);
    return '<article class="capability-card" id="' + technology.slug + '"><span class="tile-code">' + new Set(technology.evidenceIds).size + '</span><h2>' + escapeHtml(technology.label) + '</h2><dl class="claim-details"><div><dt>Skill</dt><dd>' + escapeHtml(capability.skill) + '</dd></div><div><dt>Task</dt><dd>' + escapeHtml(capability.task) + '</dd></div><div><dt>Result</dt><dd>' + escapeHtml(capability.result) + '</dd></div><div><dt>Scope</dt><dd>' + escapeHtml(capability.scope) + '</dd></div><div><dt>Limitations</dt><dd>' + escapeHtml(capability.limitations) + '</dd></div></dl><p><strong>Supported claim:</strong> ' + escapeHtml(technology.claim) + '</p><div class="proof-links"><a href="/assets/data/home-lab-evidence-catalog.json">Inspect supporting catalog records</a></div></article>';
  }).join('');
  const reviewText = 'No high-severity secret patterns were detected. ' + reviewSummary.identifierFindings + ' identifier findings were reviewed through exact-file exceptions or remain in nonpublished source references. ' + reviewSummary.manualReviewRequired + ' binary artifacts remain subject to documented manual-review limitations; OCR was not used.';
  const catalogHtml = pageShell({
    title: 'Home Lab Evidence Catalog | Jeremy Fontenot',
    description: 'Technology-first Home Lab evidence catalog with current and attested source provenance, bounded claims, integrity, duplicate reporting, and sensitive-data review.',
    canonicalPath: 'home-lab/evidence-catalog.html', eyebrow: 'Home Lab evidence organization', headline: 'Personal infrastructure proof organized by technology and source.',
    lead: summary.totals.artifacts + ' physical artifacts are cataloged without moving evidence, deleting duplicates, copying restricted operational material, or overstating personal-lab results.',
    body: '<section class="section" id="capabilities" aria-labelledby="capabilities-title"><div class="section-head reveal"><p class="eyebrow">Capability context</p><h2 id="capabilities-title">Skill, task, result, proof, scope, and limitations stay connected.</h2><p>Result states distinguish directly proven, supported with limitations, configured but not behavior-tested, documented-only, inconclusive, not-tested, and insufficient evidence.</p></div><div class="capability-grid reveal">' + cards + '</div></section><section class="section" aria-labelledby="downloads-title"><div class="section-head reveal"><p class="eyebrow">Evidence contract downloads</p><h2 id="downloads-title">Inspect the complete generated contract.</h2><p>Each physical source has one unique logical destination and reciprocal bounded claims.</p></div><div class="actions"><a class="button primary" href="/assets/data/home-lab-evidence-catalog.json">Open complete JSON catalog</a><a class="button" href="/home-lab/source-to-destination-matrix.csv">Open source matrix</a><a class="button text-button" href="/home-lab/duplicate-groups.json">Review retained duplicates</a></div></section><section class="section" aria-labelledby="review-title"><div class="scope-note-card reveal"><p class="eyebrow">Integrity and review boundaries</p><h2 id="review-title">Source and publication integrity are reported separately.</h2><p>' + escapeHtml(reviewText) + ' Exact source-byte and public-byte duplicate groups are calculated independently; no evidence is removed.</p><div class="inline-actions"><a href="/home-lab/sensitive-data-review.json">Open sensitive-data review</a><a href="/home-lab/authoritative-source-decisions.json">Review source decisions</a></div></div></section>'
  });
  const sensitiveReport = {schemaVersion: 1, policy: {highSeveritySecretMaterial: 'build-failing', publicIdentifiers: 'exact-file reviewed exception required', sourceReferenceIdentifiers: 'reported without clear values', binaryInspection: 'manual review required; OCR not used', valuesInReport: 'redacted; stable fingerprints only'}, summary: reviewSummary, reviewedExceptions: exceptionManifest.exceptions.map(({valueFingerprints, pattern, ...item}) => item), artifacts: reviewEntries.sort((a, b) => a.path.localeCompare(b.path))};
  const duplicateReport = {schemaVersion: 1, note: 'Original-source and published-byte duplicate groups are calculated independently. No files are removed.', sourceGroups, publicGroups};
  const decisions = {schemaVersion: 1, policy: 'The current portfolio preserves established public artifacts. The operations repository remains authoritative and read-only; source references avoid unsafe duplication. Original-portfolio-only artifacts use source references or bounded compatibility derivatives.', sources: [{...currentSource, treatment: 'direct-git-object', artifacts: approved.size},{...config.sources.operationsRepository, treatment: 'source-reference-only', artifacts: attested.records.filter((record) => record.sourceRepository === config.sources.operationsRepository.repository).length},{...config.sources.originalPortfolio, treatment: 'source-reference-or-sanitized-compatibility-derivative', artifacts: attested.records.filter((record) => record.sourceRepository === config.sources.originalPortfolio.repository).length}], attestations: attested.manifests};
  const outputs = new Map([
    ['assets/data/home-lab-evidence-catalog.json', JSON.stringify(summary, null, 2) + '\n'],
    ['home-lab/evidence-catalog.html', catalogHtml],
    ['home-lab/source-to-destination-matrix.csv', matrix],
    ['home-lab/duplicate-groups.json', JSON.stringify(duplicateReport, null, 2) + '\n'],
    ['home-lab/sensitive-data-review.json', JSON.stringify(sensitiveReport, null, 2) + '\n'],
    ['home-lab/authoritative-source-decisions.json', JSON.stringify(decisions, null, 2) + '\n'],
    ...generatedPages.entries()
  ]);
  for (const expected of OUTPUTS) if (!outputs.has(expected)) throw new Error('Missing Home Lab generated output: ' + expected);
  const generatedHashes = {schemaVersion: 1, algorithm: 'sha256', outputs: [...outputs.entries()].map(([outputPath, content]) => ({path: outputPath, size: Buffer.byteLength(content, 'utf8'), hash: sha256(Buffer.from(content, 'utf8')), metadataCoverage: outputPath.endsWith('.html') ? ['integrity','seo'] : ['integrity']}))};
  outputs.set('content/home-lab/generated-output-hashes.json', JSON.stringify(generatedHashes, null, 2) + '\n');
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
        if (!fs.existsSync(absolute) || fs.readFileSync(absolute, 'utf8') !== content) {console.error('Home Lab generated output drift: ' + relativePath); failed = true;}
      } else {
        fs.mkdirSync(path.dirname(absolute), {recursive: true});
        fs.writeFileSync(absolute, content, 'utf8');
      }
    }
    if (failed) process.exit(1);
    console.log('Home Lab evidence organization ' + (checkMode ? 'check' : 'generation') + ' passed: ' + result.summary.totals.artifacts + ' artifacts.');
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = {assertNoApprovedSourceDrift, build, candidateFiles, compatibilityPage, resultStateFor};
