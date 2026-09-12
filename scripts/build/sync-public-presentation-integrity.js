#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const inventoryPath = path.join(root, 'evidence-library/integrity/evidence-hashes.json');
const records = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const presentations = new Set(['evidence-library/index.html', 'evidence-library/projects/on-prem-home-lab/infrastructure-validation-2026-07/index.html']);
const digest = buffer => crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
let synchronized = 0;
for (const record of records) {
  const relative = record.path.replaceAll('\\', '/');
  if (relative.startsWith('evidence-library/preserved-sharepoint/source/') && relative.endsWith('.html') || presentations.has(relative)) {
    const buffer = fs.readFileSync(path.join(root, relative));
    const hash = digest(Buffer.from(buffer.toString('utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n'), 'utf8'));
    if (record.sha256 !== hash) {
      record.priorInventoryIntegrity ||= {sha256: record.sha256, size: record.size};
      record.sha256 = hash;
      record.size = buffer.length;
      delete record.lastModified;
      record.integrityContext = 'Normalized-text hash of the current public presentation. Prior inventory integrity is retained; original evidence source integrity is independently recorded in the technology catalogs.';
      synchronized += 1;
    }
  }
  if (relative === 'evidence-library/projects/on-prem-home-lab/Jeremy-Fontenot-On-Premises-Home-Lab-Documentation.docx') {
    const publicPath = 'assets/documents/Jeremy-Fontenot-On-Premises-Home-Lab-Documentation.docx';
    if (digest(fs.readFileSync(path.join(root, publicPath))) !== record.sha256) throw new Error('The retained documentation is not byte-identical to the inventory record.');
    record.publicPath = publicPath;
    record.integrityContext = 'Original inventory path retained. The owner previously removed this duplicate copy; the byte-identical public document remains at publicPath.';
  }
}
const expected = JSON.stringify(records, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (fs.readFileSync(inventoryPath, 'utf8') !== expected) throw new Error('Public presentation integrity inventory is stale.');
} else if (fs.readFileSync(inventoryPath, 'utf8') !== expected) fs.writeFileSync(inventoryPath, expected, 'utf8');
console.log(`Public presentation integrity passed (${synchronized} records synchronized; original inventory hashes retained).`);
