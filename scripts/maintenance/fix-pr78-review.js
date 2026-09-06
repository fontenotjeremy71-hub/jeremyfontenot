'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');

const base = 'evidence-library/projects/on-prem-home-lab/ad-service-desk-delegation';
const originalDir = `${base}/source-original`;
const names = ['README.md', 'validation-public.txt', 'evidence-manifest.json', 'index.html'];
const task = 'Delegate and validate bounded Active Directory Service Desk rights for password reset, account unlock, forced password change, and membership changes to one approved group.';
const skill = 'Scoped Active Directory identity and group-membership administration using least-privilege delegation.';

const sourceManifestPath = 'content/home-lab/source-manifest.json';
const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, 'utf8'));
const desired = [];
for (const name of names) {
  desired.push({
    path: `${base}/${name}`,
    collection: 'ad-service-desk-delegation',
    reason: 'Sanitized presentation derivative for validated least-privilege Active Directory Service Desk delegation.',
    technologyRelationships: ['active-directory'],
    skill,
    task,
  });
}
for (const name of names) {
  desired.push({
    path: `${originalDir}/${name}`,
    collection: 'ad-service-desk-delegation-source-original',
    reason: 'Byte-preserved first-capture source retained to preserve evidence and provenance for the sanitized presentation derivative.',
    technologyRelationships: ['active-directory'],
    skill,
    task,
  });
}
const desiredPaths = new Set(desired.map((item) => item.path));
sourceManifest.approvedIndividualFiles = (sourceManifest.approvedIndividualFiles || []).filter((item) => !desiredPaths.has(item.path));
sourceManifest.approvedIndividualFiles.push(...desired);
sourceManifest.reviewedExclusions = (sourceManifest.reviewedExclusions || []).filter((item) => !desiredPaths.has(item.path));
fs.writeFileSync(sourceManifestPath, JSON.stringify(sourceManifest, null, 2) + '\n');

const exceptionPath = 'content/home-lab/sensitive-data-exceptions.json';
const exceptionManifest = JSON.parse(fs.readFileSync(exceptionPath, 'utf8'));
exceptionManifest.exceptions = (exceptionManifest.exceptions || []).filter((item) => !String(item.id || '').startsWith('ad-delegation-standard-schema-'));
const guidPattern = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;
for (const name of names) {
  const sourcePath = `${originalDir}/${name}`;
  const values = [...new Set(fs.readFileSync(sourcePath, 'utf8').match(guidPattern) || [])].sort();
  if (!values.length) continue;
  exceptionManifest.exceptions.push({
    id: `ad-delegation-standard-schema-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    findingType: 'tenant-or-object-identifier',
    valueFingerprints: values.map((value) => crypto.createHash('sha256').update(value).digest('hex')),
    reason: 'Standard Microsoft Active Directory schema or extended-right GUIDs retained only in the byte-preserved first-capture evidence; these are not tenant-specific secrets.',
    scope: [sourcePath],
    reviewerNote: 'Reviewed for PR 78 evidence-preservation remediation. Sanitized presentation derivatives are the preferred review path.',
  });
}
fs.writeFileSync(exceptionPath, JSON.stringify(exceptionManifest, null, 2) + '\n');

const generatorPath = 'scripts/build/generate-home-lab-evidence-organization.js';
let generator = fs.readFileSync(generatorPath, 'utf8');
generator = generator.replace(
  'skill: taxonomyRecord.skill, task: taxonomyRecord.task,',
  'skill: manifestEntry.skill || taxonomyRecord.skill, task: manifestEntry.task || taxonomyRecord.task,'
);
fs.writeFileSync(generatorPath, generator);

const readmePath = `${base}/README.md`;
let readme = fs.readFileSync(readmePath, 'utf8');
if (!readme.includes('## Preservation and derivative relationship')) {
  readme = readme.replace(
    '## Purpose\n',
    '## Preservation and derivative relationship\n\nThis public file is a sanitized presentation derivative. The first captured evidence is retained byte-for-byte in [`source-original/`](./source-original/README.md). The derivative preserves the validated tasks, results, scope, and limitations while omitting unnecessary raw directory identifiers.\n\n## Purpose\n'
  );
}
fs.writeFileSync(readmePath, readme);

const validationPath = `${base}/validation-public.txt`;
let validation = fs.readFileSync(validationPath, 'utf8');
if (!validation.startsWith('SANITIZED PRESENTATION DERIVATIVE')) {
  validation = 'SANITIZED PRESENTATION DERIVATIVE\nOriginal capture retained byte-for-byte at source-original/validation-public.txt\n\n' + validation;
}
fs.writeFileSync(validationPath, validation);

const manifestPath = `${base}/evidence-manifest.json`;
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.derivativeRelationship = {
  type: 'sanitized-presentation-derivative',
  originalDirectory: `${originalDir}/`,
  originalSourceCommit: '06057b68753f2983f149851d1657bcf23dc65d36',
  preservation: 'Original first-capture artifacts are retained byte-for-byte alongside this derivative.',
};
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

const indexPath = `${base}/index.html`;
let index = fs.readFileSync(indexPath, 'utf8');
if (!index.includes('Preserved original capture')) {
  index = index.replace(
    '<div class="actions"><a class="button primary" href="./validation-public.txt">Open validation summary</a><a class="button" href="./evidence-manifest.json">Open evidence manifest</a></div>',
    '<div class="actions"><a class="button primary" href="./validation-public.txt">Open validation summary</a><a class="button" href="./evidence-manifest.json">Open evidence manifest</a><a class="button" href="./source-original/README.md">Preserved original capture</a></div>'
  );
}
fs.writeFileSync(indexPath, index);
