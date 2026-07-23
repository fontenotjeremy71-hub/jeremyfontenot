#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function csv(value) {
  return '"' + String(value ?? '').replaceAll('"', '""') + '"';
}

function category(pathname) {
  if (pathname.startsWith('/cdn-cgi/')) return 'cloudflare-utility';
  if (pathname.startsWith('/evidence-library/preserved-sharepoint/source/')) return 'preserved-sharepoint-derivative';
  if (pathname.startsWith('/evidence-library/preserved-sharepoint/wrappers/')) return 'generated-sharepoint-wrapper';
  if (pathname.startsWith('/evidence-library/')) return 'evidence';
  if (/\.(?:css|js|json|xml|png|jpe?g|svg|webp|pdf|csv|txt|md)$/i.test(pathname)) return 'static-asset-or-document';
  return 'recruiter-facing';
}

async function inspect(url) {
  let response;
  let error = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      response = await fetch(url, {redirect: 'follow', headers: {'user-agent': 'JeremyFontenot-EvidenceIntegrity/1.0'}});
      break;
    } catch (caught) {
      error = caught;
    }
  }
  if (!response) return {url, error: String(error), findings: ['request-unavailable']};
  const headers = Object.fromEntries([...response.headers.entries()].map(([key, value]) => [key.toLowerCase(), value]));
  if (response.body) await response.body.cancel();
  const findings = [];
  if (!headers['strict-transport-security']) findings.push('missing-hsts');
  if (!headers['x-content-type-options']) findings.push('missing-x-content-type-options');
  if (!headers['referrer-policy']) findings.push('missing-referrer-policy');
  if (!headers['content-security-policy']) findings.push('missing-content-security-policy');
  if (!headers['permissions-policy']) findings.push('missing-permissions-policy');
  if (!headers['cross-origin-opener-policy']) findings.push('coop-not-enabled');
  if (!headers['cross-origin-embedder-policy']) findings.push('coep-not-enabled');
  if (!headers['cross-origin-resource-policy']) findings.push('corp-not-enabled');
  if (headers['access-control-allow-origin'] === '*') findings.push(headers['access-control-allow-credentials'] ? 'wildcard-cors-with-credentials' : 'wildcard-cors-public-static');
  if (headers.server) findings.push('server-header-discloses-edge');
  if (headers['x-xss-protection']) findings.push('deprecated-x-xss-protection-observed');
  return {
    url,
    finalUrl: response.url,
    status: response.status,
    routeCategory: category(new URL(url).pathname),
    contentType: headers['content-type'] || '',
    headers: {
      strictTransportSecurity: headers['strict-transport-security'] || '',
      xContentTypeOptions: headers['x-content-type-options'] || '',
      referrerPolicy: headers['referrer-policy'] || '',
      contentSecurityPolicy: headers['content-security-policy'] || '',
      permissionsPolicy: headers['permissions-policy'] || '',
      xRobotsTag: headers['x-robots-tag'] || '',
      accessControlAllowOrigin: headers['access-control-allow-origin'] || '',
      accessControlAllowCredentials: headers['access-control-allow-credentials'] || '',
      cacheControl: headers['cache-control'] || '',
      contentEncoding: headers['content-encoding'] || '',
      cfCacheStatus: headers['cf-cache-status'] || '',
      server: headers.server || '',
      coop: headers['cross-origin-opener-policy'] || '',
      coep: headers['cross-origin-embedder-policy'] || '',
      corp: headers['cross-origin-resource-policy'] || '',
      xXssProtection: headers['x-xss-protection'] || ''
    },
    findings
  };
}

async function main() {
  const reportPath = argument('--report');
  if (!reportPath) throw new Error('Usage: verify-live-headers.js --report <siteone.json> [--output <report.json>]');
  const report = JSON.parse(fs.readFileSync(path.resolve(reportPath), 'utf8'));
  const urls = [...new Set(report.results
    .filter((result) => Number(result.status) >= 200 && Number(result.status) < 400)
    .map((result) => result.url)
    .filter((url) => new URL(url).hostname === 'jeremyfontenot.online' && !new URL(url).pathname.startsWith('/cdn-cgi/')))].sort();
  const records = new Array(urls.length);
  let cursor = 0;
  async function worker() {
    while (cursor < urls.length) {
      const index = cursor;
      cursor += 1;
      records[index] = await inspect(urls[index]);
    }
  }
  await Promise.all(Array.from({length: Math.min(10, urls.length)}, worker));
  const findingCounts = new Map();
  for (const record of records) for (const finding of record.findings) findingCounts.set(finding, (findingCounts.get(finding) || 0) + 1);
  const classifications = {
    'missing-hsts': 'genuine-edge-security-defect',
    'missing-x-content-type-options': 'genuine-edge-security-defect',
    'missing-referrer-policy': 'genuine-edge-security-defect',
    'missing-content-security-policy': 'genuine-edge-security-defect',
    'missing-permissions-policy': 'genuine-edge-security-defect',
    'wildcard-cors-with-credentials': 'genuine-edge-security-defect',
    'coop-not-enabled': 'accepted-pending-cross-origin-compatibility-testing',
    'coep-not-enabled': 'accepted-pending-cross-origin-compatibility-testing',
    'corp-not-enabled': 'accepted-pending-cross-origin-compatibility-testing',
    'wildcard-cors-public-static': 'static-site-informational-no-credentials',
    'server-header-discloses-edge': 'cloudflare-edge-informational',
    'deprecated-x-xss-protection-observed': 'deprecated-header-observation-do-not-add',
    'request-unavailable': 'verification-unavailable'
  };
  const findings = [...findingCounts].map(([rule, count]) => ({rule, count, classification: classifications[rule]})).sort((a, b) => b.count - a.count || a.rule.localeCompare(b.rule));
  const output = path.resolve(root, argument('--output', 'artifacts/audits/siteone-evidence-integrity/live-header-verification.json'));
  fs.mkdirSync(path.dirname(output), {recursive: true});
  fs.writeFileSync(output, JSON.stringify({schemaVersion: 1, sourceReport: path.basename(reportPath), routesInspected: records.length, findings, records}, null, 2) + '\n');
  const csvPath = output.replace(/\.json$/i, '.csv');
  fs.writeFileSync(csvPath, ['url,status,route_category,findings', ...records.map((record) => [record.url, record.status, record.routeCategory, record.findings.join('|')].map(csv).join(','))].join('\n') + '\n');
  console.log(JSON.stringify({routesInspected: records.length, findings, output, csvPath}, null, 2));
}

main().catch((error) => { console.error(error.stack || error); process.exit(1); });
