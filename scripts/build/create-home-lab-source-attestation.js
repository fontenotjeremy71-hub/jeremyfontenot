#!/usr/bin/env node
'use strict';

const {execFileSync} = require('node:child_process');
const path = require('node:path');
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

function readGitObjects(repositoryPath, commit, sourcePaths) {
  const normalizedPaths = [...new Set(sourcePaths.map(toPosix))];
  const input = normalizedPaths.map((sourcePath) => commit + ':' + sourcePath).join('\n') + '\n';
  const output = execFileSync('git', ['cat-file', '--batch'], {
    cwd: repositoryPath,
    encoding: null,
    input,
    maxBuffer: 1024 * 1024 * 1024,
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

function listTree(repositoryPath, commit) {
  const output = execFileSync('git', ['ls-tree', '-rz', '--full-tree', commit], {
    cwd: repositoryPath,
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024
  });
  return output.split('\0').filter(Boolean).map((entry) => {
    const match = entry.match(/^(\d+)\s+(\w+)\s+([0-9a-f]+)\t(.+)$/s);
    if (!match) throw new Error('Unexpected git ls-tree entry: ' + entry);
    return {mode: match[1], type: match[2], gitBlobSha1: match[3], path: toPosix(match[4])};
  }).filter((entry) => entry.type === 'blob');
}

function main() {
  const repositoryPath = path.resolve(argument('--repository-path') || '');
  const sourceRepository = argument('--source-repository');
  const sourceCommit = argument('--source-commit');
  const includePrefixes = argumentsFor('--include-prefix').map((value) => toPosix(value).replace(/\/+$/, '') + '/');
  const includeFiles = new Set(argumentsFor('--include-file').map(toPosix));
  const pathPatternSource = argument('--path-pattern');
  const pathPattern = pathPatternSource ? new RegExp(pathPatternSource, 'i') : null;
  if (!repositoryPath || !sourceRepository || !/^[^/]+\/[^/]+$/.test(sourceRepository) || !/^[0-9a-f]{40}$/.test(sourceCommit || '')) {
    throw new Error('Required arguments: --repository-path, --source-repository owner/repository, and --source-commit SHA.');
  }
  if (!includePrefixes.length && !includeFiles.size) throw new Error('At least one --include-prefix or --include-file is required.');

  const tree = listTree(repositoryPath, sourceCommit);
  const selected = tree.filter((entry) =>
    !entry.path.endsWith('/.gitkeep') && entry.path !== '.gitkeep' &&
    (includeFiles.has(entry.path) || includePrefixes.some((prefix) => entry.path.startsWith(prefix))) &&
    (!pathPattern || pathPattern.test(entry.path))
  );
  const exclusions = tree.filter((entry) =>
    (entry.path.endsWith('/.gitkeep') || entry.path === '.gitkeep') &&
    (includeFiles.has(entry.path) || includePrefixes.some((prefix) => entry.path.startsWith(prefix)))
  ).map((entry) => ({path: entry.path, reason: 'Empty-directory placeholder with no evidence content.'}));
  if (!selected.length) throw new Error('Source selection is empty.');
  const buffers = readGitObjects(repositoryPath, sourceCommit, selected.map((entry) => entry.path));
  const records = selected.map((entry) => {
    const buffer = buffers.get(entry.path);
    const review = reviewArtifact(buffer, entry.path, null, {exceptions: []}, new Set());
    if (review.highSeverityFindings) {
      throw new Error('High-severity source finding requires remediation before attestation: ' + entry.path);
    }
    return {
      sourcePath: entry.path,
      gitBlobSha1: entry.gitBlobSha1,
      size: buffer.length,
      sha256: sha256(buffer),
      technologies: technologiesFor(entry.path),
      evidenceType: evidenceType(entry.path),
      sensitiveDataReview: {
        status: review.status,
        highSeverityFindings: review.highSeverityFindings,
        identifierFindings: review.identifierFindings,
        manualReviewRequired: review.manualReviewRequired,
        findings: review.findings
      }
    };
  }).sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
  const summary = {
    schemaVersion: 1,
    sourceRepository,
    sourceCommit,
    sourceVerificationMethod: 'manifest-attested-source',
    selection: {
      approvedRecursiveRoots: includePrefixes.map((value) => value.replace(/\/$/, '')),
      approvedIndividualFiles: [...includeFiles].sort(),
      pathPattern: pathPatternSource,
      reviewedExclusions: exclusions.sort((a, b) => a.path.localeCompare(b.path))
    },
    totals: {
      artifacts: records.length,
      manualReviewRequired: records.filter((record) => record.sensitiveDataReview.manualReviewRequired).length,
      highSeveritySecretFindings: 0,
      identifierFindings: records.reduce((sum, record) => sum + record.sensitiveDataReview.identifierFindings, 0)
    },
    records
  };
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
}

try {
  main();
} catch (error) {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
}
