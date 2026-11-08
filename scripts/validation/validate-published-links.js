'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'site-linkcheck');

if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error(`ERROR: Production build not found: ${root}`);
  process.exit(2);
}

const pages = [];
const errors = [];
const categories = new Map();
const idCache = new Map();
let checked = 0;

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(absolute);
    } else if (entry.isFile() && /\.html?$/i.test(entry.name)) {
      pages.push(absolute);
    }
  }
}

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function report(category, source, reference) {
  errors.push({ category, source, reference });
  categories.set(category, (categories.get(category) || 0) + 1);
}

function anchors(file) {
  if (idCache.has(file)) return idCache.get(file);

  const html = fs.readFileSync(file, 'utf8');
  const found = new Set();

  for (const match of html.matchAll(/\b(?:id|name)\s*=\s*["']([^"']+)["']/gi)) {
    found.add(match[1]);
  }

  idCache.set(file, found);
  return found;
}

function validate(source, reference) {
  const href = reference.trim();

  if (!href || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) {
    return;
  }

  checked++;

  let url;

  try {
    url = new URL(href, 'https://portfolio.local/' +
      path.relative(root, source).replaceAll('\\', '/'));
  } catch {
    report('Invalid URL', source, href);
    return;
  }

  if (url.origin !== 'https://portfolio.local') return;

  const relative = decode(url.pathname).replace(/^\/+/, '');
  let target = path.resolve(root, relative);

  if (target !== root && !target.startsWith(root + path.sep)) {
    report('Outside publication root', source, href);
    return;
  }

  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    target = path.join(target, 'index.html');
  }

  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    report('Missing published target', source, href);
    return;
  }

  if (url.hash && /\.html?$/i.test(target)) {
    const fragment = decode(url.hash.slice(1));

    if (fragment && !anchors(target).has(fragment)) {
      report('Missing HTML fragment', source, href);
    }
  }
}

walk(root);

for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');

  for (const match of html.matchAll(
    /\s(?:href|src)\s*=\s*["']([^"']+)["']/gi
  )) {
    validate(page, match[1]);
  }
}

console.log(`Production directory: ${root}`);
console.log(`HTML pages checked: ${pages.length}`);
console.log(`Internal references checked: ${checked}`);

if (errors.length) {
  console.error(`FAIL: ${errors.length} link issue(s)`);

  for (const [category, count] of categories) {
    console.error(`  ${category}: ${count}`);
  }

  console.error('\nFirst 25 issues:');

  for (const error of errors.slice(0, 25)) {
    console.error(
      `  ${path.relative(root, error.source)}: ` +
      `${error.category}: ${error.reference}`
    );
  }

  process.exitCode = 1;
} else {
  console.log('PASS: All published HTML links and fragments validated.');
}
