const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const siteRoot = path.resolve(root, 'site');
const npmCli = process.env.npm_execpath;

if (!npmCli || !fs.existsSync(npmCli)) {
  throw new Error('Run this validation through npm so the active npm CLI can be resolved.');
}

if (path.dirname(siteRoot) !== root || path.basename(siteRoot) !== 'site') {
  throw new Error(`Refusing to use unexpected publication target: ${siteRoot}`);
}

if (fs.existsSync(siteRoot)) {
  throw new Error(`Publication target must not exist before this check: ${siteRoot}`);
}

function listFiles(directory, relative = '') {
  const absolute = path.join(directory, relative);
  return fs.readdirSync(absolute, { withFileTypes: true })
    .flatMap((entry) => {
      const child = path.join(relative, entry.name);
      return entry.isDirectory() ? listFiles(directory, child) : [child];
    })
    .sort((left, right) => left.localeCompare(right));
}

function publicationHash() {
  const aggregate = crypto.createHash('sha256');
  const files = listFiles(siteRoot);
  for (const relative of files) {
    const bytes = fs.readFileSync(path.join(siteRoot, relative));
    aggregate.update(relative.replaceAll('\\', '/'));
    aggregate.update('\0');
    aggregate.update(String(bytes.length));
    aggregate.update('\0');
    aggregate.update(crypto.createHash('sha256').update(bytes).digest('hex'));
    aggregate.update('\n');
  }
  return { files: files.length, hash: aggregate.digest('hex') };
}

function runNpm(script) {
  execFileSync(process.execPath, [npmCli, 'run', script], { cwd: root, stdio: 'inherit' });
}

let createdSite = false;
try {
  runNpm('build:site');
  createdSite = true;
  const first = publicationHash();

  runNpm('build:site');
  const second = publicationHash();

  if (first.files !== second.files || first.hash !== second.hash) {
    throw new Error(
      `Repeated publication builds differ: first=${first.files}/${first.hash}, second=${second.files}/${second.hash}`,
    );
  }

  runNpm('check:m365');
  console.log(`M365 repeated publication build is deterministic: ${second.files} files, SHA-256 ${second.hash}`);
} finally {
  if (createdSite && fs.existsSync(siteRoot)) {
    fs.rmSync(siteRoot, { recursive: true, force: false });
  }
}
