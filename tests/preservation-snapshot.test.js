'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {execFileSync} = require('node:child_process');

const {
  compareProtectedBlobs,
  readBlobAtRef,
  resolveRef,
  trackedFilesAtRef
} = require('../scripts/audits/create-preservation-snapshot');

function git(repositoryRoot, args) {
  return execFileSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    windowsHide: true
  }).trim();
}

function write(repositoryRoot, relativePath, content) {
  const absolute = path.join(repositoryRoot, relativePath);
  fs.mkdirSync(path.dirname(absolute), {recursive: true});
  fs.writeFileSync(absolute, content);
}

function commitAll(repositoryRoot, message) {
  git(repositoryRoot, ['add', '--all']);
  git(repositoryRoot, ['commit', '-m', message]);
  return resolveRef('HEAD', repositoryRoot);
}

function createRepository() {
  const repositoryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'preservation-snapshot-test-'));
  git(repositoryRoot, ['init', '-b', 'main']);
  git(repositoryRoot, ['config', 'user.name', 'Preservation Test']);
  git(repositoryRoot, ['config', 'user.email', 'preservation-test@example.invalid']);
  git(repositoryRoot, ['config', 'core.autocrlf', 'false']);
  git(repositoryRoot, ['config', 'core.eol', 'lf']);
  return repositoryRoot;
}

test('Git-blob comparison is stable across working-tree line endings and detects committed drift', () => {
  const repositoryRoot = createRepository();
  try {
    write(repositoryRoot, 'evidence/protected.csv', 'name,value\nalpha,one\n');
    write(repositoryRoot, 'evidence/generated.json', '{"generated":true}\n');
    const baseline = commitAll(repositoryRoot, 'baseline');

    const records = [
      {
        path: 'evidence/protected.csv',
        sha256: 'legacy-working-tree-hash',
        protectedFromByteDrift: true
      },
      {
        path: 'evidence/generated.json',
        sha256: 'ignored-generated-hash',
        protectedFromByteDrift: false
      }
    ];

    assert.deepEqual(trackedFilesAtRef(baseline, repositoryRoot), [
      'evidence/generated.json',
      'evidence/protected.csv'
    ]);
    assert.equal(readBlobAtRef(baseline, 'evidence/protected.csv', repositoryRoot).toString('utf8'), 'name,value\nalpha,one\n');

    write(repositoryRoot, 'evidence/protected.csv', 'name,value\r\nalpha,one\r\n');
    const checkoutOnly = compareProtectedBlobs({
      baselineRef: baseline,
      targetRef: baseline,
      records,
      repositoryRoot,
      includeDirtyPaths: false
    });
    assert.deepEqual(checkoutOnly.missing, []);
    assert.deepEqual(checkoutOnly.drifted, []);
    assert.equal(checkoutOnly.snapshotHashMismatches.length, 1);

    write(repositoryRoot, 'evidence/protected.csv', 'name,value\nalpha,two\n');
    const dirty = compareProtectedBlobs({
      baselineRef: baseline,
      targetRef: baseline,
      records,
      repositoryRoot
    });
    assert.deepEqual(dirty.drifted, []);
    assert.deepEqual(dirty.dirtyProtectedPaths, ['evidence/protected.csv']);

    const changed = commitAll(repositoryRoot, 'change protected bytes');
    const changedResult = compareProtectedBlobs({
      baselineRef: baseline,
      targetRef: changed,
      records,
      repositoryRoot
    });
    assert.equal(changedResult.drifted.length, 1);
    assert.equal(changedResult.drifted[0].path, 'evidence/protected.csv');

    fs.rmSync(path.join(repositoryRoot, 'evidence/protected.csv'));
    const deleted = commitAll(repositoryRoot, 'delete protected file');
    const deletedResult = compareProtectedBlobs({
      baselineRef: baseline,
      targetRef: deleted,
      records,
      repositoryRoot
    });
    assert.deepEqual(deletedResult.missing, ['evidence/protected.csv']);
  } finally {
    fs.rmSync(repositoryRoot, {recursive: true, force: true});
  }
});

test('generated records are excluded from protected byte-drift enforcement', () => {
  const repositoryRoot = createRepository();
  try {
    write(repositoryRoot, 'evidence/source.txt', 'source\n');
    write(repositoryRoot, 'evidence/generated.json', '{"version":1}\n');
    const baseline = commitAll(repositoryRoot, 'baseline');

    write(repositoryRoot, 'evidence/generated.json', '{"version":2}\n');
    const target = commitAll(repositoryRoot, 'regenerate output');

    const result = compareProtectedBlobs({
      baselineRef: baseline,
      targetRef: target,
      records: [
        {path: 'evidence/source.txt', protectedFromByteDrift: true},
        {path: 'evidence/generated.json', protectedFromByteDrift: false}
      ],
      repositoryRoot
    });

    assert.equal(result.protectedFilesCompared, 1);
    assert.deepEqual(result.missing, []);
    assert.deepEqual(result.drifted, []);
  } finally {
    fs.rmSync(repositoryRoot, {recursive: true, force: true});
  }
});
