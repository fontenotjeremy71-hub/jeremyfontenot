#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const siteOrigin = 'https://jeremyfontenot.online';
const linkStatus = JSON.parse(fs.readFileSync(path.join(root, 'content/microsoft-365/sharepoint-archival-link-status.json'), 'utf8'));
const checkMode = process.argv.includes('--check');
const sharedStyle = '/assets/css/preserved-export.css';
const sharedScript = '/assets/js/preserved-export.js';
const unavailableImage = '/assets/images/unavailable-preserved-asset.svg';
const genericUnavailableDestination = '/evidence-library/preserved-sharepoint/link-integrity.html#unavailable-site-relative';

function targetId(targetPath) {
  return `target-${crypto.createHash('sha256').update(targetPath).digest('hex').slice(0, 12)}`;
}

function routePath(value, sourceRelative) {
  try {
    return decodeURIComponent(new URL(value, new URL(`/${sourceRelative}`, siteOrigin)).pathname);
  } catch {
    return '';
  }
}

function repositoryTarget(value, sourceRelative) {
  const pathname = routePath(value, sourceRelative);
  if (!pathname) return null;
  const relative = pathname.replace(/^\/+/, '');
  const absolute = path.resolve(root, ...relative.split('/'));
  const boundary = path.relative(root, absolute);
  if (!boundary || boundary === '..' || boundary.startsWith(`..${path.sep}`) || path.isAbsolute(boundary)) return null;
  if (pathname.endsWith('/')) return path.join(absolute, 'index.html');
  return absolute;
}

