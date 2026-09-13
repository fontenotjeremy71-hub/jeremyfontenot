#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {publicHtmlFiles, root, routeSourceFiles} = require('../lib/publication-inventory.js');

const errors = [];
let checked = 0;
let semanticChecks = 0;

function textOnly(value) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
}

function normalizePath(source, href) {
  if (/^(?:mailto:|tel:)/i.test(href)) return href.toLowerCase();
  if (/^https?:\/\//i.test(href)) {
    const url = new URL(href);
    return url.origin.toLowerCase() + url.pathname.toLowerCase() + url.hash.toLowerCase();
  }
  if (href.startsWith('/')) return href.toLowerCase();
  const base = '/' + source.replace(/[^/]+$/, '');
  const url = new URL(href, `https://jeremyfontenot.online${base}`);
  return url.pathname.toLowerCase() + url.hash.toLowerCase();
}

function isEvidenceTarget(target) {
  return /(?:#evidence(?:$|[-_])|\/(?:active-directory-lab|infrastructure|network-segmentation|powershell-automation)\.html$|\/evidence(?:\/|[-.]|$)|evidence-library|evidence-catalog|validation|evidence-manifest|claim-map|proof\.html|\.(?:txt|md|json|csv|png|jpe?g|webp)(?:[#?].*)?$)/i.test(target);
}

function inspect(source, href, rawLabel) {
  const label = textOnly(rawLabel);
  if (!label || href.includes('${') || /^unavailable source reference\b/i.test(label)) return;
  checked += 1;
  let target;
  try { target = normalizePath(source, href); } catch { return; }
  const sourcePath = '/' + source.toLowerCase();
  const evidencePromise = /^(?:(?:view|open|review|inspect|browse|supporting|validation)\s+)?evidence(?:\s+(?:catalog|library|record|records|index))?$|^(?:view|open)\s+(?:validation|supporting)\s+evidence$/i.test(label);
  const proofPromise = /^(?:view|open|review|inspect)?\s*(?:proof|proof summary|proof index|supporting proof)$/i.test(label);
  const casePromise = /^(?:view|read|open|review)\s+(?:the\s+)?(?:case study|project|project details)$/i.test(label) || /^case study$/i.test(label);
  const resumePromise = /^(?:view|open|download|review)?\s*(?:resume|résumé)$/i.test(label);
  const contactPromise = /^(?:contact|contact me|discuss role fit|get in touch)$/i.test(label);
  const repositoryPromise = /^(?:repository|view source|inspect files|view repository|source repository)$/i.test(label);

  if (evidencePromise) {
    semanticChecks += 1;
    if (!isEvidenceTarget(target)) errors.push(`${source}: "${label}" promises evidence but points to ${href}`);
    if (/\/(?:windows-laps-gpo|entra-cloud-sync|on-prem-home-lab)\.html#evidence\b/i.test(target)) errors.push(`${source}: "${label}" points to a narrative-only project anchor ${href}`);
    const [sourceBase] = sourcePath.split('#');
    const [targetBase] = target.replace(/^https?:\/\/[^/]+/i, '').split('#');
    if (sourceBase === targetBase && (!target.includes('#') || target.endsWith('#evidence'))) errors.push(`${source}: "${label}" creates a circular evidence path ${href}`);
  }
  if (proofPromise) {
    semanticChecks += 1;
    if (!/proof|claim-map/i.test(target)) errors.push(`${source}: "${label}" promises recruiter-facing proof but points to ${href}`);
  }
  if (casePromise) {
    semanticChecks += 1;
    if (/evidence-library|\/evidence\/|evidence-catalog|claim-map|manifest/i.test(target)) errors.push(`${source}: "${label}" promises a case study but points to evidence content ${href}`);
  }
  if (resumePromise) {
    semanticChecks += 1;
    if (!/(?:\/resume\.html|\/assets\/resume\/[^?#]+\.(?:pdf|docx))(?:[#?].*)?$/i.test(target)) errors.push(`${source}: "${label}" promises the resume but points to ${href}`);
  }
  if (contactPromise) {
    semanticChecks += 1;
    if (!/^mailto:|#contact$|\/contact\.html(?:[#?].*)?$/i.test(target)) errors.push(`${source}: "${label}" promises contact but points to ${href}`);
  }
  if (repositoryPromise) {
    semanticChecks += 1;
    if (!/^https?:\/\/github\.com\//i.test(href)) errors.push(`${source}: "${label}" promises repository source but points to ${href}`);
  }
}

function main() {
for (const source of publicHtmlFiles()) {
  const html = fs.readFileSync(path.join(root, source), 'utf8');
  for (const match of html.matchAll(/<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi)) inspect(source, match[2], match[4]);
}

const routeFiles = routeSourceFiles();
for (const source of routeFiles) {
  const text = fs.readFileSync(path.join(root, source), 'utf8');
  for (const match of text.matchAll(/<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi)) inspect(source, match[2], match[4]);
}

const routeSources = routeFiles.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
const requiredMappings = [
  ['Windows LAPS evidence', '/projects/windows-laps-gpo/evidence/'],
  ['Entra Cloud Sync evidence', '/projects/entra-cloud-sync/evidence/'],
  ['Home Lab evidence', '/evidence-library/projects/on-prem-home-lab/current-validated-state/README.html'],
  ['Network evidence', '/evidence-library/network/network-infrastructure-validation-report-2026.html']
];
for (const [name, destination] of requiredMappings) {
  if (!routeSources.includes(destination)) errors.push(`Known mapping missing: ${name} must include ${destination}`);
}
for (const bad of ['/windows-laps-gpo.html#evidence', '/entra-cloud-sync.html#evidence', '/on-prem-home-lab.html#evidence']) {
  if (routeSources.includes(`href="${bad}"`) || routeSources.includes(`href='${bad}'`)) errors.push(`Known evidence CTA regressed to narrative-only anchor ${bad}`);
}
if (routeSources.includes("['Project evidence','Case evidence and validation','/app01-storage-expansion.html#evidence']")) errors.push('APP01 evidence CTA is self-referential');

if (errors.length) {
  const unique = [...new Set(errors)].sort();
  console.error(`CTA semantics validation failed with ${unique.length} issue(s):`);
  for (const error of unique) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`CTA semantics validation passed: ${checked} visible/literal links inspected across every published HTML page and route source; ${semanticChecks} label-to-destination contracts verified.`);
}

module.exports = {checkContract(source, href, label) {
  const start = errors.length;
  inspect(source, href, label);
  return errors.splice(start);
}};
if (require.main === module) main();
