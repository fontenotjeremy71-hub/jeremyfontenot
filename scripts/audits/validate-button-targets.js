#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {publicHtmlFiles, root, routeSourceFiles, toPosix} = require('../lib/publication-inventory.js');

const htmlFiles = publicHtmlFiles();
const routeFiles = routeSourceFiles();
const published = new Set(htmlFiles);
const runtimeText = routeFiles.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
const errors = [];
const checked = new Set();
let anchors = 0;
let buttons = 0;
let internalTargets = 0;
let fragments = 0;
let assets = 0;
let routeReferences = 0;

function stripTags(value) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&#39;|&apos;/gi, "'").replace(/&quot;/gi, '"').replace(/\s+/g, ' ').trim();
}

function attribute(attrs, name) {
  const match = new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i').exec(attrs);
  return match ? match[1] : '';
}

function internalHref(raw) {
  if (!raw || /^(?:mailto:|tel:|javascript:|data:|blob:)/i.test(raw)) return null;
  if (/^https?:\/\//i.test(raw)) {
    const url = new URL(raw);
    if (!/^(?:www\.)?jeremyfontenot\.online$/i.test(url.hostname)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  }
  return raw;
}

function resolveTarget(source, raw, runtimeRoot = false) {
  const href = internalHref(raw.trim());
  if (href === null) return null;
  const hashAt = href.indexOf('#');
  const pathPart = (hashAt < 0 ? href : href.slice(0, hashAt)).split('?')[0];
  let fragment = hashAt < 0 ? '' : href.slice(hashAt + 1);
  try { fragment = decodeURIComponent(fragment); } catch { /* malformed fragments fail below */ }
  let relative;
  if (!pathPart) relative = source;
  else if (pathPart === '/') relative = 'index.html';
  else if (pathPart.startsWith('/') || runtimeRoot) relative = pathPart.replace(/^\/+/, '');
  else relative = toPosix(path.join(path.posix.dirname(source), pathPart));
  if (pathPart.endsWith('/') && pathPart !== '/') relative = `${relative.replace(/\/+$/, '')}/index.html`;
  relative = toPosix(path.posix.normalize(relative));
  return {relative, fragment};
}

function fragmentExists(relative, fragment) {
  if (!fragment) return true;
  const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const marker = new RegExp(`\\b(?:id|name)\\s*=\\s*["']${escaped}["']`, 'i');
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute) || !/\.html?$/i.test(relative)) return false;
  const html = fs.readFileSync(absolute, 'utf8');
  const runtimePage = html.includes('site-render.js') || ['on-prem-home-lab.html', 'home-lab-operations-proof.html'].includes(relative);
  if (!runtimePage) return marker.test(html);
  const route = relative === 'index.html' ? '/' : '/' + relative;
  const routeText = runtimeText.split(/\r?\n/).filter((line) => line.includes(`routes['${route}']`) || line.includes(`routes["${route}"]`)).join('\n');
  if (marker.test(routeText)) return true;
  if (relative === 'projects.html' && ['scvmm', 'azure-arc'].includes(fragment)) return marker.test(runtimeText) && routeText.includes('pCards');
  if (relative === 'on-prem-home-lab.html' && ['overview', 'skills', 'restore-validation', 'artifacts', 'limits'].includes(fragment)) return (runtimeText.includes(`'${fragment}'`) || marker.test(runtimeText)) && routeText.includes('casePage(');
  if (new RegExp(`\\[\\s*["']${escaped}["']\\s*,`, 'i').test(routeText)) return true;
  if (fragment === 'main') return true;
  return fragment === 'evidence' && routeText.includes('casePage(');
}