function replaceMissingAssets(html, sourceRelative) {
  let assetChanges = 0;
  let updated = html.replace(/<link\b[^>]*\brel\s*=\s*["'][^"']*stylesheet[^"']*["'][^>]*>/gi, (tag) => {
    const href = /\bhref\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href || href === sharedStyle || /^(?:data:|https?:\/\/|\/\/)/i.test(href)) return tag;
    const target = repositoryTarget(href, sourceRelative);
    if (target && fs.existsSync(target)) return tag;
    assetChanges += 1;
    return `<link rel="stylesheet" href="${sharedStyle}">`;
  });
  updated = updated.replace(/<link\b[^>]*\brel\s*=\s*["'][^"']*(?:icon|shortcut)[^"']*["'][^>]*>/gi, (tag) => {
    const href = /\shref\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href || /^(?:data:|https?:\/\/|\/\/)/i.test(href)) return tag;
    const target = repositoryTarget(href, sourceRelative);
    if (target && fs.existsSync(target)) return tag;
    assetChanges += 1;
    return '<link rel="icon" href="/assets/logos/favicon_64x64.png">';
  });
  updated = updated.replace(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*><\/script>/gi, (tag, src) => {
    if (src === sharedScript || /^(?:data:|https?:\/\/|\/\/)/i.test(src)) return tag;
    const target = repositoryTarget(src, sourceRelative);
    if (target && fs.existsSync(target)) return tag;
    assetChanges += 1;
    return `<script src="${sharedScript}" defer></script>`;
  });
  updated = updated.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = /\ssrc\s*=\s*(["'])([^"']*)\1/i.exec(tag);
    const src = srcMatch?.[2] || '';
    if (src === unavailableImage || /^(?:data:|https?:\/\/|\/\/)/i.test(src)) return tag;
    const target = src ? repositoryTarget(src, sourceRelative) : null;
    if (target && fs.existsSync(target)) return tag;
    if (!src && !/\bdata-offline-src\s*=\s*["']site-relative["']/i.test(tag)) return tag;
    let replacement = srcMatch ? tag.replace(srcMatch[0], ` src="${unavailableImage}"`) : tag.replace(/<img\b/i, `<img src="${unavailableImage}"`);
    const altMatch = /\salt\s*=\s*(["'])([^"']*)\1/i.exec(replacement);
    const existingAlt = altMatch?.[2]?.trim();
    const alt = existingAlt && !/^preserved sharepoint evidence image$/i.test(existingAlt)
      ? `Unavailable preserved asset — ${existingAlt}`
      : 'Unavailable preserved SharePoint source asset';
    replacement = altMatch ? replacement.replace(altMatch[0], ` alt="${alt}"`) : replacement.replace(/<img\b/i, `<img alt="${alt}"`);
    assetChanges += 1;
    return replacement.replace(/\sdata-public-asset-status\s*=\s*["'][^"']*["']/i, '')
      .replace(/<img\b/i, '<img data-public-asset-status="unavailable"');
  });
  return {html: updated, assetChanges};
}

function normalizeFile(sourceRelative, findings) {
  const absolute = path.join(root, sourceRelative);
  if (!fs.existsSync(absolute)) throw new Error(`Preserved public derivative is missing: ${sourceRelative}`);
  const original = fs.readFileSync(absolute, 'utf8');
  const targetMap = new Map(findings.map((finding) => [decodeURIComponent(finding.targetPath), finding]));
  let linkChanges = 0;
  let updated = original.replace(/<a\b([^>]*?\bhref\s*=\s*)(["'])([^"']+)\2([^>]*)>([\s\S]*?)<\/a>/gi, (tag, before, quote, href, after, content) => {
    if (href.startsWith('/evidence-library/preserved-sharepoint/link-integrity.html#') && /\bdata-source-reference\s*=\s*["']unavailable["']/i.test(`${before}${after}`)) return tag;
    const pathname = routePath(href, sourceRelative);
    const finding = targetMap.get(pathname);
    const localTarget = /^(?:mailto:|tel:|javascript:|data:|https?:\/\/|\/\/)/i.test(href) ? null : repositoryTarget(href, sourceRelative);
    const fragment = href.startsWith('#') ? href.slice(1) : '';
    const fragmentExists = !fragment || new RegExp(`\\b(?:id|name)\\s*=\\s*["']${fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(original);
    const placeholder = href === '#' || /\bdata-offline-link\s*=\s*["']site-relative["']/i.test(`${before}${after}`) || (localTarget && !fs.existsSync(localTarget)) || !fragmentExists;
    if (!finding && !placeholder) return tag;
    const destination = finding ? `/evidence-library/preserved-sharepoint/link-integrity.html#${targetId(pathname)}` : genericUnavailableDestination;
    const cleanBefore = before.replace(/\s+(?:target|rel)\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, '');
    const cleanAfter = after.replace(/\s+(?:target|rel)\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, '');
    const prefix = /Unavailable source reference/i.test(content) ? '' : 'Unavailable source reference — ';
    linkChanges += 1;
    return `<a${cleanBefore}${quote}${destination}${quote}${cleanAfter} data-source-reference="unavailable">${prefix}${content}</a>`;
  });

  updated = updated.replace(/<a\b((?:(?!\bhref\s*=)[^>])*)>([\s\S]*?)<\/a>/gi, (_tag, attrs, content) => {
    linkChanges += 1;
    return `<span class="unavailable-link-label" aria-disabled="true">Unavailable navigation label — ${content}</span>`;
  });
  updated = updated.replace(/Unavailable source reference —[ \t]+(\r?\n)/g, 'Unavailable source reference —$1');

  const assets = replaceMissingAssets(updated, sourceRelative);
  updated = assets.html;
  let styleInjected = 0;
  if (!updated.includes(sharedStyle)) {
    updated = updated.replace(/<\/head>/i, `  <link rel="stylesheet" href="${sharedStyle}">\n</head>`);
    styleInjected = updated === original ? 0 : 1;
  }

  const changed = updated !== original;
  if (checkMode && changed) throw new Error(`Preserved navigation normalization drift: ${sourceRelative}`);
  if (!checkMode && changed) fs.writeFileSync(absolute, updated, 'utf8');
  return {changed, linkChanges, assetChanges: assets.assetChanges, styleInjected};
}

let filesChanged = 0;
let linksNormalized = 0;
let assetsNormalized = 0;
let stylesInjected = 0;

function listHtmlFiles(directory, output = []) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) listHtmlFiles(absolute, output);
    else if (entry.isFile() && /\.html?$/i.test(entry.name)) output.push(absolute);
  }
  return output;
}

const preservedRoot = path.join(root, 'evidence-library/preserved-sharepoint/source');
const publicDerivatives = listHtmlFiles(preservedRoot).map((absolute) => path.relative(root, absolute).replaceAll('\\', '/')).sort();
for (const sourceRelative of publicDerivatives) {
  const findings = linkStatus.sources[sourceRelative] || [];
  const result = normalizeFile(sourceRelative, findings);
  if (result.changed) filesChanged += 1;
  linksNormalized += result.linkChanges;
  assetsNormalized += result.assetChanges;
  stylesInjected += result.styleInjected;
}

console.log(`Preserved SharePoint navigation ${checkMode ? 'check' : 'normalization'} passed: ${publicDerivatives.length} public derivatives inspected, ${filesChanged} files changed, ${linksNormalized} unavailable links routed to integrity records, ${assetsNormalized} missing dependencies normalized, and ${stylesInjected} shared styles injected.`);

module.exports = {targetId};
