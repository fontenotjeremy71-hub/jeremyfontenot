#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const htmlFiles = [];
const routeSourceFiles = [];
const ignoredPrefixes = [
  'archive/',
  'artifacts/',
  'evidence-library/preserved-sharepoint/',
  'node_modules/',
  '.git/',
  '.site/'
];

function rel(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

function isIgnored(relative) {
  return ignoredPrefixes.some((prefix) => relative.startsWith(prefix));
}

function shouldAuditHtml(file) {
  const relative = rel(file);
  if (isIgnored(relative)) return false;

  // Root-level portfolio pages and published visitor-facing landing pages.
  if (!relative.includes('/')) return true;
  if (/^(systems-skills|evidence|microsoft-365|home-lab)\/index\.html$/i.test(relative)) return true;
  if (/^evidence-library\/projects\/.+\/index\.html$/i.test(relative)) return true;
  if (/^projects\/.+\/evidence\/index\.html$/i.test(relative)) return true;
  if (/^projects\/.+\/index\.html$/i.test(relative)) return true;
  return false;
}

function shouldAuditRouteSource(file) {
  const relative = rel(file);
  return /^assets\/js\/(?:routes-[^/]+|site|site-render)\.js$/i.test(relative);
}

function walk(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
    const absolute = path.join(directory, entry.name);
    const relative = rel(absolute);
    if (entry.isDirectory() && isIgnored(`${relative}/`)) continue;
    if (entry.isDirectory()) {
      walk(absolute);
      continue;
    }
    if (!entry.isFile()) continue;
    if (entry.name.toLowerCase().endsWith('.html') && shouldAuditHtml(absolute)) htmlFiles.push(absolute);
    if (entry.name.toLowerCase().endsWith('.js') && shouldAuditRouteSource(absolute)) routeSourceFiles.push(absolute);
  }
}

walk(root);

