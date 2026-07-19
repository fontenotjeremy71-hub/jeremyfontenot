#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas/site-foundation.schema.json'), 'utf8'));
const evidenceFixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/site-foundation/evidence-records.json'), 'utf8'));
const relationshipFixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/site-foundation/claim-relationships.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/m365-evidence-catalog.json'), 'utf8'));
const homeLabCatalog = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/home-lab-evidence-catalog.json'), 'utf8'));
const failures = [];

const allEvidenceRecords = [...evidenceFixture.records, ...catalog.records, ...homeLabCatalog.records];
const allRelationships = [...relationshipFixture.relationships, ...catalog.claimRelationships, ...homeLabCatalog.claimRelationships];
const evidenceById = new Map(allEvidenceRecords.map((record) => [record.id, record]));
const evidenceByPhysicalSource = new Map();
const relationshipByClaim = new Map();
const supportLevels = new Set(schema.$defs.claimRelationship.properties.supportLevel.enum);

for (const [index, evidence] of allEvidenceRecords.entries()) {
  const physicalKey = `${evidence.sourceRepository}@${evidence.sourceCommit}:${String(evidence.sourcePath).replaceAll('\\', '/')}`.toLowerCase();
  if (evidenceByPhysicalSource.has(physicalKey)) {
    failures.push(`evidence records[${index}]: physical source duplicates ${evidenceByPhysicalSource.get(physicalKey)} at ${physicalKey}`);
  } else {
    evidenceByPhysicalSource.set(physicalKey, evidence.id);
  }
}

for (const [index, relationship] of allRelationships.entries()) {
  const context = `claim relationships[${index}]`;
  if (relationshipByClaim.has(relationship.claimId)) failures.push(`${context}: duplicate claim id ${relationship.claimId}`);
  relationshipByClaim.set(relationship.claimId, relationship);

  if (!supportLevels.has(relationship.supportLevel)) failures.push(`${context}: unsupported supportLevel ${relationship.supportLevel}`);

  if (!Array.isArray(relationship.evidenceIds) || relationship.evidenceIds.length === 0) {
    failures.push(`${context}: evidenceIds must contain at least one evidence record`);
    continue;
  }

  const uniqueEvidenceIds = new Set(relationship.evidenceIds);
  if (uniqueEvidenceIds.size !== relationship.evidenceIds.length) failures.push(`${context}: evidenceIds must not contain duplicates`);

  for (const evidenceId of relationship.evidenceIds) {
    const evidence = evidenceById.get(evidenceId);
    if (!evidence) {
      failures.push(`${context}: unknown evidence id ${evidenceId}`);
      continue;
    }
    if (!Array.isArray(evidence.supportedClaims) || !evidence.supportedClaims.includes(relationship.claimId)) {
      failures.push(`${context}: evidence ${evidenceId} does not list claim ${relationship.claimId}`);
    }
  }
}

for (const [evidenceId, evidence] of evidenceById.entries()) {
  if (!Array.isArray(evidence.supportedClaims) || evidence.supportedClaims.length === 0) {
    failures.push(`evidence ${evidenceId}: supportedClaims must contain at least one claim`);
    continue;
  }

  const uniqueClaimIds = new Set(evidence.supportedClaims);
  if (uniqueClaimIds.size !== evidence.supportedClaims.length) failures.push(`evidence ${evidenceId}: supportedClaims must not contain duplicates`);

  for (const claimId of evidence.supportedClaims) {
    const relationship = relationshipByClaim.get(claimId);
    if (!relationship) {
      failures.push(`evidence ${evidenceId}: supported claim ${claimId} has no relationship`);
      continue;
    }
    if (!Array.isArray(relationship.evidenceIds) || !relationship.evidenceIds.includes(evidenceId)) {
      failures.push(`evidence ${evidenceId}: claim ${claimId} does not list the evidence record`);
    }
  }
}

if (failures.length) {
  for (const failure of [...new Set(failures)].sort()) console.error(failure);
  process.exit(1);
}
console.log(`Claim relationship validation passed, including ${catalog.records.length} Microsoft 365 and ${homeLabCatalog.records.length} Home Lab records.`);
