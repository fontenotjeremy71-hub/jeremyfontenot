'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {
  evidenceType,
  discoverSourceFiles,
  listTrackedFiles,
  technologiesFor,
  logicalDestination,
  normalizeForTechnologyMatching,
  reviewArtifact,
  scanText,
  validateExceptionManifest
} = require('../scripts/build/generate-m365-evidence-organization.js');
const {
  scanSupplementalHighSeverity
} = require('../scripts/validation/validate-m365-sensitive-formats.js');

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

test('transport-rule remediation evidence relates to Exchange Online and automation', () => {
  const actual = relationships('remediation-disable-transportrule.ps1');
  assert.ok(actual.includes('exchange-online'));
  assert.ok(actual.includes('automation'));
});

test('repository script sources use the scripts evidence type and destination folder', () => {
  assert.equal(evidenceType('scripts/automation/remediation-disable-transportrule.ps1'), 'scripts');
  assert.equal(
    logicalDestination('exchange-online', 'scripts', 'exchange-automation', 'scripts/automation/remediation-disable-transportrule.ps1'),
    'content/microsoft-365/exchange-online/scripts/exchange-automation/scripts/automation/remediation-disable-transportrule.ps1'
  );
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

test('quoted structured-data keys still trigger high-severity secret detection', () => {
  const content = JSON.stringify({
    clientSecret: 'abcdefghijklmnop',
    access_token: 'abcdefghijklmnopqrstuvwx',
    refreshToken: 'zyxwvutsrqponmlkjihgfedc',
    password: 'not-a-real-password',
    apiKey: '1234567890abcdef',
    Authorization: 'Bearer abcdefghijklmnopqrstuvwx'
  });
  const findings = scanText(Buffer.from(content), 'evidence/public/probe.json', {exceptions: []}, true);
  const types = new Set(findings.filter((finding) => finding.severity === 'high').map((finding) => finding.type));
  for (const expected of ['client-secret', 'access-token', 'refresh-token', 'password-or-connection-secret', 'api-key', 'bearer-authorization-header']) {
    assert.ok(types.has(expected), 'missing detection for ' + expected);
  }
});

test('connection-string secret material is detected', () => {
  const findings = scanText(Buffer.from('Endpoint=x;AccountKey=abcdefghijklmnop;'), 'evidence/public/probe.txt', {exceptions: []}, true);
  assert.ok(findings.some((finding) => finding.type === 'connection-string-secret' && finding.severity === 'high'));
});

test('public IP identifiers are detected while private and documentation ranges are ignored', () => {
  const findings = scanText(Buffer.from('public=174.73.123.101 private=192.168.1.10 example=203.0.113.8 SerializationVersion: 1.1.0.1 PackageManagement / 1.4.8.1 / DSCResources ipv6=2600:8807:2941:2500:1126:a8ab:d68d:13ee'), 'evidence/public/probe.txt', {exceptions: []}, true);
  assert.ok(findings.some((finding) => finding.type === 'public-ipv4-identifier' && finding.value === '174.73.123.101'));
  assert.ok(findings.some((finding) => finding.type === 'public-ipv6-identifier'));
  assert.ok(!findings.some((finding) => ['192.168.1.10', '203.0.113.8', '1.1.0.1', '1.4.8.1'].includes(finding.value)));
});

test('SVG evidence is scanned as text and high-severity material blocks publication', () => {
  const review = reviewArtifact(Buffer.from('<svg><text>client_secret: abcdefghijklmnop</text></svg>'), 'assets/evidence/probe.svg', '/assets/evidence/probe.svg', {exceptions: []});
  assert.equal(review.manualReviewRequired, false);
  assert.equal(review.highSeverityFindings, 1);
  assert.ok(review.findings.some((finding) => finding.type === 'client-secret'));
});

test('encrypted PKCS8 private keys are blocked by the supplemental gate', () => {
  const findings = scanSupplementalHighSeverity(Buffer.from('-----BEGIN ENCRYPTED PRIVATE KEY-----'), 'evidence/public/probe.pem');
  assert.ok(findings.some((finding) => finding.type === 'private-key'));
});

test('PowerShell password parameters are blocked by the supplemental gate', () => {
  for (const command of [
    'Connect-Service -Password value',
    'Connect-Service -Password:value',
    'Connect-Service -Password:"value"',
    "Connect-Service -Password:'value'",
    'Connect-Service -Pwd:value',
    'Connect-Service --Password:value'
  ]) {
    const findings = scanSupplementalHighSeverity(Buffer.from(command), 'scripts/probe.ps1');
    assert.ok(findings.some((finding) => finding.type === 'powershell-password-parameter'), 'missing detection for ' + command);
  }
});

test('PowerShell password references, declarations, placeholders, and empty values are nonblocking', () => {
  for (const command of [
    'Connect-Service -Password $Password',
    'Connect-Service -Password:$Credential.Password',
    '[CmdletBinding()] param([Parameter()] [string]$Password)',
    'Connect-Service -Password:',
    'Connect-Service -Password ""',
    'Connect-Service -Password:<redacted>',
    'Connect-Service -Password:TEST_FIXTURE_PLACEHOLDER'
  ]) {
    assert.equal(scanSupplementalHighSeverity(Buffer.from(command), 'scripts/probe.ps1').length, 0, 'unexpected finding for ' + command);
  }
});

test('XML password elements are blocked by the supplemental gate', () => {
  const findings = scanSupplementalHighSeverity(Buffer.from('<Configuration><Password>value</Password></Configuration>'), 'evidence/public/probe.xml');
  assert.ok(findings.some((finding) => finding.type === 'xml-password-element'));
});

test('source discovery is tracked-only and excludes publication output roots', () => {
  const tracked = listTrackedFiles();
  const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'content/microsoft-365/source-manifest.json'), 'utf8'));
  const files = discoverSourceFiles(manifest.generatedOutputRoots);
  assert.ok(tracked.length >= files.length);
  for (const prefix of ['site/', '.site-preflight/', 'playwright-report/', 'test-results/', 'node_modules/', 'artifacts/playwright/', 'artifacts/redesign/final/']) {
    assert.ok(manifest.generatedOutputRoots.includes(prefix), 'denylist is missing ' + prefix);
    assert.ok(!files.some((file) => file.startsWith(prefix)), 'tracked source discovery included ' + prefix);
  }
});

