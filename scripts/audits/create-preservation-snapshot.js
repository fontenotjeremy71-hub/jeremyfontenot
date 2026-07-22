#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');
const defaultOutput = 'artifacts/audits/siteone-evidence-integrity/pre-change-preservation-snapshot.json';
const evidenceRoots = ['assets/evidence/', 'docs/projects/', 'evidence/', 'evidence-library/'];

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

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z'], {cwd: root})
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .map(toPosix)
    .sort();
}

function generatedEvidencePaths() {
  const generated = new Set(['evidence-library/integrity/evidence-hashes.json']);
  for (const relative of [
    'content/microsoft-365/generated-output-hashes.json',
    'content/home-lab/generated-output-hashes.json',
    'content/site/generated-foundation-hashes.json',
    'content/site/generated-skill-map-hashes.json'
  ]) {
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) continue;
    const manifest = JSON.parse(fs.readFileSync(absolute, 'utf8'));
    const collection = manifest.outputs || manifest.files || [];
    if (Array.isArray(collection)) {
      for (const item of collection) if (item.path) generated.add(toPosix(item.path));
    } else {
      for (const outputPath of Object.keys(collection)) generated.add(toPosix(outputPath));
    }
  }
  const evidencePagesPath = path.join(root, 'scripts/config/evidence-pages.json');
  if (fs.existsSync(evidencePagesPath)) {
    const config = JSON.parse(fs.readFileSync(evidencePagesPath, 'utf8'));
    for (const item of config.pages || config) {
      if (item.output) generated.add(toPosix(item.output));
      else if (item.source) generated.add(toPosix(item.source).replace(/\.md$/i, '.html'));
    }
  }
  return generated;
}

function catalogTotals() {
  const m365 = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/m365-evidence-catalog.json'), 'utf8'));
  const homeLab = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/home-lab-evidence-catalog.json'), 'utf8'));
  return {
    microsoft365: m365.records.length,
    preservedSharePoint: m365.records.filter((record) => record.collection === 'preserved-sharepoint-export').length,
    homeLab: homeLab.records.length,
    combinedRelationships: m365.records.length + homeLab.records.length
  };
}

function sitemapRoutes() {
  const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort();
}

function createSnapshot() {
  const tracked = trackedFiles();
  const generated = generatedEvidencePaths();
  const evidenceFiles = tracked.filter((file) => evidenceRoots.some((prefix) => file.startsWith(prefix)));
  const files = evidenceFiles.map((file) => {
    const buffer = fs.readFileSync(path.join(root, file));
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
    schemaVersion: 1,
    snapshotType: 'pre-change-evidence-preservation',
    commit: execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim(),
    branch: execFileSync('git', ['branch', '--show-current'], {cwd: root, encoding: 'utf8'}).trim(),
    trackedFileCount: tracked.length,
    evidenceFileCount: evidenceFiles.length,
    protectedFileCount: files.filter((file) => file.protectedFromByteDrift).length,
    preservationRoots: evidenceRoots,
    catalogTotals: catalogTotals(),
    publicEvidenceRoutes: {
      sitemap: sitemapRoutes()
    },
    robotsTxtSha256: sha256(fs.readFileSync(path.join(root, 'robots.txt'))),
    deterministicGeneratedOutputs: [...generated].sort(),
    files
  };
}

function verifySnapshot(relativePath) {
  const snapshot = JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
  const missing = [];
  const drifted = [];
  for (const record of snapshot.files) {
    const absolute = path.join(root, record.path);
    if (!fs.existsSync(absolute)) {
      missing.push(record.path);
      continue;
    }
    if (!record.protectedFromByteDrift) continue;
    const actual = sha256(fs.readFileSync(absolute));
    if (actual !== record.sha256) drifted.push({path: record.path, expected: record.sha256, actual});
  }
  const result = {
    status: missing.length || drifted.length ? 'FAIL' : 'PASS',
    baselineCommit: snapshot.commit,
    evidenceFilesBefore: snapshot.evidenceFileCount,
    evidenceFilesPresent: snapshot.files.length - missing.length,
    protectedFilesCompared: snapshot.files.filter((file) => file.protectedFromByteDrift).length,
    missing,
    drifted
  };
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (result.status !== 'PASS') process.exitCode = 1;
}

function main() {
  const verify = argument('--verify');
  if (verify) return verifySnapshot(verify);
  const output = toPosix(argument('--output', defaultOutput));
  const absolute = path.join(root, output);
  fs.mkdirSync(path.dirname(absolute), {recursive: true});
  fs.writeFileSync(absolute, JSON.stringify(createSnapshot(), null, 2) + '\n', 'utf8');
  console.log('Wrote pre-change preservation snapshot: ' + output);
}

if (require.main === module) main();

module.exports = {createSnapshot, verifySnapshot};
