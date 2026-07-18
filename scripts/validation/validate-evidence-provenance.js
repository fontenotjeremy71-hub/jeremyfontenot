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
const publicationManifest = JSON.parse(fs.readFileSync(path.join(root, 'config/publication-manifest.json'), 'utf8'));
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

function normalizeHeading(value) {
  return value.replace(/\s+#+\s*$/, '').trim().toLowerCase();
}

function parseMarkdownSections(text, context) {
  const sections = new Map();
  let activeSection = null;
  let fenceCharacter = null;
  let fenceLength = 0;

  for (const line of text.split(/\r?\n/)) {
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);

    if (fenceCharacter) {
      const trimmed = line.trim();
      if (trimmed.length >= fenceLength && [...trimmed].every((character) => character === fenceCharacter)) {
        fenceCharacter = null;
        fenceLength = 0;
      }
      continue;
    }

    if (fenceMatch) {
      fenceCharacter = fenceMatch[1][0];
      fenceLength = fenceMatch[1].length;
      continue;
    }

    const headingMatch = line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*$/);
    if (headingMatch) {
      activeSection = null;
      if (headingMatch[1].length === 2) {
        const heading = normalizeHeading(headingMatch[2]);
        const section = {lines: []};
        if (!sections.has(heading)) sections.set(heading, []);
        sections.get(heading).push(section);
        activeSection = section;
      }
      continue;
    }

    if (activeSection) activeSection.lines.push(line);
  }

  if (fenceCharacter) failures.push(`${context}: attestation contains an unclosed fenced code block`);
  return sections;
}

function uniqueSectionContent(sections, heading, context) {
  const matches = sections.get(heading.toLowerCase()) || [];
  if (matches.length !== 1) {
    failures.push(`${context}: attestation must contain exactly one actual Markdown heading named ${heading}`);
    return null;
  }
  return matches[0].lines.join('\n').trim();
}

function sectionValue(sections, heading, context) {
  const content = uniqueSectionContent(sections, heading, context);
  if (!content) return null;
  const value = content.split(/\r?\n/).find((line) => line.trim());
  return value ? value.trim().replace(/^`|`$/g, '') : null;
}

function routeToRepositoryPath(route, context) {
  if (typeof route !== 'string' || !route.startsWith('/')) {
    failures.push(`${context}: public-original attestation requires a local publicRoute`);
    return null;
  }

  let decoded;
  try {
    decoded = decodeURIComponent(route.split('#')[0].split('?')[0]);
  } catch {
    failures.push(`${context}: publicRoute contains invalid encoding`);
    return null;
  }

  let relative = decoded.replace(/^\//, '');
  if (!relative) relative = 'index.html';
  if (relative.endsWith('/')) relative += 'index.html';
  const slashPath = relative.replaceAll('\\', '/');
  const normalized = path.posix.normalize(slashPath);
  if (normalized !== slashPath || normalized === '..' || normalized.startsWith('../') || normalized.startsWith('/')) {
    failures.push(`${context}: publicRoute resolves outside the repository`);
    return null;
  }

  const absolute = path.resolve(root, ...normalized.split('/'));
  const relativeToRoot = path.relative(root, absolute);
  if (!relativeToRoot || relativeToRoot === '..' || relativeToRoot.startsWith(`..${path.sep}`) || path.isAbsolute(relativeToRoot)) {
    failures.push(`${context}: publicRoute resolves outside the repository`);
    return null;
  }
  return {absolute, relativePath: normalized};
}

function normalizeManifestEntry(value) {
  if (typeof value !== 'string' || !value) return null;
  const slashPath = value.replaceAll('\\', '/');
  const normalized = path.posix.normalize(slashPath);
  if (normalized !== slashPath || normalized === '.' || normalized === '..' || normalized.startsWith('../') || normalized.startsWith('/')) return null;
  return normalized;
}

function isPublishedByManifest(relativePath) {
  const requiredFiles = new Set((publicationManifest.requiredRootFiles || []).map(normalizeManifestEntry).filter(Boolean));
  const optionalFiles = new Set((publicationManifest.optionalRootFiles || []).map(normalizeManifestEntry).filter(Boolean));
  const directories = (publicationManifest.directories || []).map(normalizeManifestEntry).filter(Boolean);
  const forbiddenRoots = (publicationManifest.forbiddenOutputRoots || []).map(normalizeManifestEntry).filter(Boolean);

  if (forbiddenRoots.some((entry) => relativePath === entry || relativePath.startsWith(`${entry}/`))) return false;
  if (requiredFiles.has(relativePath) || optionalFiles.has(relativePath)) return true;
  if (!relativePath.includes('/') && (publicationManifest.rootExtensions || []).includes(path.posix.extname(relativePath).toLowerCase())) return true;
  return directories.some((entry) => relativePath.startsWith(`${entry}/`));
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

  const attestation = readGitObject(record.attestationCommit, record.attestationPath, `${context} attestation`);
  if (!attestation) return;
  const attestationActual = calculateHash(attestation, record.attestationHashAlgorithm, `${context} attestation`);
  if (attestationActual && attestationActual.toLowerCase() !== String(record.attestationHash).toLowerCase()) failures.push(`${context}: attestation hash mismatch`);

  const text = attestation.toString('utf8');
  const sections = parseMarkdownSections(text, `${context} attestation`);
  const sourceHashSection = uniqueSectionContent(sections, 'Source file SHA-256', context);
  const sourceHashMatches = sourceHashSection ? sourceHashSection.match(/\b[a-f0-9]{64}\b/gi) : null;
  const sourceHash = sourceHashMatches && sourceHashMatches.length === 1 ? sourceHashMatches[0].toLowerCase() : null;
  if (!sourceHash) failures.push(`${context}: attestation must contain exactly one SHA-256 digest in the Source file SHA-256 section`);
  if (sectionValue(sections, 'Source repository', context) !== record.sourceRepository) failures.push(`${context}: attested repository mismatch`);
  if (sectionValue(sections, 'Source commit', context) !== record.sourceCommit) failures.push(`${context}: attested commit mismatch`);
  if (sectionValue(sections, 'Source path', context) !== record.sourcePath) failures.push(`${context}: attested path mismatch`);
  if (sourceHash !== String(record.hash).toLowerCase()) failures.push(`${context}: attested source hash mismatch`);

  if (record.publicationClassification === 'public-original') {
    const publicArtifact = routeToRepositoryPath(record.publicRoute, context);
    if (!publicArtifact) return;
    if (!isPublishedByManifest(publicArtifact.relativePath)) {
      failures.push(`${context}: public-original route is not included by the publication manifest: ${record.publicRoute}`);
    }
    if (!fs.existsSync(publicArtifact.absolute) || !fs.statSync(publicArtifact.absolute).isFile()) {
      failures.push(`${context}: public-original artifact is missing at ${record.publicRoute}`);
      return;
    }
    const publicHash = calculateHash(fs.readFileSync(publicArtifact.absolute), record.hashAlgorithm, `${context} public artifact`);
    if (publicHash && publicHash.toLowerCase() !== String(record.hash).toLowerCase()) {
      failures.push(`${context}: public-original artifact is not byte-for-byte identical to the attested source`);
    }
  }
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
