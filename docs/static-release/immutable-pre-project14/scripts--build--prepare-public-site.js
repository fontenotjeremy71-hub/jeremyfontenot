#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'config/publication-manifest.json'), 'utf8'));
const sharePointCompatibility = JSON.parse(fs.readFileSync(path.join(root, 'content/microsoft-365/sharepoint-compatibility-routes.json'), 'utf8'));
const args = process.argv.slice(2);
const checkMode = args.includes('--check');
const outputIndex = args.indexOf('--output');
const outputArg = outputIndex >= 0 ? args[outputIndex + 1] : null;

function isDescendant(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative !== '' && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative);
}

function resolveOwnedOutputDirectory() {
  if (checkMode) return fs.mkdtempSync(path.join(os.tmpdir(), 'jeremyfontenot-site-'));

  const requested = outputArg || manifest.outputDirectory;
  if (!requested || path.isAbsolute(requested) || requested === '.' || requested === '..' || requested.includes('/') || requested.includes('\\')) {
    throw new Error(`Unsafe publication output path: ${requested || '<empty>'}`);
  }
  if (!/^\.?site(?:-[a-z0-9-]+)?$/i.test(requested)) {
    throw new Error(`Publication output must be an owned top-level site directory: ${requested}`);
  }

  const resolved = path.resolve(root, requested);
  if (path.dirname(resolved) !== root) throw new Error(`Publication output must remain directly under the repository root: ${requested}`);
  if (resolved === root) throw new Error('Publication output cannot be the repository root.');
  if (fs.existsSync(resolved) && fs.lstatSync(resolved).isSymbolicLink()) throw new Error(`Publication output cannot be a symbolic link: ${requested}`);
  return resolved;
}

const outputDirectory = resolveOwnedOutputDirectory();

