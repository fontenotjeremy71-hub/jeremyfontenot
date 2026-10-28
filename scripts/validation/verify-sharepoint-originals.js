#!/usr/bin/env node
/**
 * Recover and verify preserved SharePoint originals without rewriting evidence.
 * Usage:
 *   node scripts/validation/verify-sharepoint-originals.js [path/to/original-export-root]
 * An original-export-root must contain paths relative to the inventory's source_rel
 * (for example docs/business/sharepoint/...). This tool NEVER writes source files.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = process.cwd();
const inventoryPath = path.join(root, 'evidence-library/preserved-sharepoint/sharepoint-export-inventory.csv');
const originalRoot = path.resolve(process.argv[2] || path.join(root, 'lab-documentation'));
function csvRows(input) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quoted) {
      if (c === '"' && input[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (quoted) throw Error('Unterminated quoted CSV field');
  if (field || row.length) { row.push(field); rows.push(row); }
  const keys = rows.shift();
  return rows.filter(r => r.length > 1).map(r => Object.fromEntries(keys.map((k, i) => [k, r[i] || ''])));
}
function sha(p) { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); }
function within(base, rel) {
  const p = path.resolve(base, rel);
  if (p !== base && !p.startsWith(base + path.sep)) throw Error('Unsafe inventory path: ' + rel);
  return p;
}
const rows = csvRows(fs.readFileSync(inventoryPath, 'utf8'));
const results = rows.map(record => {
  const original = within(originalRoot, record.source_rel);
  const repository = within(root, record.site_rel);
  const expected = record.sha256.toLowerCase();
  const originalExists = fs.existsSync(original) && fs.statSync(original).isFile();
  const repoExists = fs.existsSync(repository) && fs.statSync(repository).isFile();
  const originalHash = originalExists ? sha(original) : null;
  const repositoryHash = repoExists ? sha(repository) : null;
  return {
    source_rel: record.source_rel, site_rel: record.site_rel, expected_sha256: expected,
    original_exists: originalExists, original_sha256: originalHash,
    original_matches_inventory: originalHash === expected,
    repository_exists: repoExists, repository_sha256: repositoryHash,
    repository_matches_inventory: repositoryHash === expected,
    repository_matches_original: !!originalHash && repositoryHash === originalHash
  };
});
const summary = {
  inventory_records: results.length, original_root: originalRoot,
  originals_found: results.filter(r => r.original_exists).length,
  originals_matching_inventory: results.filter(r => r.original_matches_inventory).length,
  originals_mismatching_inventory: results.filter(r => r.original_exists && !r.original_matches_inventory).length,
  originals_missing: results.filter(r => !r.original_exists).length,
  repository_files_found: results.filter(r => r.repository_exists).length,
  repository_files_matching_inventory: results.filter(r => r.repository_matches_inventory).length,
  repository_files_matching_originals: results.filter(r => r.repository_matches_original).length
};
console.log(JSON.stringify({ summary, records: results }, null, 2));
if (summary.originals_missing || summary.originals_mismatching_inventory) process.exitCode = 1;
