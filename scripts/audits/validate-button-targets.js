#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const ignoredRoots = new Set(['archive', 'node_modules', '.git', '.site']);
const htmlFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
    if (entry.isDirectory() && ignoredRoots.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) htmlFiles.push(absolute);
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

function resolveInternal(sourceFile, href) {
  if (!href || /^(mailto:|tel:|javascript:|data:)/i.test(href)) return null;
  let normalized = href.trim();
  if (/^https?:\/\//i.test(normalized)) {
    let url;
    try { url = new URL(normalized); } catch { return null; }
    if (!/^(www\.)?jeremyfontenot\.online$/i.test(url.hostname)) return null;
    normalized = `${url.pathname}${url.search}${url.hash}`;
  }

  const [withoutFragment, fragment = ''] = normalized.split('#', 2);
  const cleanPath = withoutFragment.split('?')[0];
  let targetFile;

  if (!cleanPath) {
    targetFile = sourceFile;
  } else if (cleanPath === '/') {
    targetFile = path.join(root, 'index.html');
  } else {
    const relative = cleanPath.startsWith('/')
      ? cleanPath.slice(1)
      : path.join(path.relative(root, path.dirname(sourceFile)), cleanPath);
    let resolved = path.resolve(root, relative);
    if (cleanPath.endsWith('/')) resolved = path.join(resolved, 'index.html');
    targetFile = resolved;
  }

  return {targetFile, fragment: decodeURIComponent(fragment || '')};
}

function hasFragment(targetFile, fragment) {
  if (!fragment) return true;
  if (!fs.existsSync(targetFile) || !targetFile.toLowerCase().endsWith('.html')) return false;
  const html = fs.readFileSync(targetFile, 'utf8');
  const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b(?:id|name)\\s*=\\s*["']${escaped}["']`, 'i').test(html);
}

function targetDescriptor(targetFile, fragment) {
  const rel = path.relative(root, targetFile).replaceAll('\\', '/').toLowerCase();
  let text = rel;
  if (fs.existsSync(targetFile) && targetFile.toLowerCase().endsWith('.html')) {
    const html = fs.readFileSync(targetFile, 'utf8');
    if (fragment) {
      const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const marker = new RegExp(`<[^>]+\\b(?:id|name)\\s*=\\s*["']${escaped}["'][^>]*>`, 'i');
      const match = marker.exec(html);
      if (match) {
        const start = Math.max(0, match.index - 600);
        const end = Math.min(html.length, match.index + 1800);
        text += ` ${stripTags(html.slice(start, end)).toLowerCase()}`;
      }
    } else {
      text += ` ${stripTags(html.slice(0, 5000)).toLowerCase()}`;
    }
  }
  return text;
}

const semanticRules = [
  {pattern: /\b(screenshot|screenshots)\b/i, expect: /screenshot|evidence-gallery|\.png\b|\.jpe?g\b|\.webp\b/i, label: 'screenshot evidence'},
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

const errors = [];
let anchorsChecked = 0;
let internalChecked = 0;
let semanticChecked = 0;

for (const sourceFile of htmlFiles) {
  const html = fs.readFileSync(sourceFile, 'utf8');
  const sourceRel = path.relative(root, sourceFile).replaceAll('\\', '/');
  const anchorRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchorRegex)) {
    anchorsChecked += 1;
    const attrs = match[1];
    const text = stripTags(match[2]);
    const hrefMatch = /\bhref\s*=\s*["']([^"']+)["']/i.exec(attrs);
    if (!hrefMatch) {
      errors.push(`${sourceRel}: anchor "${text || '<no text>'}" has no href`);
      continue;
    }

    const href = hrefMatch[1];
    const resolved = resolveInternal(sourceFile, href);
    if (!resolved) continue;
    internalChecked += 1;

    const {targetFile, fragment} = resolved;
    if (!fs.existsSync(targetFile)) {
      errors.push(`${sourceRel}: "${text}" -> ${href} (target does not exist)`);
      continue;
    }
    if (fragment && !hasFragment(targetFile, fragment)) {
      errors.push(`${sourceRel}: "${text}" -> ${href} (fragment #${fragment} does not exist)`);
      continue;
    }

    const descriptor = targetDescriptor(targetFile, fragment);
    for (const rule of semanticRules) {
      if (!rule.pattern.test(text)) continue;
      semanticChecked += 1;
      if (!rule.expect.test(`${href.toLowerCase()} ${descriptor}`)) {
        errors.push(`${sourceRel}: "${text}" -> ${href} does not match its ${rule.label} label`);
      }
    }
  }
}

if (errors.length) {
  console.error(`CTA/link audit failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`CTA/link audit passed: ${anchorsChecked} anchors checked, ${internalChecked} internal targets verified, ${semanticChecked} high-confidence label/target checks passed.`);