function stripTags(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeInternalHref(rawHref) {
  if (!rawHref) return null;
  let href = rawHref.trim();
  if (!href || /^(mailto:|tel:|javascript:|data:|blob:)/i.test(href)) return null;

  if (/^https?:\/\//i.test(href)) {
    let url;
    try { url = new URL(href); } catch { return null; }
    if (!/^(www\.)?jeremyfontenot\.online$/i.test(url.hostname)) return null;
    href = `${url.pathname}${url.search}${url.hash}`;
  }
  return href;
}

function resolveInternal(sourceFile, rawHref, runtimeRoot = false) {
  const normalized = normalizeInternalHref(rawHref);
  if (normalized === null) return null;

  const hashIndex = normalized.indexOf('#');
  const beforeHash = hashIndex >= 0 ? normalized.slice(0, hashIndex) : normalized;
  const fragment = hashIndex >= 0 ? normalized.slice(hashIndex + 1) : '';
  const cleanPath = beforeHash.split('?')[0];
  let targetFile;

  if (!cleanPath) {
    if (runtimeRoot) return null;
    targetFile = sourceFile;
  } else if (cleanPath === '/') {
    targetFile = path.join(root, 'index.html');
  } else {
    const relative = cleanPath.startsWith('/') || runtimeRoot
      ? cleanPath.replace(/^\//, '')
      : path.join(path.relative(root, path.dirname(sourceFile)), cleanPath);
    let resolved = path.resolve(root, relative);
    if (cleanPath.endsWith('/')) resolved = path.join(resolved, 'index.html');
    targetFile = resolved;
  }

  return {targetFile, fragment: decodeURIComponent(fragment || '')};
}

function allRuntimeSourceText() {
  return routeSourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
}
const runtimeSourceText = allRuntimeSourceText();

function hasFragment(targetFile, fragment) {
  if (!fragment) return true;
  const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const marker = new RegExp(`\\b(?:id|name)\\s*=\\s*["']${escaped}["']`, 'i');
  if (fs.existsSync(targetFile) && targetFile.toLowerCase().endsWith('.html')) {
    if (marker.test(fs.readFileSync(targetFile, 'utf8'))) return true;
  }
  // Route-driven pages may define the anchor in JS rather than in their shell HTML.
  return marker.test(runtimeSourceText);
}

function targetDescriptor(targetFile, fragment) {
  const relative = rel(targetFile).toLowerCase();
  let text = relative;
  if (fs.existsSync(targetFile) && targetFile.toLowerCase().endsWith('.html')) {
    const html = fs.readFileSync(targetFile, 'utf8');
    if (fragment) {
      const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const marker = new RegExp(`<[^>]+\\b(?:id|name)\\s*=\\s*["']${escaped}["'][^>]*>`, 'i');
      const match = marker.exec(html);
      if (match) {
        const start = Math.max(0, match.index - 250);
        const end = Math.min(html.length, match.index + 2200);
        text += ` ${stripTags(html.slice(start, end)).toLowerCase()}`;
      }
    } else {
      text += ` ${stripTags(html.slice(0, 5000)).toLowerCase()}`;
    }
  }
  text += ` ${runtimeSourceText.toLowerCase()}`;
  return text;
}

const semanticRules = [
  {pattern: /\b(screenshot|screenshots)\b/i, expect: /screenshot|evidence-gallery|\.png\b|\.jpe?g\b|\.webp\b|evidence-manifest\.json/i, label: 'screenshot evidence'},
  {pattern: /\bmanifest\b/i, expect: /manifest|\.json\b|\.csv\b/i, label: 'manifest'},
  {pattern: /\b(resume|professional experience|employment history)\b/i, expect: /resume\.html|assets\/resume\/.*\.pdf/i, label: 'resume/experience'},
  {pattern: /\bcoverage( dashboard)?\b/i, expect: /dashboard\.html/i, label: 'coverage dashboard'},
  {pattern: /\bscvmm\b/i, expect: /scvmm/i, label: 'SCVMM'},
  {pattern: /\bwindows admin center\b/i, expect: /windows-admin-center/i, label: 'Windows Admin Center'},
  {pattern: /\bmacvm01\b/i, expect: /macvm01/i, label: 'MACVM01'},
  {pattern: /\bapp01\b.*\bstorage|\bstorage[- ]expansion\b/i, expect: /app01-storage-expansion/i, label: 'APP01 storage'},
  {pattern: /\brestore\b/i, expect: /restore|infrastructure-validation-2026-07/i, label: 'restore'},
  {pattern: /\bclaim map\b/i, expect: /claim-map|proof-map/i, label: 'claim map'}
];

function isCtaLike(attrs, text) {
  if (!text || text.length > 100) return false;
  if (/\bclass\s*=\s*["'][^"']*(?:button|evidence-link|screenshot-preview)[^"']*["']/i.test(attrs)) return true;
  return /^(open|review|inspect|trace|view|browse|search|download|return|discuss|audit|explore)\b/i.test(text);
}

const errors = [];
const checkedKeys = new Set();
let anchorsChecked = 0;
let internalChecked = 0;
let assetTargetsChecked = 0;
let runtimeLinksChecked = 0;
let semanticChecked = 0;

function validateTarget(sourceFile, href, label, options = {}) {
  const resolved = resolveInternal(sourceFile, href, Boolean(options.runtimeRoot));
  if (!resolved) return;
  const {targetFile, fragment} = resolved;
  const key = `${rel(sourceFile)}|${href}|${options.runtimeRoot ? 'runtime' : 'static'}`;
  if (checkedKeys.has(key)) return;
  checkedKeys.add(key);
  internalChecked += 1;

  if (!fs.existsSync(targetFile)) {
    errors.push(`${rel(sourceFile)}: "${label}" -> ${href} (target does not exist)`);
    return;
  }
  if (fragment && !hasFragment(targetFile, fragment)) {
    errors.push(`${rel(sourceFile)}: "${label}" -> ${href} (fragment #${fragment} does not exist)`);
    return;
  }

  if (!options.cta) return;
  const descriptor = targetDescriptor(targetFile, fragment);
  for (const rule of semanticRules) {
    if (!rule.pattern.test(label)) continue;
    semanticChecked += 1;
    if (!rule.expect.test(`${href.toLowerCase()} ${descriptor}`)) {
      errors.push(`${rel(sourceFile)}: "${label}" -> ${href} does not match its ${rule.label} label`);
    }
  }
}

for (const sourceFile of htmlFiles) {
  const html = fs.readFileSync(sourceFile, 'utf8');
  const anchorRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchorRegex)) {
    anchorsChecked += 1;
    const attrs = match[1];
    const text = stripTags(match[2]);
    const hrefMatch = /\bhref\s*=\s*["']([^"']+)["']/i.exec(attrs);
    if (!hrefMatch) {
      if (isCtaLike(attrs, text)) errors.push(`${rel(sourceFile)}: CTA "${text || '<no text>'}" has no href`);
      continue;
    }
    validateTarget(sourceFile, hrefMatch[1], text || '<link>', {cta: isCtaLike(attrs, text)});
  }

  // Verify local non-anchor assets such as scripts, stylesheets, images, icons, and media.
  const assetRegex = /<(?:img|script|link|source|video|audio)\b[^>]*?\b(?:src|href|poster)\s*=\s*["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(assetRegex)) {
    const href = match[1];
    const before = internalChecked;
    validateTarget(sourceFile, href, 'asset');
    if (internalChecked > before) assetTargetsChecked += 1;
  }
}

// Route-driven pages store rendered anchors in JavaScript template strings. Audit all
// root-relative href/src values here so CI catches broken links that static HTML scans miss.
for (const sourceFile of routeSourceFiles) {
  const source = fs.readFileSync(sourceFile, 'utf8');
  const attrRegex = /\b(?:href|src)\\?=[\\]?["'](\/[^"']+)[\\]?["']/gi;
  for (const match of source.matchAll(attrRegex)) {
    runtimeLinksChecked += 1;
    validateTarget(sourceFile, match[1].replaceAll('\\/', '/'), 'route-generated link', {runtimeRoot: true});
  }

  // Also audit path strings used by route helpers such as actions([...]) and evidence arrays.
  const pathStringRegex = /["'](\/(?:assets|projects|evidence-library|microsoft-365|home-lab|systems-skills)[^"']*|\/[a-z0-9][a-z0-9._/-]*\.(?:html|txt|md|pdf|png|jpe?g|webp|svg|json)(?:#[^"']*)?)["']/gi;
  for (const match of source.matchAll(pathStringRegex)) {
    runtimeLinksChecked += 1;
    validateTarget(sourceFile, match[1], 'route path', {runtimeRoot: true});
  }
}

if (errors.length) {
  console.error(`Portfolio link audit failed with ${errors.length} issue(s):`);
  for (const error of [...new Set(errors)].sort()) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Portfolio link audit passed: ${htmlFiles.length} live HTML pages, ${routeSourceFiles.length} route sources, ${anchorsChecked} anchors, ${assetTargetsChecked} local asset references, ${runtimeLinksChecked} route-generated references, ${internalChecked} unique internal targets, and ${semanticChecked} high-confidence label/target checks verified.`);
