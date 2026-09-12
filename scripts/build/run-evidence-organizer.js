#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const here = __dirname;
const sourcePath = path.join(here, 'generate-m365-evidence-organization.js');
const tempPath = path.join(here, '.generated-organizer.tmp.js');
let source = fs.readFileSync(sourcePath, 'utf8');

const provenanceOld = `    const buffer = headObjects.get(sourcePath);\n    const sourceCommit = manifestEntry.sourceCommit || currentCommit;\n    const recordedBuffer = manifestEntry.sourceCommit ? readGitObject(sourceCommit, sourcePath) : recordedObjects.get(sourcePath);\n    if (sha256(buffer) !== sha256(recordedBuffer)) throw new Error('Approved source differs from recorded commit ' + sourceCommit + ': ' + sourcePath);`;
const provenanceNew = `    const publicBuffer = headObjects.get(sourcePath);\n    const sourceCommit = manifestEntry.sourceCommit || currentCommit;\n    const recordedBuffer = manifestEntry.sourceCommit ? readGitObject(sourceCommit, sourcePath) : recordedObjects.get(sourcePath);\n    const isGeneratorManagedSource = generatorManagedSources.has(sourcePath);\n    if (!isGeneratorManagedSource && sha256(publicBuffer) !== sha256(recordedBuffer)) throw new Error('Approved source differs from recorded commit ' + sourceCommit + ': ' + sourcePath);\n    const buffer = isGeneratorManagedSource ? recordedBuffer : publicBuffer;`;

const publicOld = `    if (publicRoute) record.publicIntegrity = {algorithm: 'sha256', hash: sourceHash, size: buffer.length, verificationMethod: 'current-working-tree'};\n    reviewForRecord(record, buffer, sourcePath);`;
const publicNew = `    if (publicRoute) record.publicIntegrity = {algorithm: 'sha256', hash: sourceHash, size: buffer.length, verificationMethod: 'current-working-tree'};\n    if (isGeneratorManagedSource && publicRoute) {\n      const publicHash = sha256(publicBuffer);\n      record.publicationClassification = 'sanitized-derivative';\n      record.collectionContext = manifestEntry.reason + ' The original source relationship remains pinned to its recorded commit while the generator-managed public bytes are validated independently.';\n      record.hash = publicHash;\n      record.size = publicBuffer.length;\n      record.publicIntegrity = {algorithm: 'sha256', hash: publicHash, size: publicBuffer.length, verificationMethod: 'current-working-tree'};\n    }\n    reviewForRecord(record, isGeneratorManagedSource ? publicBuffer : buffer, sourcePath);`;

if (!source.includes(provenanceOld)) throw new Error('Expected provenance block was not found in the Microsoft 365 organizer.');
if (!source.includes(publicOld)) throw new Error('Expected public-integrity block was not found in the Microsoft 365 organizer.');
source = source.replace(provenanceOld, provenanceNew).replace(publicOld, publicNew);

try {
  fs.writeFileSync(tempPath, source, 'utf8');
  const result = spawnSync(process.execPath, [tempPath, ...process.argv.slice(2)], {cwd: path.resolve(here, '..', '..'), stdio: 'inherit'});
  process.exitCode = result.status === null ? 1 : result.status;
} finally {
  try { fs.unlinkSync(tempPath); } catch {}
}
