#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');
const TEXT_EXTENSIONS = new Set([
  '.csv', '.json', '.xml', '.svg', '.html', '.htm', '.md', '.txt', '.ps1',
  '.js', '.mjs', '.cjs', '.yaml', '.yml', '.log', '.patch', '.pem', '.key'
]);

const SUPPLEMENTAL_HIGH_SEVERITY_PATTERNS = [
  {
    type: 'private-key',
    extensions: null,
    regex: /-----BEGIN (?:ENCRYPTED |RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/gim
  },
  {
    type: 'powershell-password-parameter',
    extensions: new Set(['.ps1']),
    regex: /(?:^|[\s`])-{1,2}(?:Password|Pwd)\s+(?:"([^"\r\n]+)"|'([^'\r\n]+)'|([^\s;|`]+))/gim,
    valueGroups: [1, 2, 3]
  },
  {
    type: 'xml-password-element',
    extensions: new Set(['.xml']),
    regex: /<(?:Password|Pwd)(?:\s[^>]*)?>\s*(?:<!\[CDATA\[)?([^<\r\n]+?)(?:\]\]>)?\s*<\/(?:Password|Pwd)>/gim,
    valueGroups: [1]
  }
];

function toPosix(value) {
  return String(value).replaceAll('\\', '/').replace(/^\.\/+/, '');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function trackedFiles() {
  const output = execFileSync('git', ['ls-files', '-z'], {cwd: root, encoding: 'utf8'});
  return output.split('\0').filter(Boolean).map(toPosix).sort();
}

function approvedSourceFiles(manifest, files) {
  const approved = new Set();
  const exclusions = new Set((manifest.reviewedExclusions || []).map((entry) => toPosix(entry.path)));

  for (const entry of manifest.approvedRecursiveRoots || []) {
    const prefix = toPosix(entry.path).replace(/\/+$/, '');
    for (const file of files) {
      if (file.startsWith(prefix + '/')) approved.add(file);
    }
  }

  for (const entry of manifest.approvedIndividualFiles || []) approved.add(toPosix(entry.path));
  for (const excluded of exclusions) approved.delete(excluded);

  return [...approved].sort();
}

function matchValue(match, definition) {
  if (!definition.valueGroups) return match[0];
  for (const group of definition.valueGroups) {
    if (match[group] !== undefined) return match[group];
  }
  return match[0];
}

function scanSupplementalHighSeverity(buffer, sourcePath) {
  const extension = path.extname(sourcePath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(extension)) return [];

  const text = Buffer.isBuffer(buffer) ? buffer.toString('utf8') : String(buffer);
  const findings = [];

  for (const definition of SUPPLEMENTAL_HIGH_SEVERITY_PATTERNS) {
    if (definition.extensions && !definition.extensions.has(extension)) continue;
    definition.regex.lastIndex = 0;
    let match;
    while ((match = definition.regex.exec(text)) !== null) {
      const value = matchValue(match, definition);
      findings.push({
        type: definition.type,
        severity: 'high',
        line: text.slice(0, match.index).split(/\r?\n/).length,
        fingerprint: sha256(Buffer.from(value)).slice(0, 16)
      });
      if (match[0].length === 0) definition.regex.lastIndex += 1;
    }
  }

  return findings;
}

function main() {
  const manifestPath = path.join(root, 'content/microsoft-365/source-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const files = trackedFiles();
  const fileSet = new Set(files);
  const approved = approvedSourceFiles(manifest, files);
  const failures = [];

  for (const relativePath of approved) {
    if (!fileSet.has(relativePath)) {
      failures.push(relativePath + ': approved source is not tracked');
      continue;
    }
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      failures.push(relativePath + ': approved source is missing or is not a file');
      continue;
    }
    const findings = scanSupplementalHighSeverity(fs.readFileSync(absolutePath), relativePath);
    for (const finding of findings) failures.push(relativePath + ':' + finding.line + ' [' + finding.type + ']');
  }

  if (failures.length) {
    console.error('Supplemental Microsoft 365 high-severity secret validation failed:');
    for (const failure of [...new Set(failures)].sort()) console.error(failure);
    process.exit(1);
  }

  console.log('Supplemental Microsoft 365 sensitive-format validation passed for ' + approved.length + ' approved artifacts.');
}

if (require.main === module) main();

module.exports = {
  SUPPLEMENTAL_HIGH_SEVERITY_PATTERNS,
  approvedSourceFiles,
  scanSupplementalHighSeverity
};
