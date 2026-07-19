#!/usr/bin/env node
'use strict';

const {execFileSync} = require('node:child_process');
const {
  evidenceType,
  reviewArtifact,
  sha256,
  technologiesFor,
  toPosix
} = require('../lib/home-lab-evidence.js');

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function argumentsFor(name) {
  const values = [];
  for (let index = 0; index < process.argv.length; index += 1) {
    if (process.argv[index] === name && process.argv[index + 1]) values.push(process.argv[index + 1]);
  }
  return values;
}

function ghJson(endpoint) {
  return JSON.parse(execFileSync('gh', ['api', endpoint], {encoding: 'utf8', maxBuffer: 256 * 1024 * 1024}));
}

function main() {
  const sourceRepository = argument('--source-repository');
  const sourceCommit = argument('--source-commit');
  const includeFiles = [...new Set(argumentsFor('--include-file').map(toPosix))].sort();
  if (!sourceRepository || !/^[^/]+\/[^/]+$/.test(sourceRepository) || !/^[0-9a-f]{40}$/.test(sourceCommit || '') || !includeFiles.length) {
    throw new Error('Required arguments: --source-repository owner/repository, --source-commit SHA, and one or more --include-file values.');
  }
  const tree = ghJson('repos/' + sourceRepository + '/git/trees/' + sourceCommit + '?recursive=1');
  if (tree.truncated) throw new Error('GitHub tree response is truncated.');
  const blobs = new Map(tree.tree.filter((entry) => entry.type === 'blob').map((entry) => [toPosix(entry.path), entry]));
  const missing = includeFiles.filter((file) => !blobs.has(file));
  if (missing.length) throw new Error('GitHub source paths are missing:\n' + missing.join('\n'));
  const records = includeFiles.map((sourcePath) => {
    const entry = blobs.get(sourcePath);
    const blob = ghJson('repos/' + sourceRepository + '/git/blobs/' + entry.sha);
    const buffer = Buffer.from(String(blob.content || '').replace(/\s+/g, ''), 'base64');
    if (buffer.length !== Number(entry.size)) throw new Error('GitHub blob size mismatch: ' + sourcePath);
    const review = reviewArtifact(buffer, sourcePath, null, {exceptions: []}, new Set());
    if (review.highSeverityFindings) throw new Error('High-severity source finding requires remediation before attestation: ' + sourcePath);
    return {
      sourcePath,
      gitBlobSha1: entry.sha,
      size: buffer.length,
      sha256: sha256(buffer),
      technologies: technologiesFor(sourcePath),
      evidenceType: evidenceType(sourcePath),
      sensitiveDataReview: {
        status: review.status,
        highSeverityFindings: review.highSeverityFindings,
        identifierFindings: review.identifierFindings,
        manualReviewRequired: review.manualReviewRequired,
        findings: review.findings
      }
    };
  });
  process.stdout.write(JSON.stringify({
    schemaVersion: 1,
    sourceRepository,
    sourceCommit,
    sourceVerificationMethod: 'manifest-attested-source',
    selection: {approvedRecursiveRoots: [], approvedIndividualFiles: includeFiles, pathPattern: null, reviewedExclusions: []},
    totals: {
      artifacts: records.length,
      manualReviewRequired: records.filter((record) => record.sensitiveDataReview.manualReviewRequired).length,
      highSeveritySecretFindings: 0,
      identifierFindings: records.reduce((sum, record) => sum + record.sensitiveDataReview.identifierFindings, 0)
    },
    records
  }, null, 2) + '\n');
}

try {
  main();
} catch (error) {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
}
