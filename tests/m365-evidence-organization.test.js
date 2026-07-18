'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  technologiesFor,
  logicalDestination,
  normalizeForTechnologyMatching
} = require('../scripts/build/generate-m365-evidence-organization.js');

function relationships(value) {
  return technologiesFor(value, 'tenant-administration').sort();
}

for (const stem of [
  'conditional access policies',
  'named locations',
  'authentication methods policy',
  'authorization policy'
]) {
  test('security classification is separator invariant for ' + stem, () => {
    const expected = relationships('entra ' + stem);
    assert.deepEqual(relationships('entra ' + stem.replaceAll(' ', '-')), expected);
    assert.deepEqual(relationships('entra ' + stem.replaceAll(' ', '_')), expected);
    assert.ok(expected.includes('security-compliance'));
    assert.ok(expected.includes('entra-id'));
  });
}

for (const stem of [
  'app registrations',
  'enterprise applications service principals',
  'oauth2 permission grants'
]) {
  test('application classification is separator invariant for ' + stem, () => {
    const expected = relationships('entra ' + stem);
    assert.deepEqual(relationships('entra ' + stem.replaceAll(' ', '-')), expected);
    assert.deepEqual(relationships('entra ' + stem.replaceAll(' ', '_')), expected);
    assert.ok(expected.includes('applications'));
    assert.ok(expected.includes('entra-id'));
  });
}

test('Graph request evidence relates to automation', () => {
  assert.ok(relationships('entra conditional-access-policies-graph-request.json').includes('automation'));
});

test('normalization treats hyphens, underscores, and spaces equivalently', () => {
  assert.equal(normalizeForTechnologyMatching('conditional-access_policies'), 'conditional access policies');
});

test('logical destinations retain collection and relative source context', () => {
  const first = logicalDestination('entra-id', 'documentation', 'proof-set-a', 'alpha/README.md');
  const second = logicalDestination('entra-id', 'documentation', 'proof-set-b', 'alpha/README.md');
  assert.notEqual(first, second);
  assert.match(first, /^content\/microsoft-365\/entra-id\/documentation\/proof-set-a\/alpha\/README\.md$/);
});

test('logical destinations reject traversal', () => {
  assert.throws(() => logicalDestination('entra-id', 'exports', 'proof-set', '../entra-groups.csv'), /Unsafe logical destination/);
});
