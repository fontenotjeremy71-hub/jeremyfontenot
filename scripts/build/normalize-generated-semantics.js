#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const checkOnly = process.argv.includes('--check');
const claimMapPath = path.join(root, 'evidence', 'claim-map.html');
const manifestPath = path.join(root, 'content', 'site', 'generated-skill-map-hashes.json');
const outputKey = 'evidence/claim-map.html';

const rawMarker = '</div><div class="mapping-grid">';
const normalizedMarker = '</div><div class="section-head"><p class="eyebrow">Bounded claim index</p><h2 id="claims-title">Inspect bounded claims and supporting proof.</h2></div><div class="mapping-grid" aria-labelledby="claims-title">';

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function fail(message) {
  throw new Error(`Generated semantic normalization failed: ${message}`);
}

function normalizeClaimMap(html) {
  if (html.includes(normalizedMarker)) return html;
  const matches = html.split(rawMarker).length - 1;
  if (matches !== 1) fail(`expected one claim-grid marker, found ${matches}`);
  return html.replace(rawMarker, normalizedMarker);
}

if (!fs.existsSync(claimMapPath)) fail('evidence/claim-map.html is missing.');
if (!fs.existsSync(manifestPath)) fail('content/site/generated-skill-map-hashes.json is missing.');

const currentHtml = fs.readFileSync(claimMapPath, 'utf8');
const normalizedHtml = normalizeClaimMap(currentHtml);
const normalizedBytes = Buffer.from(normalizedHtml, 'utf8');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

if (!manifest.outputs || !manifest.outputs[outputKey]) {
  fail(`hash manifest is missing ${outputKey}`);
}

const expectedRecord = {
  algorithm: 'sha256',
  hash: sha256(normalizedBytes),
  size: normalizedBytes.length,
};

if (checkOnly) {
  if (currentHtml !== normalizedHtml) fail('claim map is not normalized. Run npm run build:skill-map.');
  const actualRecord = manifest.outputs[outputKey];
  if (
    actualRecord.algorithm !== expectedRecord.algorithm ||
    actualRecord.hash !== expectedRecord.hash ||
    actualRecord.size !== expectedRecord.size
  ) {
    fail(`hash manifest does not match ${outputKey}. Run npm run build:skill-map.`);
  }
  console.log('Generated semantic normalization check passed for evidence/claim-map.html.');
  process.exit(0);
}

fs.writeFileSync(claimMapPath, normalizedBytes);
manifest.outputs[outputKey] = expectedRecord;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log('Normalized generated claim-map heading structure and refreshed its hash manifest entry.');
