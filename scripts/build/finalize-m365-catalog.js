#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const checkMode = process.argv.includes('--check');
const configPath = path.join(root, 'content/microsoft-365/organization.json');
const catalogPath = path.join(root, 'assets/data/microsoft-365-evidence-catalog.json');
const preservationPath = path.join(root, 'assets/data/microsoft-365-preservation-report.json');
const migrationPath = path.join(root, 'assets/data/microsoft-365-migration-matrix.csv');
const preservationPagePath = path.join(root, 'microsoft-365/preservation/index.html');
const inventoryPath = path.join(root, 'evidence-library/preserved-sharepoint/sharepoint-export-inventory.csv');
const failures = [];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizePath(value) {
  return String(value || '').replaceAll('\\', '/').replace(/^\.\//, '');
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  const [header, ...data] = rows.filter((item) => item.some((value) => value !== ''));
  return data.map((values) => Object.fromEntries(header.map((name, index) => [name, values[index] ?? ''])));
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join('|') : String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function writeOrCheck(filePath, expected, label) {
  if (checkMode) {
    if (!fs.existsSync(filePath)) failures.push(`${label} is missing: ${path.relative(root, filePath)}`);
    else if (fs.readFileSync(filePath, 'utf8') !== expected) failures.push(`${label} drift: ${path.relative(root, filePath)}`);
  } else {
    fs.mkdirSync(path.dirname(filePath), {recursive: true});
    fs.writeFileSync(filePath, expected, 'utf8');
    console.log(`Finalized ${path.relative(root, filePath)}`);
  }
}

const config = readJson(configPath);
const catalog = readJson(catalogPath);
const preservation = readJson(preservationPath);
const inventoryRows = parseCsv(fs.readFileSync(inventoryPath, 'utf8'));
const inventoryByPublicPath = new Map();

for (const row of inventoryRows) {
  const publicPath = normalizePath(row.site_rel);
  const existing = inventoryByPublicPath.get(publicPath);
  if (existing && (existing.source_rel !== row.source_rel || existing.sha256.toLowerCase() !== row.sha256.toLowerCase())) {
    failures.push(`Conflicting SharePoint inventory rows for ${publicPath}`);
    continue;
  }
  inventoryByPublicPath.set(publicPath, row);
}

let hashMatches = 0;
let hashMismatches = 0;
let matchedCatalogPaths = 0;

for (const record of catalog.records || []) {
  const inventory = inventoryByPublicPath.get(normalizePath(record.publicPath));
  if (!inventory) continue;

  matchedCatalogPaths += 1;
  const recordedHash = String(inventory.sha256).toLowerCase();
  const currentHash = String(record.hash).toLowerCase();
  const recordedHashMatch = currentHash === recordedHash;
  if (recordedHashMatch) hashMatches += 1;
  else hashMismatches += 1;

  record.evidenceSet = 'preserved-sharepoint';
  record.sourceRepository = config.sourceSnapshots.originalRepository.repository;
  record.sourceCommit = config.sourceSnapshots.originalRepository.commit;
  record.sourcePath = normalizePath(inventory.source_rel);
  record.sourceVerificationMethod = 'manifest-attested-source';
  record.attestationPath = config.sources.sharepointInventory;
  record.collectionContext = 'Preserved SharePoint-based documentation export indexed by original path, public path, file size, SHA-256, and safe catalog metadata.';
  record.recordedSourceHash = recordedHash;
  record.recordedSourceHashMatch = recordedHashMatch;
  record.publicationClassification = recordedHashMatch ? 'public-original' : 'sanitized-derivative';
  record.preservationState = recordedHashMatch ? 'byte-preserved-from-original-inventory' : 'public-derivative-compared-to-original-inventory';
}

if (matchedCatalogPaths !== inventoryByPublicPath.size) {
  failures.push(`Catalog covers ${matchedCatalogPaths} of ${inventoryByPublicPath.size} unique SharePoint public paths.`);
}

const countsByEvidenceSet = {};
for (const record of catalog.records || []) countsByEvidenceSet[record.evidenceSet] = (countsByEvidenceSet[record.evidenceSet] || 0) + 1;
catalog.countsByEvidenceSet = countsByEvidenceSet;
catalog.totals.sharepointUniquePublicPaths = inventoryByPublicPath.size;

preservation.sharepointPreservation.inventoryRows = inventoryRows.length;
preservation.sharepointPreservation.filesComparedWithInventory = inventoryRows.length;
preservation.sharepointPreservation.uniquePublicPaths = inventoryByPublicPath.size;
preservation.sharepointPreservation.duplicateInventoryRows = inventoryRows.length - inventoryByPublicPath.size;
preservation.sharepointPreservation.hashMatches = hashMatches;
preservation.sharepointPreservation.hashMismatches = hashMismatches;
preservation.sharepointPreservation.missingFiles = 0;
preservation.sharepointPreservation.collectionStatus = hashMismatches > 0 ? 'present-with-byte-differences' : 'byte-match-to-recorded-inventory';

const migrationHeader = ['id','source_repository','source_commit','source_path','current_public_path','technology_routes','evidence_type','publication_classification','preservation_state','sha256'];
const migrationRows = [migrationHeader.map(csvCell).join(',')];
for (const record of catalog.records || []) {
  migrationRows.push([
    record.id,
    record.sourceRepository,
    record.sourceCommit,
    record.sourcePath,
    record.publicPath,
    (record.technologies || []).map((slug) => `/microsoft-365/${slug}/`),
    record.evidenceType,
    record.publicationClassification,
    record.preservationState,
    record.hash
  ].map(csvCell).join(','));
}

let preservationPage = fs.readFileSync(preservationPagePath, 'utf8');
preservationPage = preservationPage.replace(
  /<strong>\d+<\/strong><span>Byte differences disclosed<\/span>/,
  `<strong>${hashMismatches}</strong><span>Byte differences disclosed</span>`
);

writeOrCheck(catalogPath, stableStringify(catalog), 'Microsoft 365 evidence catalog');
writeOrCheck(preservationPath, stableStringify(preservation), 'Microsoft 365 preservation report');
writeOrCheck(migrationPath, `${migrationRows.join('\n')}\n`, 'Microsoft 365 migration matrix');
writeOrCheck(preservationPagePath, preservationPage, 'Microsoft 365 preservation page');

if (failures.length) {
  for (const failure of failures) console.error(failure);
  console.error(`Microsoft 365 catalog finalization failed with ${failures.length} finding(s).`);
  process.exit(1);
}

console.log(`Microsoft 365 catalog finalization passed (${inventoryRows.length} inventory rows; ${inventoryByPublicPath.size} unique public paths; ${hashMatches} byte matches; ${hashMismatches} byte differences).`);