function validate(source, raw, label, runtimeRoot = false) {
  let target;
  try { target = resolveTarget(source, raw, runtimeRoot); } catch (error) {
    errors.push(`${source}: "${label}" -> ${raw} (invalid URL: ${error.message})`);
    return;
  }
  if (!target) return;
  const key = `${source}|${raw}|${runtimeRoot}`;
  if (checked.has(key)) return;
  checked.add(key);
  internalTargets += 1;
  const absolute = path.resolve(root, target.relative);
  if (absolute !== root && !absolute.startsWith(root + path.sep)) {
    errors.push(`${source}: "${label}" -> ${raw} (target escapes the published root)`);
    return;
  }
  if (!fs.existsSync(absolute)) {
    errors.push(`${source}: "${label}" -> ${raw} (target ${target.relative} does not exist)`);
    return;
  }
  if (/\.html?$/i.test(target.relative) && !published.has(target.relative)) {
    errors.push(`${source}: "${label}" -> ${raw} (HTML target is not in the publication manifest)`);
  }
  if (target.fragment) {
    fragments += 1;
    if (!fragmentExists(target.relative, target.fragment)) errors.push(`${source}: "${label}" -> ${raw} (fragment #${target.fragment} does not exist)`);
  }
}

for (const source of htmlFiles) {
  const html = fs.readFileSync(path.join(root, source), 'utf8');
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    anchors += 1;
    const attrs = match[1];
    const label = stripTags(match[2]) || attribute(attrs, 'aria-label') || '<unlabeled link>';
    const href = attribute(attrs, 'href');
    if (!href) errors.push(`${source}: "${label}" anchor has no href`);
    else validate(source, href, label);
    const target = attribute(attrs, 'target').toLowerCase();
    if (target === '_blank' && !/\brel\s*=\s*["'][^"']*\bnoopener\b/i.test(attrs)) errors.push(`${source}: "${label}" opens a new tab without rel=noopener`);
    if (target === '_blank' && internalHref(href) !== null) errors.push(`${source}: "${label}" opens an internal destination in a new tab`);
  }
  for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    buttons += 1;
    const attrs = match[1];
    const label = stripTags(match[2]) || attribute(attrs, 'aria-label');
    if (!label) errors.push(`${source}: button has no accessible label`);
    const type = attribute(attrs, 'type').toLowerCase();
    if (!type) errors.push(`${source}: "${label || '<unlabeled button>'}" button has no explicit type`);
  }
  for (const match of html.matchAll(/<(?:img|script|link|source|video|audio)\b[^>]*?\s(?:src|href|poster)\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    assets += 1;
    validate(source, match[1], 'page asset');
  }
}

for (const source of routeFiles) {
  const text = fs.readFileSync(path.join(root, source), 'utf8');
  const values = new Set();
  for (const match of text.matchAll(/\b(?:href|src)\\?=[\\]?["'](\/[^"']+)[\\]?["']/gi)) values.add(match[1].replaceAll('\\/', '/'));
  for (const match of text.matchAll(/["'](\/(?:assets|projects|evidence-library|microsoft-365|home-lab|systems-skills)[^"']*|\/[a-z0-9][a-z0-9._/-]*\.(?:html|txt|md|pdf|png|jpe?g|webp|svg|json|csv)(?:#[^"']*)?)["']/gi)) values.add(match[1]);
  for (const value of values) {
    routeReferences += 1;
    validate(source, value, 'route-generated reference', true);
  }
}

const browserMapPath = 'assets/data/evidence-skill-map-browser.json';
for (const record of JSON.parse(fs.readFileSync(path.join(root, browserMapPath), 'utf8')).relationships) {
  if (record.publicRoute) {
    routeReferences += 1;
    validate(browserMapPath, record.publicRoute, `generated evidence relationship ${record.evidenceId}`, true);
  }
}

if (errors.length) {
  const unique = [...new Set(errors)].sort();
  console.error(`Sitewide target validation failed with ${unique.length} issue(s):`);
  for (const error of unique) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Sitewide target validation passed: ${htmlFiles.length} published HTML pages, ${anchors} anchors, ${buttons} buttons, ${assets} asset references, ${routeReferences} route-generated references, ${internalTargets} unique internal targets, and ${fragments} fragments checked.`);
