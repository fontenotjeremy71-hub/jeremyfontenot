#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const failures = [];
const requiredTechnologies = ['tenant-administration','entra-id','intune','exchange-online','sharepoint','teams','security-compliance','applications','automation'];
const validEvidenceTypes = new Set(['configuration','exports','inventories','manifests','reports','screenshots','scripts-output','testing','validation','documentation','scripts']);
const validClassifications = new Set(['public-original','sanitized-derivative','metadata-only','source-reference-only']);

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
  } catch (error) {
    failures.push(`${relativePath}: ${error.message}`);
    return null;
  }
}

function requireFile(relativePath, context) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) failures.push(`${context}: missing file ${relativePath}`);
}

const config = readJson('content/microsoft-365/organization.json');
const taxonomy = readJson('content/microsoft-365/technologies.json');
const catalog = readJson('assets/data/microsoft-365-evidence-catalog.json');
const duplicates = readJson('assets/data/microsoft-365-duplicate-report.json');
const preservation = readJson('assets/data/microsoft-365-preservation-report.json');

if (config && taxonomy) {
  if (config.schemaVersion !== 1) failures.push('organization.json: schemaVersion must be 1');
  if (config.phase !== '3A') failures.push('organization.json: phase must be 3A');
  const taxonomySlugs = taxonomy.technologies.map((item) => item.slug);
  for (const slug of requiredTechnologies) {
    if (!taxonomySlugs.includes(slug)) failures.push(`technologies.json: missing required technology ${slug}`);
    if (!config.technologies?.[slug]) failures.push(`organization.json: missing required technology ${slug}`);
    requireFile(`microsoft-365/${slug}/index.html`, `Technology route ${slug}`);
  }
  const claimIds = new Set(Object.keys(config.claims || {}));
  for (const [claimId, claim] of Object.entries(config.claims || {})) {
    if (!claim.claimText || claim.claimText.length < 15) failures.push(`organization.json: claim ${claimId} text is incomplete`);
    if (!['directly-proven','supported-with-limitations','configured-not-behavior-tested','documented-only','insufficient'].includes(claim.supportLevel)) failures.push(`organization.json: claim ${claimId} has unsupported supportLevel ${claim.supportLevel}`);
    if (!claim.scope || !claim.limitations) failures.push(`organization.json: claim ${claimId} must include scope and limitations`);
  }
  for (const [slug, technology] of Object.entries(config.technologies || {})) {
    if (!requiredTechnologies.includes(slug)) failures.push(`organization.json: unsupported technology ${slug}`);
    if (!technology.jobRelevance || technology.jobRelevance.length < 20) failures.push(`organization.json: ${slug} jobRelevance is incomplete`);
    if (!Array.isArray(technology.claimIds) || technology.claimIds.length === 0) failures.push(`organization.json: ${slug} must define claimIds`);
    for (const claimId of technology.claimIds || []) if (!claimIds.has(claimId)) failures.push(`organization.json: ${slug} references unknown claim ${claimId}`);
    if (!Array.isArray(technology.featuredProofs) || technology.featuredProofs.length === 0) failures.push(`organization.json: ${slug} must define featuredProofs`);
    for (const route of technology.featuredProofs || []) {
      if (!route.startsWith('/')) failures.push(`organization.json: ${slug} featured proof must be root-relative: ${route}`);
      else requireFile(route.replace(/^\//, ''), `Featured proof for ${slug}`);
    }
  }
}

if (catalog) {
  if (!Array.isArray(catalog.records) || catalog.records.length === 0) failures.push('catalog: records must be nonempty');
  const ids = new Set();
  const paths = new Set();
  for (const [index, record] of (catalog.records || []).entries()) {
    const context = `catalog.records[${index}]`;
    for (const field of ['id','title','technologies','evidenceType','evidenceSet','sourceRepository','sourceCommit','sourcePath','sourceVerificationMethod','collectionContext','hashAlgorithm','hash','supportedClaims','skill','task','result','scope','limitations','publicationClassification','preservationState','publicRoute','publicPath']) {
      if (!(field in record)) failures.push(`${context}: missing ${field}`);
    }
    if (ids.has(record.id)) failures.push(`${context}: duplicate id ${record.id}`);
    ids.add(record.id);
    if (paths.has(record.publicPath)) failures.push(`${context}: duplicate publicPath ${record.publicPath}`);
    paths.add(record.publicPath);
    if (!Array.isArray(record.technologies) || record.technologies.length === 0) failures.push(`${context}: technologies must be nonempty`);
    for (const slug of record.technologies || []) if (!requiredTechnologies.includes(slug)) failures.push(`${context}: unsupported technology ${slug}`);
    if (!validEvidenceTypes.has(record.evidenceType)) failures.push(`${context}: unsupported evidenceType ${record.evidenceType}`);
    if (!validClassifications.has(record.publicationClassification)) failures.push(`${context}: unsupported publicationClassification ${record.publicationClassification}`);
    if (!Array.isArray(record.supportedClaims) || record.supportedClaims.length === 0) failures.push(`${context}: supportedClaims must be nonempty`);
    for (const claimId of record.supportedClaims || []) if (!config.claims?.[claimId]) failures.push(`${context}: unknown supported claim ${claimId}`);
    if (!/^[a-f0-9]{64}$/i.test(record.hash || '')) failures.push(`${context}: invalid SHA-256`);
    if ('recordedSourceHash' in record) {
      if (!/^[a-f0-9]{64}$/i.test(record.recordedSourceHash || '')) failures.push(`${context}: invalid recorded source SHA-256`);
      if (typeof record.recordedSourceHashMatch !== 'boolean') failures.push(`${context}: recordedSourceHashMatch must be boolean`);
      if (record.recordedSourceHashMatch === false && record.publicationClassification !== 'sanitized-derivative') failures.push(`${context}: byte-different public files must be classified as sanitized-derivative`);
    }
    if (!record.publicRoute?.startsWith('/')) failures.push(`${context}: invalid publicRoute`);
    else requireFile(record.publicRoute.replace(/^\//, ''), context);
    if ('excerpt' in record) failures.push(`${context}: public catalog must not publish source excerpts`);
  }
  if (catalog.totals?.sharepointArtifacts !== 802) failures.push(`catalog: expected 802 preserved SharePoint artifacts, found ${catalog.totals?.sharepointArtifacts}`);
  for (const slug of requiredTechnologies) if (!catalog.countsByTechnology?.[slug]) failures.push(`catalog: no artifacts mapped to ${slug}`);
}

if (duplicates) {
  if (!Array.isArray(duplicates.groups)) failures.push('duplicate report: groups must be an array');
  for (const [index, group] of (duplicates.groups || []).entries()) {
    if (!group.retained) failures.push(`duplicate report groups[${index}]: duplicate paths must remain retained`);
    if (!Array.isArray(group.paths) || group.paths.length < 2) failures.push(`duplicate report groups[${index}]: expected at least two paths`);
  }
}

if (preservation) {
  if (preservation.sharepointPreservation?.inventoryRows !== 802) failures.push('preservation report: expected 802 SharePoint inventory rows');
  if (preservation.sharepointPreservation?.filesComparedWithInventory !== 802) failures.push('preservation report: expected 802 SharePoint inventory comparisons');
  if ((preservation.sharepointPreservation?.hashMatches || 0) + (preservation.sharepointPreservation?.hashMismatches || 0) !== 802) failures.push('preservation report: SharePoint match and mismatch counts must account for every inventory row');
  if (preservation.sharepointPreservation?.missingFiles !== 0) failures.push('preservation report: preserved SharePoint routes must remain present');
  if (!preservation.sharepointPreservation?.originalInventoryGitBlobMatch) failures.push('preservation report: original inventory Git blob must match');
  if (preservation.duplicateHandling?.removalAuthorized !== false) failures.push('preservation report: duplicate removal must remain unauthorized');
  if (preservation.sensitiveDataReview?.newRawArtifactsImported !== 0) failures.push('preservation report: no new raw artifact import is allowed');
  if (preservation.routeCompatibility?.oldRoutesRemoved !== 0) failures.push('preservation report: old routes must remain intact');
}

for (const relativePath of [
  'microsoft-365/evidence-catalog/index.html',
  'microsoft-365/preservation/index.html',
  'evidence-library/preserved-sharepoint/index.html',
  'assets/data/microsoft-365-migration-matrix.csv'
]) requireFile(relativePath, 'Phase 3A output');

if (failures.length) {
  for (const failure of [...new Set(failures)].sort()) console.error(failure);
  console.error(`Microsoft 365 organization validation failed with ${failures.length} finding(s).`);
  process.exit(1);
}

console.log(`Microsoft 365 organization validation passed (${catalog.records.length} unique artifacts; ${catalog.totals.sharepointArtifacts} preserved SharePoint exports).`);