test('generated M365 contracts contain no publication-output source paths', () => {
  const root = path.resolve(__dirname, '..');
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/m365-evidence-catalog.json'), 'utf8'));
  const matrix = fs.readFileSync(path.join(root, 'microsoft-365/source-to-destination-matrix.csv'), 'utf8');
  const duplicates = fs.readFileSync(path.join(root, 'microsoft-365/duplicate-groups.json'), 'utf8');
  const sensitive = fs.readFileSync(path.join(root, 'microsoft-365/sensitive-data-review.json'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content/microsoft-365/source-manifest.json'), 'utf8'));
  const forbidden = ['site/', '.site-preflight/', 'playwright-report/', 'test-results/', 'node_modules/', 'artifacts/playwright/', 'artifacts/redesign/final/'];
  for (const record of catalog.records) {
    for (const prefix of forbidden) {
      assert.ok(!String(record.sourcePath).startsWith(prefix), 'catalog source contains ' + prefix);
      assert.ok(!String(record.publicPath || '').startsWith(prefix), 'catalog public path contains ' + prefix);
    }
  }
  for (const prefix of ['site/', '.site-preflight/', 'playwright-report/', 'test-results/', 'node_modules/', 'artifacts/playwright/']) {
    assert.ok(!matrix.includes('"' + prefix), 'matrix contains ' + prefix);
    assert.ok(!duplicates.includes('"' + prefix), 'duplicate report contains ' + prefix);
    assert.ok(!sensitive.includes('"' + prefix), 'sensitive report contains ' + prefix);
    assert.ok(!manifest.reviewedExclusions.some((entry) => entry.path.startsWith(prefix)), 'exclusion manifest contains ' + prefix);
  }
});

function gitBlobHash(buffer, attributePath) {
  const args = ['hash-object'];
  if (attributePath) args.push('--path=' + attributePath);
  args.push('--stdin');
  return execFileSync('git', args, {input: buffer, encoding: 'utf8'}).trim();
}

test('Git attributes preserve raw CRLF evidence bytes and normalize only the generated matrix', () => {
  const crlfCsv = Buffer.from('name,value\r\nalpha,beta\r\n');
  const crlfJson = Buffer.from('{\r\n  "name": "value"\r\n}\r\n');
  const crlfMarkdown = Buffer.from('# Heading\r\n\r\nEvidence.\r\n');
  assert.equal(gitBlobHash(crlfCsv, 'evidence/public/raw-fixture.csv'), gitBlobHash(crlfCsv));
  assert.equal(gitBlobHash(crlfJson, 'evidence-library/raw-fixture.json'), gitBlobHash(crlfJson));
  assert.equal(gitBlobHash(crlfMarkdown, 'docs/projects/raw-fixture.md'), gitBlobHash(crlfMarkdown));

  const lfCsv = Buffer.from('name,value\nalpha,beta\n');
  assert.equal(gitBlobHash(crlfCsv, 'microsoft-365/source-to-destination-matrix.csv'), gitBlobHash(lfCsv));
  assert.notEqual(gitBlobHash(crlfCsv, 'microsoft-365/source-to-destination-matrix.csv'), gitBlobHash(crlfCsv));
});

test('tenant and object identifier exceptions require exact tracked files and fingerprints', () => {
  const reviewedPath = 'evidence/public/intune-profile-sample.json';
  const reviewedValue = '11111111-1111-4111-8111-111111111111';
  const reviewedFingerprint = crypto.createHash('sha256').update(reviewedValue).digest('hex');
  const manifest = {exceptions: [{
    id: 'reviewed-guid-probe',
    findingType: 'tenant-or-object-identifier',
    valueFingerprints: [reviewedFingerprint],
    reason: 'Deterministic exact-value review fixture.',
    scope: [reviewedPath],
    reviewerNote: 'Only this fingerprint at this exact tracked path is reviewed.'
  }]};
  validateExceptionManifest(manifest, new Set([reviewedPath]));

  const reviewed = scanText(Buffer.from(reviewedValue), reviewedPath, manifest, true);
  assert.equal(reviewed[0].reviewStatus, 'reviewed-exception');
  const newValue = scanText(Buffer.from('22222222-2222-4222-8222-222222222222'), reviewedPath, manifest, true);
  assert.equal(newValue[0].reviewStatus, 'review-required');
  const newFile = scanText(Buffer.from(reviewedValue), 'evidence/public/new-export.json', manifest, true);
  assert.equal(newFile[0].reviewStatus, 'review-required');

  assert.throws(() => validateExceptionManifest({exceptions: [{
    id: 'broad-guid-probe',
    findingType: 'tenant-or-object-identifier',
    pattern: '^[0-9a-f-]+$',
    reason: 'Invalid broad review fixture.',
    scope: ['evidence/public'],
    reviewerNote: 'This must be rejected.'
  }]}, new Set([reviewedPath])), /must use exact SHA-256 fingerprints/);
  assert.throws(() => validateExceptionManifest({exceptions: [{
    id: 'missing-note-probe',
    findingType: 'tenant-or-object-identifier',
    valueFingerprints: [reviewedFingerprint],
    reason: 'Invalid missing-note fixture.',
    scope: [reviewedPath]
  }]}, new Set([reviewedPath])), /missing reviewerNote/);
});
