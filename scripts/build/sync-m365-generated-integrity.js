#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..', '..');
const checkMode = process.argv.includes('--check');
const inventoryPath = path.join(root, 'evidence-library/integrity/evidence-hashes.json');
const generatedPath = path.join(root, 'evidence-library/preserved-sharepoint/index.html');
const expectedRecordPath = 'evidence-library\\preserved-sharepoint\\index.html';

const records = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const record = records.find((item) => item.path === expectedRecordPath);
if (!record) throw new Error(`Integrity record is missing: ${expectedRecordPath}`);
if (!fs.existsSync(generatedPath)) throw new Error('Generated preserved SharePoint index is missing.');

const buffer = fs.readFileSync(generatedPath);
const hash = crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
const size = buffer.length;

if (checkMode) {
  if (record.sha256 !== hash || record.size !== size) {
    console.error(`Generated SharePoint index integrity drift: expected ${hash}/${size}, recorded ${record.sha256}/${record.size}.`);
    process.exit(1);
  }
  console.log('Generated SharePoint index integrity record is current.');
  process.exit(0);
}

record.sha256 = hash;
record.size = size;
fs.writeFileSync(inventoryPath, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
console.log(`Synchronized generated SharePoint index integrity: ${hash}/${size}.`);