function normalizeManifestPath(value, context) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${context} must be a nonempty relative path.`);
  if (value.includes('\0') || path.isAbsolute(value) || /^[A-Za-z]:[\\/]/.test(value)) throw new Error(`${context} must not be absolute: ${value}`);

  const slashPath = value.replaceAll('\\', '/');
  const normalized = path.posix.normalize(slashPath);
  if (normalized !== slashPath || normalized === '.' || normalized === '..' || normalized.startsWith('../') || normalized.startsWith('/')) {
    throw new Error(`${context} must be a normalized repository-relative path without traversal: ${value}`);
  }

  const source = path.resolve(root, ...normalized.split('/'));
  const target = path.resolve(outputDirectory, ...normalized.split('/'));
  if (!isDescendant(root, source)) throw new Error(`${context} escapes the repository root: ${value}`);
  if (!isDescendant(outputDirectory, target)) throw new Error(`${context} escapes the publication output: ${value}`);

  return {relativePath: normalized, source, target};
}

function resolveOutputPath(relativePath, context) {
  if (typeof relativePath !== 'string' || !relativePath) throw new Error(`${context} has an empty output path.`);
  const slashPath = relativePath.replaceAll('\\', '/');
  const normalized = path.posix.normalize(slashPath);
  if (normalized !== slashPath || normalized === '.' || normalized === '..' || normalized.startsWith('../') || normalized.startsWith('/')) {
    throw new Error(`${context} contains an unsafe output path: ${relativePath}`);
  }
  const absolute = path.resolve(outputDirectory, ...normalized.split('/'));
  if (!isDescendant(outputDirectory, absolute)) throw new Error(`${context} escapes the publication output: ${relativePath}`);
  return absolute;
}

function assertNoSymlinks(absolutePath, relativePath, context) {
  const status = fs.lstatSync(absolutePath);
  if (status.isSymbolicLink()) throw new Error(`${context} cannot contain a symbolic link: ${relativePath}`);
  if (!status.isDirectory()) return;

  for (const entry of fs.readdirSync(absolutePath, {withFileTypes: true})) {
    const childAbsolute = path.join(absolutePath, entry.name);
    const childRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    const childStatus = fs.lstatSync(childAbsolute);
    if (entry.isSymbolicLink() || childStatus.isSymbolicLink()) {
      throw new Error(`${context} cannot contain a symbolic link: ${childRelative}`);
    }
    if (childStatus.isDirectory()) assertNoSymlinks(childAbsolute, childRelative, context);
  }
}

function copyFile(relativePath, required) {
  const resolved = normalizeManifestPath(relativePath, `Publication file ${relativePath}`);
  if (!fs.existsSync(resolved.source)) {
    if (required) throw new Error(`Required public file is missing: ${resolved.relativePath}`);
    return;
  }
  const status = fs.lstatSync(resolved.source);
  if (status.isSymbolicLink()) throw new Error(`Publication file cannot be a symbolic link: ${resolved.relativePath}`);
  if (!status.isFile()) throw new Error(`Publication file is not a regular file: ${resolved.relativePath}`);
  fs.mkdirSync(path.dirname(resolved.target), {recursive: true});
  fs.copyFileSync(resolved.source, resolved.target);
}

function copyDirectory(relativePath) {
  const resolved = normalizeManifestPath(relativePath, `Publication directory ${relativePath}`);
  if (!fs.existsSync(resolved.source)) throw new Error(`Required public directory is missing: ${resolved.relativePath}`);
  const status = fs.lstatSync(resolved.source);
  if (status.isSymbolicLink()) throw new Error(`Publication directory cannot be a symbolic link: ${resolved.relativePath}`);
  if (!status.isDirectory()) throw new Error(`Required public directory is missing: ${resolved.relativePath}`);
  assertNoSymlinks(resolved.source, resolved.relativePath, 'Publication directory');
  fs.cpSync(resolved.source, resolved.target, {recursive: true, force: true, dereference: false});
}

function materializeSharePointCompatibilityAssets() {
  const seen = new Set();
  for (const mapping of sharePointCompatibility.mappings) {
    const legacyPath = String(mapping.legacyRoute || '').replace(/^\//, '');
    const canonicalPath = String(mapping.canonicalAsset || '').replace(/^\//, '');
    if (!legacyPath.startsWith('evidence-library/preserved-sharepoint/')) throw new Error(`Compatibility route is outside the preserved SharePoint collection: ${mapping.legacyRoute}`);
    if (seen.has(legacyPath.toLowerCase())) throw new Error(`Duplicate SharePoint compatibility route: ${mapping.legacyRoute}`);
    seen.add(legacyPath.toLowerCase());
    const source = normalizeManifestPath(canonicalPath, `Compatibility asset ${mapping.canonicalAsset}`);
    const target = resolveOutputPath(legacyPath, `Compatibility route ${mapping.legacyRoute}`);
    if (!fs.existsSync(source.source) || !fs.statSync(source.source).isFile()) throw new Error(`Compatibility asset source is missing: ${mapping.canonicalAsset}`);
    if (fs.existsSync(target)) throw new Error(`Compatibility route would overwrite published content: ${mapping.legacyRoute}`);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.copyFileSync(source.source, target);
  }
}

function collectHtmlFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectHtmlFiles(absolute));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(absolute);
  }
  return files;
}

function ensureReadinessInPrimaryNavigation() {
  const navPattern = /(<div class="nav-links" id="primary-menu">)([\s\S]*?)(<\/div>)/gi;
  const readinessPattern = /href=["'][^"']*systems-administration\.html(?:[#?][^"']*)?["']/i;
  const readinessLink = '<a href="/systems-administration.html">Readiness</a>';
  let inspected = 0;
  let normalized = 0;

  for (const file of collectHtmlFiles(outputDirectory)) {
    const html = fs.readFileSync(file, 'utf8');
    if (!html.includes('class="nav-links"') || !html.includes('id="primary-menu"')) continue;

    inspected += 1;
    let foundPrimaryNavigation = false;
    const updated = html.replace(navPattern, (match, opening, links, closing) => {
      foundPrimaryNavigation = true;
      if (readinessPattern.test(links)) return match;

      const withReadiness = links.replace(/(<a\b[^>]*>Home<\/a>)/i, `$1${readinessLink}`);
      if (withReadiness === links) {
        throw new Error(`Primary navigation is missing a recognizable Home link: ${path.relative(outputDirectory, file)}`);
      }
      return `${opening}${withReadiness}${closing}`;
    });

    if (!foundPrimaryNavigation) {
      throw new Error(`Primary navigation markup could not be normalized: ${path.relative(outputDirectory, file)}`);
    }
    if (!readinessPattern.test(updated)) {
      throw new Error(`Primary navigation is missing Readiness after normalization: ${path.relative(outputDirectory, file)}`);
    }
    if (updated !== html) {
      fs.writeFileSync(file, updated, 'utf8');
      normalized += 1;
    }
  }

  if (inspected === 0) throw new Error('No primary navigation menus were found in the publication output.');
  console.log(`Validated Readiness navigation across ${inspected} published pages; normalized ${normalized}.`);
}

function routeToFile(route) {
  const clean = route.split('#')[0].split('?')[0];
  if (clean === '/') return 'index.html';
  const relative = clean.replace(/^\//, '');
  return relative.endsWith('/') ? `${relative}index.html` : relative;
}

function assertOutputFile(relativePath, context) {
  const absolute = resolveOutputPath(relativePath, context);
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
  return routeToFile(decodeURIComponent(resolved.pathname));
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
    const resolved = normalizeManifestPath(forbidden, `Forbidden output root ${forbidden}`);
    if (fs.existsSync(resolved.target)) throw new Error(`Forbidden source root was published: ${resolved.relativePath}`);
  }
}

try {
  for (const file of manifest.requiredRootFiles) normalizeManifestPath(file, `requiredRootFiles entry ${file}`);
  for (const file of manifest.optionalRootFiles) normalizeManifestPath(file, `optionalRootFiles entry ${file}`);
  for (const directory of manifest.directories) normalizeManifestPath(directory, `directories entry ${directory}`);
  for (const forbidden of manifest.forbiddenOutputRoots) normalizeManifestPath(forbidden, `forbiddenOutputRoots entry ${forbidden}`);

  if (!checkMode) fs.rmSync(outputDirectory, {recursive: true, force: true});
  fs.mkdirSync(outputDirectory, {recursive: true});

  for (const file of manifest.requiredRootFiles) copyFile(file, true);
  for (const file of manifest.optionalRootFiles) copyFile(file, false);

  for (const entry of fs.readdirSync(root, {withFileTypes: true})) {
    if (!entry.isFile()) continue;
    if (manifest.rootExtensions.includes(path.extname(entry.name).toLowerCase())) copyFile(entry.name, true);
  }

  for (const directory of manifest.directories) copyDirectory(directory);
  materializeSharePointCompatibilityAssets();

  ensureReadinessInPrimaryNavigation();
  assertNoSymlinks(outputDirectory, path.basename(outputDirectory), 'Publication output');
  validateForbiddenRoots();
  validateSitemap();
  validateLegacyRoutes();
  validateInternalLinks();

  const relativeOutput = checkMode ? outputDirectory : path.relative(root, outputDirectory);
  console.log(`Prepared validated public site at ${relativeOutput}.`);
} finally {
  if (checkMode) fs.rmSync(outputDirectory, {recursive: true, force: true});
}
