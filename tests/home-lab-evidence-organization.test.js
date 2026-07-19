'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  assertNoApprovedSourceDrift,
  build,
  compatibilityPage,
  resultStateFor
} = require('../scripts/build/generate-home-lab-evidence-organization.js');
const {
  logicalDestination,
  normalizeForTechnologyMatching,
  reviewArtifact,
  technologiesFor
} = require('../scripts/lib/home-lab-evidence.js');

const root = path.resolve(__dirname, '..');

for (const stem of ['active directory', 'dns dhcp', 'windows server', 'backup recovery', 'monitoring logging']) {
  test('Home Lab technology matching is separator invariant for ' + stem, () => {
    const expected = technologiesFor(stem).sort();
    assert.deepEqual(technologiesFor(stem.replaceAll(' ', '-')).sort(), expected);
    assert.deepEqual(technologiesFor(stem.replaceAll(' ', '_')).sort(), expected);
    assert.equal(normalizeForTechnologyMatching(stem.replaceAll(' ', '-')), normalizeForTechnologyMatching(stem));
  });
}

test('logical destinations retain collection and complete relative source context', () => {
  const first = logicalDestination('active-directory', 'validation', 'proof-a', 'one/README.md');
  const second = logicalDestination('active-directory', 'validation', 'proof-b', 'two/README.md');
  assert.notEqual(first, second);
  assert.match(first, /^content\/home-lab\/active-directory\/evidence\/validation\/proof-a\/one\/README\.md$/);
});

test('logical destinations reject traversal and empty segments', () => {
  assert.throws(() => logicalDestination('networking', 'reports', 'proof', '../escape.md'), /Unsafe/);
  assert.throws(() => logicalDestination('networking', 'reports', 'proof', 'one//two.md'), /Unsafe/);
});

test('result states preserve bounded and untested meanings', () => {
  assert.equal(resultStateFor('restore timeout was inconclusive', 'supported-with-limitations'), 'inconclusive');
  assert.equal(resultStateFor('configuration documented but not tested', 'supported-with-limitations'), 'not-tested');
  assert.equal(resultStateFor('architecture runbook', 'supported-with-limitations'), 'documented-only');
  assert.equal(resultStateFor('insufficient evidence', 'supported-with-limitations'), 'insufficient');
});

test('approved-source drift fails without rebuilding the contract', () => {
  assert.doesNotThrow(() => assertNoApprovedSourceDrift(['evidence/a.txt'], ['unrelated.txt']));
  assert.throws(() => assertNoApprovedSourceDrift(['evidence/a.txt'], ['evidence/a.txt']), /uncommitted drift/);
});

test('high-severity secrets fail content review while redaction markers remain safe', () => {
  const secret = reviewArtifact(Buffer.from('client_secret = "not-a-placeholder-secret"'), 'fixture.txt', '/fixture.txt', {exceptions: []}, new Set());
  assert.ok(secret.highSeverityFindings > 0);
  const redacted = reviewArtifact(Buffer.from('password: [REDACTED]'), 'fixture.txt', null, {exceptions: []}, new Set());
  assert.equal(redacted.highSeverityFindings, 0);
});

test('binary screenshots receive an honest manual-review classification without OCR', () => {
  const review = reviewArtifact(Buffer.from([0, 1, 2, 3]), 'fixture.png', '/fixture.png', {exceptions: []}, new Set());
  assert.equal(review.manualReviewRequired, true);
  assert.equal(review.status, 'manual-review-required');
});

test('compatibility derivatives contain complete SEO and accessibility metadata', () => {
  const html = compatibilityPage('active-directory-lab.html', 'active-directory-lab.html');
  for (const required of ['<title>', 'meta name="description"', 'rel="canonical"', 'property="og:title"', 'property="og:description"', 'href="#main"', '<h1 id="page-title">', 'aria-label="Primary navigation"']) assert.ok(html.includes(required), required);
  assert.match(html, /not a byte-preserved copy/);
});

test('the generated catalog is schema-valid, reciprocal, unique, and deterministic', () => {
  const first = build();
  const second = build();
  assert.equal(first.summary.totals.artifacts, first.summary.records.length);
  assert.equal(first.summary.totals.sensitiveDataReview.highSeveritySecretFindings, 0);
  assert.deepEqual([...first.outputs.entries()], [...second.outputs.entries()]);
  const ids = new Set(first.summary.records.map((record) => record.id));
  const destinations = new Set(first.summary.records.map((record) => record.logicalDestination.toLowerCase()));
  const identities = new Set(first.summary.records.map((record) => record.sourceRepository + '@' + record.sourceCommit + ':' + record.sourcePath));
  assert.equal(ids.size, first.summary.records.length);
  assert.equal(destinations.size, first.summary.records.length);
  assert.equal(identities.size, first.summary.records.length);
  for (const record of first.summary.records) {
    assert.equal(record.lab, 'home-lab');
    assert.ok(record.supportedClaims.length > 0);
    for (const claimId of record.supportedClaims) assert.ok(first.summary.claimRelationships.find((claim) => claim.claimId === claimId).evidenceIds.includes(record.id));
  }
  const hashes = JSON.parse(first.outputs.get('content/home-lab/generated-output-hashes.json'));
  assert.equal(hashes.outputs.length, first.outputs.size - 1);
});

test('committed Home Lab output contract has every required public artifact', () => {
  const required = ['assets/data/home-lab-evidence-catalog.json','home-lab/evidence-catalog.html','home-lab/source-to-destination-matrix.csv','home-lab/duplicate-groups.json','home-lab/sensitive-data-review.json','home-lab/authoritative-source-decisions.json','active-directory-lab.html','infrastructure.html','network-segmentation.html','powershell-automation.html'];
  for (const relative of required) assert.ok(fs.existsSync(path.join(root, relative)), relative);
});
