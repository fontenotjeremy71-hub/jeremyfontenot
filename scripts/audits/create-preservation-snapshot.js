#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');
const defaultOutput = 'artifacts/audits/siteone-evidence-integrity/pre-change-preservation-snapshot.json';
const evidenceRoots = ['assets/evidence/', 'docs/projects/', 'evidence/', 'evidence-library/'];
const generatedManifestPaths = [
  'content/microsoft-365/generated-output-hashes.json',
  'content/home-lab/generated-output-hashes.json',
  'content/site/generated-foundation-hashes.json',
  'content/site/generated-skill-map-hashes.json'
];

function toPosix(value) {
  return String(value).replaceAll('\\', '/').replace(/^\.\/+/, '');
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function runGit(args, {repositoryRoot = root, encoding = 'utf8', allowFailure = false} = {}) {
  const result = spawnSync('git', args, {
    cwd: repositoryRoot,
    encoding,
    maxBuffer: 256 * 1024 * 1024,
    windowsHide: true
  });
  if (!allowFailure && result.status !== 0) {
    const stderr = Buffer.isBuffer(result.stderr) ? result.stderr.toString('utf8') : String(result.stderr || '');
    throw new Error(`git ${args.join(' ')} failed: ${stderr.trim()}`);
  }
  return result;
}

function resolveRef(ref = 'HEAD', repositoryRoot = root) {
  const result = runGit(['rev-parse', '--verify', `${ref}^{commit}`], {repositoryRoot});
  return String(result.stdout).trim();
}

function trackedFilesAtRef(ref = 'HEAD', repositoryRoot = root) {
  const commit = resolveRef(ref, repositoryRoot);
  const result = runGit(['ls-tree', '-r', '-z', '--name-only', commit], {
    repositoryRoot,
    encoding: null
  });
  return result.stdout.toString('utf8')
    .split('\0')
    .filter(Boolean)
    .map(toPosix)
    .sort();
}

function blobSpec(ref, repositoryPath, repositoryRoot = root) {
  return `${resolveRef(ref, repositoryRoot)}:${toPosix(repositoryPath)}`;
}

function blobExistsAtRef(ref, repositoryPath, repositoryRoot = root) {
  const result = runGit(['cat-file', '-e', blobSpec(ref, repositoryPath, repositoryRoot)], {
    repositoryRoot,
    allowFailure: true
  });
  return result.status === 0;
}

function readBlobAtRef(ref, repositoryPath, repositoryRoot = root) {
  const result = runGit(['cat-file', 'blob', blobSpec(ref, repositoryPath, repositoryRoot)], {
    repositoryRoot,
    encoding: null
  });
  return result.stdout;
}

function readJsonAtRef(ref, repositoryPath, repositoryRoot = root) {
  return JSON.parse(readBlobAtRef(ref, repositoryPath, repositoryRoot).toString('utf8'));
}

function generatedEvidencePaths(ref = 'HEAD', repositoryRoot = root) {
  const generated = new Set(['evidence-library/integrity/evidence-hashes.json']);
  for (const relative of generatedManifestPaths) {
    if (!blobExistsAtRef(ref, relative, repositoryRoot)) continue;
    const manifest = readJsonAtRef(ref, relative, repositoryRoot);
    const collection = manifest.outputs || manifest.files || [];
    if (Array.isArray(collection)) {
      for (const item of collection) if (item.path) generated.add(toPosix(item.path));
    } else {
      for (const outputPath of Object.keys(collection)) generated.add(toPosix(outputPath));
    }
  }

  const evidencePagesPath = 'scripts/config/evidence-pages.json';
  if (blobExistsAtRef(ref, evidencePagesPath, repositoryRoot)) {
    const config = readJsonAtRef(ref, evidencePagesPath, repositoryRoot);
    for (const item of config.pages || config) {
      if (item.output) generated.add(toPosix(item.output));
      else if (item.source) generated.add(toPosix(item.source).replace(/\.md$/i, '.html'));
    }
  }
  return generated;
}

function catalogTotals(ref = 'HEAD', repositoryRoot = root) {
  const m365 = readJsonAtRef(ref, 'assets/data/m365-evidence-catalog.json', repositoryRoot);
  const homeLab = readJsonAtRef(ref, 'assets/data/home-lab-evidence-catalog.json', repositoryRoot);
  return {
    microsoft365: m365.records.length,
    preservedSharePoint: m365.records.filter((record) => record.collection === 'preserved-sharepoint-export').length,
    homeLab: homeLab.records.length,
    combinedRelationships: m365.records.length + homeLab.records.length
  };
}

function sitemapRoutes(ref = 'HEAD', repositoryRoot = root) {
  const xml = readBlobAtRef(ref, 'sitemap.xml', repositoryRoot).toString('utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort();
}

function currentBranch(repositoryRoot = root) {
  const result = runGit(['branch', '--show-current'], {repositoryRoot});
  return String(result.stdout).trim();
}

function dirtyTrackedPaths(repositoryRoot = root) {
  const paths = new Set();
  for (const args of [
    ['diff', '--name-only', '-z'],
    ['diff', '--cached', '--name-only', '-z']
  ]) {
    const result = runGit(args, {repositoryRoot, encoding: null});
    for (const item of result.stdout.toString('utf8').split('\0').filter(Boolean)) paths.add(toPosix(item));
  }
  return [...paths].sort();
}

function compareProtectedBlobs({
  baselineRef,
  targetRef = 'HEAD',
  records,
  repositoryRoot = root,
  includeDirtyPaths = true
}) {
  const baselineCommit = resolveRef(baselineRef, repositoryRoot);
  const targetCommit = resolveRef(targetRef, repositoryRoot);
  const missing = [];
  const baselineMissing = [];
  const drifted = [];
  const snapshotHashMismatches = [];
  const protectedRecords = records.filter((record) => record.protectedFromByteDrift);

  for (const record of records) {
    if (!blobExistsAtRef(targetCommit, record.path, repositoryRoot)) {
      missing.push(record.path);
      continue;
    }
    if (!record.protectedFromByteDrift) continue;
    if (!blobExistsAtRef(baselineCommit, record.path, repositoryRoot)) {
      baselineMissing.push(record.path);
      continue;
    }

    const expected = sha256(readBlobAtRef(baselineCommit, record.path, repositoryRoot));
    const actual = sha256(readBlobAtRef(targetCommit, record.path, repositoryRoot));
    if (record.sha256 && record.sha256 !== expected) {
      snapshotHashMismatches.push({path: record.path, snapshot: record.sha256, baselineBlob: expected});
    }
    if (actual !== expected) drifted.push({path: record.path, expected, actual});
  }

  const protectedPathSet = new Set(protectedRecords.map((record) => record.path));
  const dirtyProtectedPaths = includeDirtyPaths
    ? dirtyTrackedPaths(repositoryRoot).filter((repositoryPath) => protectedPathSet.has(repositoryPath))
    : [];

  return {
    baselineCommit,
    targetCommit,
    protectedFilesCompared: protectedRecords.length,
    missing,
    baselineMissing,
    drifted,
    dirtyProtectedPaths,
    snapshotHashMismatches
  };
}

function createSnapshot(ref = 'HEAD', repositoryRoot = root) {
  const commit = resolveRef(ref, repositoryRoot);
  const tracked = trackedFilesAtRef(commit, repositoryRoot);
  const generated = generatedEvidencePaths(commit, repositoryRoot);
  const evidenceFiles = tracked.filter((file) => evidenceRoots.some((prefix) => file.startsWith(prefix)));
  const files = evidenceFiles.map((file) => {
    const buffer = readBlobAtRef(commit, file, repositoryRoot);
    const generatedOutput = generated.has(file);
    const preservedSharePointDerivative = file.startsWith('evidence-library/preserved-sharepoint/source/');
    return {
      path: file,
      size: buffer.length,
      sha256: sha256(buffer),
      preservationClass: generatedOutput ? 'generated-output' : (preservedSharePointDerivative ? 'attested-public-derivative' : 'source-of-record'),
      protectedFromByteDrift: !generatedOutput
    };
  });

  return {
    schemaVersion: 2,
    snapshotType: 'pre-change-evidence-preservation',
    hashSource: 'git-blob',
    commit,
    sourceRef: ref,
    branch: currentBranch(repositoryRoot),
    trackedFileCount: tracked.length,
    evidenceFileCount: evidenceFiles.length,
    protectedFileCount: files.filter((file) => file.protectedFromByteDrift).length,
    preservationRoots: evidenceRoots,
    catalogTotals: catalogTotals(commit, repositoryRoot),
    publicEvidenceRoutes: {
      sitemap: sitemapRoutes(commit, repositoryRoot)
    },
    robotsTxtSha256: sha256(readBlobAtRef(commit, 'robots.txt', repositoryRoot)),
    deterministicGeneratedOutputs: [...generated].sort(),
    files
  };
}

function verifySnapshot(relativePath, {targetRef = 'HEAD', repositoryRoot = root} = {}) {
  const snapshot = JSON.parse(fs.readFileSync(path.resolve(repositoryRoot, relativePath), 'utf8'));
  const comparison = compareProtectedBlobs({
    baselineRef: snapshot.commit,
    targetRef,
    records: snapshot.files,
    repositoryRoot
  });

  const result = {
    status: comparison.missing.length
      || comparison.baselineMissing.length
      || comparison.drifted.length
      || comparison.dirtyProtectedPaths.length
      ? 'FAIL'
      : 'PASS',
    baselineCommit: comparison.baselineCommit,
    targetCommit: comparison.targetCommit,
    evidenceFilesBefore: snapshot.evidenceFileCount,
    evidenceFilesPresent: snapshot.files.length - comparison.missing.length,
    protectedFilesCompared: comparison.protectedFilesCompared,
    missing: comparison.missing,
    baselineMissing: comparison.baselineMissing,
    drifted: comparison.drifted,
    dirtyProtectedPaths: comparison.dirtyProtectedPaths,
    snapshotHashMismatches: comparison.snapshotHashMismatches
  };

  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (result.status !== 'PASS') process.exitCode = 1;
  return result;
}

function main() {
  const verify = argument('--verify');
  if (verify) return verifySnapshot(verify, {targetRef: argument('--target-ref', 'HEAD')});
  const output = toPosix(argument('--output', defaultOutput));
  const ref = argument('--ref', 'HEAD');
  const absolute = path.join(root, output);
  fs.mkdirSync(path.dirname(absolute), {recursive: true});
  fs.writeFileSync(absolute, JSON.stringify(createSnapshot(ref), null, 2) + '\n', 'utf8');
  console.log(`Wrote Git-blob preservation snapshot for ${resolveRef(ref)}: ${output}`);
}

if (require.main === module) main();

module.exports = {
  blobExistsAtRef,
  compareProtectedBlobs,
  createSnapshot,
  dirtyTrackedPaths,
  readBlobAtRef,
  resolveRef,
  trackedFilesAtRef,
  verifySnapshot
};
