'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {checkContract} = require('./validate-cta-semantics.js');

const cases = [
  ['View evidence', '/projects/windows-laps-gpo/evidence/', true],
  ['View evidence', '/projects/entra-cloud-sync/evidence/', true],
  ['View evidence', '/evidence-library/projects/on-prem-home-lab/current-validated-state/README.html', true],
  ['View evidence', '/windows-laps-gpo.html#evidence', false],
  ['Open evidence', '/entra-cloud-sync.html#evidence', false],
  ['Validation evidence', '/on-prem-home-lab.html#evidence', false],
  ['View evidence', '/app01-storage-expansion.html#evidence', false],
  ['Evidence catalog', '/microsoft-365/evidence-catalog.html', true],
  ['Evidence catalog', '/projects.html', false],
  ['Proof summary', '/proof.html#home-lab-proof', true],
  ['Review proof', '/contact.html', false],
  ['View resume', '/resume.html', true],
  ['Resume', '/projects.html', false],
  ['Contact', '/contact.html', true],
  ['Contact', 'mailto:jeremy@example.com', true],
  ['Contact', '/proof.html', false],
  ['Open case study', '/on-prem-home-lab.html', true],
  ['Read case study', '/evidence-library/index.html', false],
  ['Repository', 'https://github.com/fontenotjeremy71-hub/jeremyfontenot', true],
  ['Inspect files', '/projects.html', false]
];

for (const [label, href, valid] of cases) {
  test(`${label} -> ${href}: ${valid ? 'accepted' : 'rejected'}`, () => {
    assert.equal(checkContract('app01-storage-expansion.html', href, label).length === 0, valid);
  });
}
test('An evidence record cannot promise evidence by linking to itself', () => {
  assert.ok(checkContract('evidence-library/record.html', '/evidence-library/record.html', 'View evidence').length > 0);
});
