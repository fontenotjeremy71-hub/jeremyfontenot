#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas/site-foundation.schema.json'), 'utf8'));
const evidenceFixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/site-foundation/evidence-records.json'), 'utf8'));
const relationshipFixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/site-foundation/claim-relationships.json'), 'utf8'));
const failures = [];

const evidenceById = new Map(evidenceFixture.records.map((record) => [record.id, record]));
const relationshipByClaim = new Map();
const supportLevels = new Set(schema.$defs.claimRelationship.properties.supportLevel.enum);

for (const [index, relationship] of relationshipFixture.relationships.entries()) {
  const context = `claim relationships[${index}]`;
  if (relationshipByClaim.has(relationship.claimId)) failures.push(`${context}: duplicate claim id ${relationship.claimId}`);
  relationshipByClaim.set(relationship.claimId, relationship);

  if (!supportLevels.has(relationship.supportLevel)) failures.push(`${context}: unsupported supportLevel ${relationship.supportLevel}`);

  for (const evidenceId of relationship.evidenceIds || []) {
    const evidence = evidenceById.get(evidenceId);
    if (!evidence) {
      failures.push(`${context}: unknown evidence id ${evidenceId}`);
      continue;
    }
    if (!(evidence.supportedClaims || []).includes(relationship.claimId)) {
      failures.push(`${context}: evidence ${evidenceId} does not list claim ${relationship.claimId}`);
    }
  }
}

for (const [evidenceId, evidence] of evidenceById.entries()) {
  for (const claimId of evidence.supportedClaims || []) {
    const relationship = relationshipByClaim.get(claimId);
    if (!relationship) {
      failures.push(`evidence ${evidenceId}: supported claim ${claimId} has no relationship`);
      continue;
    }
    if (!(relationship.evidenceIds || []).includes(evidenceId)) {
      failures.push(`evidence ${evidenceId}: claim ${claimId} does not list the evidence record`);
    }
  }
}

if (failures.length) {
  for (const failure of [...new Set(failures)].sort()) console.error(failure);
  process.exit(1);
}
console.log('Claim relationship validation passed.');
