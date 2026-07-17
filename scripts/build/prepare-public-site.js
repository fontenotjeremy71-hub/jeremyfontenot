#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'config/publication-manifest.json'), 'utf8'));
const args = process.argv.slice(2);
const checkMode = args.includes('--check');
const outputIndex = args.indexOf('--output');
const outputArg = outputIndex >= 0 ? args[outputIndex + 1] : null;
const outputDirectory = checkMode
  ? fs.mkdtempSync(path.join(os.tmpdir(), 'jeremyfontenot-site-'))
  : path.resolve(root, outputArg || manifest.outputDirectory);

function copyFile(relativePath, required) {
  const source = path.join(root, relativePath);
  const target = path.join(outputDirectory, relativePath);
  if (!fs.existsSync(source)) {
    if (required) throw new Error(`Required public file is missing: ${relativePath}`);
    return;
  }
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.copyFileSync(source, target);
}

function copyDirectory(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(outputDirectory, relativePath);
  if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) throw new Error(`Required public directory is missing: ${relativePath}`);
  fs.cpSync(source, target, {recursive: true, force: true});
}

function routeToFile(route) {
  const clean = route.split('#')[0].split('?')[0];
  if (clean === '/') return 'index.html';
  const relative = clean.replace(/^\//, '');
  return relative.endsWith('/') ? `${relative}index.html` : relative;
}

function assertOutputFile(relativePath, context) {
  const absolute = path.join(outputDirectory, relativePath);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) throw new Error(`${context} is missing from the publication output: ${relativePath}`);
}

function validateSitemap() {
  const sitemap = fs.readFileSync(path.join(outputDirectory, 'sitemap.xml'), 'utf8');
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  for (const location of locations) {
    const url = new URL(location);
    assertOutputFile(routeToFile(url.pathname), `Sitemap route ${url.pathname}`);
  }
}

function validateLegacyRoutes() {
  const records = JSON.parse(fs.readFileSync(path.join(root, 'content/site/legacy-routes.json'), 'utf8')).routes;
  for (const record of records) {
    assertOutputFile(routeToFile(record.legacyRoute), `Compatibility route ${record.legacyRoute}`);
    assertOutputFile(routeToFile(record.targetRoute), `Foundation target ${record.targetRoute}`);
  }
}

function localLinkTarget(link, sourceFile) {
  if (!link || link.startsWith('#')) return null;
  const sourceRelative = path.relative(outputDirectory, sourceFile).split(path.sep).join('/');
  const base = new URL(`https://publication.invalid/${sourceRelative}`);
  let resolved;
  try {
    resolved = new URL(link, base);
  } catch {
    return null;
  }
  if (resolved.protocol !== 'https:' || resolved.origin !== base.origin) return null;
  return routeToFile(resolved.pathname);
}

function validateInternalLinks() {
  const htmlFiles = new Set();

  for (const entry of fs.readdirSync(outputDirectory, {withFileTypes: true})) {
    if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.add(path.join(outputDirectory, entry.name));
  }

  for (const directory of ['systems-skills', 'microsoft-365', 'home-lab', 'evidence']) {
    const candidate = path.join(outputDirectory, directory, 'index.html');
    if (fs.existsSync(candidate)) htmlFiles.add(candidate);
  }

  const sitemap = fs.readFileSync(path.join(outputDirectory, 'sitemap.xml'), 'utf8');
  for (const match of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const url = new URL(match[1]);
    const candidate = path.join(outputDirectory, routeToFile(url.pathname));
    if (candidate.endsWith('.html') && fs.existsSync(candidate)) htmlFiles.add(candidate);
  }

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const links = [...html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]);
    for (const link of links) {
      const target = localLinkTarget(link, file);
      if (!target) continue;
      assertOutputFile(target, `${path.relative(outputDirectory, file)} link ${link}`);
    }
  }
}

function validateForbiddenRoots() {
  for (const forbidden of manifest.forbiddenOutputRoots) {
    if (fs.existsSync(path.join(outputDirectory, forbidden))) throw new Error(`Forbidden source root was published: ${forbidden}`);
  }
}

try {
  const resolvedRoot = path.resolve(root);
  const resolvedOutput = path.resolve(outputDirectory);
  if (resolvedOutput === resolvedRoot) throw new Error('Publication output cannot be the repository root.');
  if (!checkMode) fs.rmSync(outputDirectory, {recursive: true, force: true});
  fs.mkdirSync(outputDirectory, {recursive: true});

  for (const file of manifest.requiredRootFiles) copyFile(file, true);
  for (const file of manifest.optionalRootFiles) copyFile(file, false);

  for (const entry of fs.readdirSync(root, {withFileTypes: true})) {
    if (!entry.isFile()) continue;
    if (manifest.rootExtensions.includes(path.extname(entry.name).toLowerCase())) copyFile(entry.name, true);
  }

  for (const directory of manifest.directories) copyDirectory(directory);

  validateForbiddenRoots();
  validateSitemap();
  validateLegacyRoutes();
  validateInternalLinks();

  const relativeOutput = checkMode ? outputDirectory : path.relative(root, outputDirectory);
  console.log(`Prepared validated public site at ${relativeOutput}.`);
} finally {
  if (checkMode) fs.rmSync(outputDirectory, {recursive: true, force: true});
}
