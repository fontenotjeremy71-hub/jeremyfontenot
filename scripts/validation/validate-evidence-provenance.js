#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');
const currentRepository = 'fontenotjeremy71-hub/jeremyfontenot';
const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas/site-foundation.schema.json'), 'utf8'));
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/site-foundation/evidence-records.json'), 'utf8'));
const failures = [];

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(header).update(buffer).digest('hex');
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function calculateHash(buffer, algorithm, context) {
  if (algorithm === 'git-blob-sha1') return gitBlobSha(buffer);
  if (algorithm === 'sha256') return sha256(buffer);
  failures.push(`${context}: unsupported hash algorithm ${algorithm}`);
  return null;
}

function readGitObject(commit, sourcePath, context) {
  const objectSpec = `${commit}:${sourcePath.replaceAll('\\', '/')}`;
  try {
    return execFileSync('git', ['show', objectSpec], {
      cwd: root,
      encoding: null,
      maxBuffer: 256 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe']
    });
  } catch {
    failures.push(`${context}: Git object does not exist at ${objectSpec}`);
    return null;
  }
}

function section(text, heading) {
  const marker = `## ${heading}`;
  const start = text.toLowerCase().indexOf(marker.toLowerCase());
  if (start < 0) return null;
  const after = text.slice(start + marker.length).split(/\r?\n/);
  const value = after.find((line) => line.trim());
  return value ? value.trim().replace(/^`|`$/g, '') : null;
}

function validateDirect(record, context) {
  if (record.sourceRepository !== currentRepository) {
    failures.push(`${context}: external sources cannot use direct-git-object verification`);
    return;
  }
  if (!fs.existsSync(path.join(root, record.sourcePath))) failures.push(`${context}: working-tree source path is missing`);
  const source = readGitObject(record.sourceCommit, record.sourcePath, context);
  if (!source) return;
  const actual = calculateHash(source, record.hashAlgorithm, context);
  if (actual && actual.toLowerCase() !== String(record.hash).toLowerCase()) failures.push(`${context}: source hash mismatch`);
}

function validateAttestation(record, context) {
  for (const field of ['attestationPath', 'attestationCommit', 'attestationHashAlgorithm', 'attestationHash']) {
    if (!(field in record)) failures.push(`${context}: missing required field ${field}`);
  }
  if (record.sourceRepository === currentRepository) failures.push(`${context}: manifest-attested-source requires an external authoritative repository`);
  if (record.hashAlgorithm !== 'sha256') failures.push(`${context}: manifest-attested-source requires a SHA-256 source hash`);
  if (record.publicationClassification === 'public-original') failures.push(`${context}: an attested source cannot be classified as public-original`);

  const attestation = readGitObject(record.attestationCommit, record.attestationPath, `${context} attestation`);
  if (!attestation) return;
  const attestationActual = calculateHash(attestation, record.attestationHashAlgorithm, `${context} attestation`);
  if (attestationActual && attestationActual.toLowerCase() !== String(record.attestationHash).toLowerCase()) failures.push(`${context}: attestation hash mismatch`);

  const text = attestation.toString('utf8');
  const sourceHashMatch = text.match(/## Source file SHA-256[\s\S]*?([a-f0-9]{64})/i);
  const sourceHash = sourceHashMatch ? sourceHashMatch[1].toLowerCase() : null;
  if (section(text, 'Source repository') !== record.sourceRepository) failures.push(`${context}: attested repository mismatch`);
  if (section(text, 'Source commit') !== record.sourceCommit) failures.push(`${context}: attested commit mismatch`);
  if (section(text, 'Source path') !== record.sourcePath) failures.push(`${context}: attested path mismatch`);
  if (sourceHash !== String(record.hash).toLowerCase()) failures.push(`${context}: attested source hash mismatch`);
}

const evidenceDefinition = schema.$defs.evidenceRecord;
const methods = new Set(evidenceDefinition.properties.sourceVerificationMethod.enum);
const classifications = new Set(evidenceDefinition.properties.publicationClassification.enum);
const algorithms = new Set(evidenceDefinition.properties.hashAlgorithm.enum);

for (const [index, record] of fixture.records.entries()) {
  const context = `evidence records[${index}]`;
  if (!methods.has(record.sourceVerificationMethod)) failures.push(`${context}: unsupported sourceVerificationMethod ${record.sourceVerificationMethod}`);
  if (!classifications.has(record.publicationClassification)) failures.push(`${context}: unsupported publicationClassification ${record.publicationClassification}`);
  if (!algorithms.has(record.hashAlgorithm)) failures.push(`${context}: unsupported hashAlgorithm ${record.hashAlgorithm}`);

  if (record.sourceVerificationMethod === 'direct-git-object') validateDirect(record, context);
  if (record.sourceVerificationMethod === 'manifest-attested-source') validateAttestation(record, context);
}

if (failures.length) {
  for (const failure of [...new Set(failures)].sort()) console.error(failure);
  process.exit(1);
}
console.log('Evidence provenance validation passed.');
