#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');
let siteOrigin = 'https://jeremyfontenot.online';
const cloudflarePrefix = '/cdn-cgi/';
const preservedPrefix = '/evidence-library/preserved-sharepoint/source/';
const preservedDocsPrefix = '/evidence-library/preserved-sharepoint/docs/';

function toPosix(value) {
  return String(value).replaceAll('\\', '/').replace(/^\.\/+/, '');
}

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z'], {cwd: root})
    .toString('utf8').split('\0').filter(Boolean).map(toPosix).sort();
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join('; ') : String(value ?? '');
  return '"' + text.replaceAll('"', '""') + '"';
}

function pathPrefix(urlPath) {
  for (const prefix of [cloudflarePrefix, preservedDocsPrefix, preservedPrefix, '/evidence-library/preserved-sharepoint/evidence/', '/docs/']) {
    if (urlPath.startsWith(prefix)) return prefix;
  }
  const parts = urlPath.split('/').filter(Boolean);
  return '/' + parts.slice(0, Math.min(2, parts.length)).join('/') + (parts.length > 2 ? '/' : '');
}

function routeCategory(urlPath) {
  if (urlPath.startsWith(cloudflarePrefix)) return 'cloudflare-utility';
  if (urlPath.startsWith(preservedDocsPrefix)) return 'preserved-sharepoint-missing-docs';
  if (urlPath.startsWith(preservedPrefix)) return 'preserved-sharepoint-published-derivative';
  if (urlPath.startsWith('/evidence-library/preserved-sharepoint/')) return 'preserved-sharepoint-collection';
  if (urlPath.startsWith('/evidence-library/')) return 'evidence-library';
  return 'first-party-site';
}

function sourceCollection(sourceUrl) {
  if (!sourceUrl) return 'unknown';
  const pathname = new URL(sourceUrl).pathname;
  if (pathname.startsWith(preservedPrefix)) return 'preserved-sharepoint-export';
  if (pathname.startsWith('/evidence-library/')) return 'evidence-library';
  return 'recruiter-facing-site';
}

function decodeHtmlAttribute(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&#38;', '&').replaceAll('&quot;', '"').trim();
}

function reconstructSources(missingUrls, inventoryRows) {
  const sources = new Map([...missingUrls].map((url) => [url, new Set()]));
  const attributePattern = /\b(?:href|src|action|data-src)\s*=\s*(["'])(.*?)\1/gis;
  for (const row of inventoryRows) {
    const file = toPosix(row.site_rel);
    const absolute = path.join(root, file);
    if (!fs.existsSync(absolute)) continue;
    const sourceUrl = new URL('/' + file, siteOrigin).href;
    const html = fs.readFileSync(absolute, 'utf8');
    for (const match of html.matchAll(attributePattern)) {
      const raw = decodeHtmlAttribute(match[2]);
      if (!raw || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(raw)) continue;
      try {
        const resolved = new URL(raw, sourceUrl);
        resolved.hash = '';
        const target = resolved.href;
        if (sources.has(target)) sources.get(target).add(sourceUrl);
      } catch {}
    }
  }
  return sources;
}

function groupCounts(records, selector) {
  const counts = new Map();
  for (const record of records) {
    const values = [].concat(selector(record) || []).filter(Boolean);
    for (const value of new Set(values)) counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts].map(([value, count]) => ({value, count})).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function tableRows(report, name) {
  return report.tables?.[name]?.rows || [];
}

function classify(report) {
  const missingResults = report.results.filter((result) => Number(result.status) === 404);
  const missingUrls = new Set(missingResults.map((result) => new URL(result.url).href));
  const inventoryPath = path.join(root, 'evidence-library/preserved-sharepoint/sharepoint-export-inventory.csv');
  const inventoryText = fs.readFileSync(inventoryPath, 'utf8');
  const lines = inventoryText.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  const headers = lines.shift().match(/(?:"([^"]*(?:""[^"]*)*)"|([^,]*))(?:,|$)/g).map((part) => part.replace(/,$/, '').replace(/^"|"$/g, '').replaceAll('""', '"'));
  const inventoryRows = lines.map((line) => {
    const values = [...line.matchAll(/(?:^|,)(?:"((?:[^"]|"")*)"|([^,]*))/g)].map((match) => (match[1] ?? match[2] ?? '').replaceAll('""', '"'));
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
  });
  const reconstructed = reconstructSources(missingUrls, inventoryRows);
  for (const row of tableRows(report, '404')) {
    try {
      const target = new URL(row.url, siteOrigin).href;
      const source = new URL(row.sourceUqId, siteOrigin).href;
      if (reconstructed.has(target)) reconstructed.get(target).add(source);
    } catch {}
  }

  const files = trackedFiles();
  const lowerPaths = new Map();
  const basenames = new Map();
  for (const file of files) {
    const lower = file.toLowerCase();
    if (!lowerPaths.has(lower)) lowerPaths.set(lower, []);
    lowerPaths.get(lower).push(file);
    const base = path.posix.basename(lower);
    if (!basenames.has(base)) basenames.set(base, []);
    basenames.get(base).push(file);
  }

  const records = [...missingUrls].sort().map((targetUrl) => {
    const parsed = new URL(targetUrl);
    const targetPath = decodeURIComponent(parsed.pathname);
    const repositoryPath = targetPath.replace(/^\//, '');
    const exactExists = files.includes(repositoryPath);
    const caseCandidates = lowerPaths.get(repositoryPath.toLowerCase()) || [];
    const caseMismatch = !exactExists && caseCandidates.length > 0;
    const basenameCandidates = (basenames.get(path.posix.basename(repositoryPath).toLowerCase()) || []).filter((candidate) => candidate !== repositoryPath);
    const extensionCandidates = path.posix.extname(repositoryPath) ? [] : files.filter((candidate) => candidate.toLowerCase().startsWith(repositoryPath.toLowerCase() + '.'));
    const candidateSet = [...new Set([...caseCandidates, ...extensionCandidates, ...basenameCandidates])].sort();
    const sourcePages = [...(reconstructed.get(targetUrl) || [])].sort();
    const cloudflareGenerated = targetPath.startsWith(cloudflarePrefix);
    const preservedSourceReference = sourcePages.length > 0 && sourcePages.every((source) => new URL(source).pathname.startsWith(preservedPrefix));
    let failureType;
    let finalClassification;
    let proposedRemediation;
    let exceptionRationale = '';
    if (cloudflareGenerated) {
      failureType = 'edge-generated-utility-path';
      finalClassification = 'cloudflare-edge-generated-exclusion';
      proposedRemediation = 'Exclude from content-defect totals; document the Cloudflare email-obfuscation follow-up.';
      exceptionRationale = 'The route is generated by Cloudflare and is not repository content.';
    } else if (exactExists) {
      failureType = 'published-route-unavailable';
      finalClassification = 'genuine-first-party-deployment-defect';
      proposedRemediation = 'Verify publication allowlisting and deployment output for the existing repository file.';
    } else if (caseMismatch) {
      failureType = 'path-casing';
      finalClassification = 'recoverable-case-mismatch';
      proposedRemediation = 'Repair the generated reference or add a reviewed compatibility mapping using exact repository casing.';
    } else if (extensionCandidates.length === 1) {
      failureType = 'missing-extension';
      finalClassification = 'recoverable-missing-extension';
      proposedRemediation = 'Repair the generated reference or add a reviewed compatibility mapping to the exact artifact.';
    } else if (candidateSet.length === 1) {
      failureType = 'moved-or-relative-path';
      finalClassification = 'recoverable-existing-artifact';
      proposedRemediation = 'Review the single repository candidate and create a truthful compatibility route when identity is proven.';
    } else if (preservedSourceReference || targetPath.startsWith(preservedPrefix) || targetPath.startsWith(preservedDocsPrefix)) {
      failureType = 'missing-from-preserved-export';
      finalClassification = 'documented-archival-limitation';
      proposedRemediation = 'Retain the source reference unchanged and expose the unavailable-target classification through its generated wrapper and audit record.';
      exceptionRationale = candidateSet.length > 1
        ? 'The preserved export references an unavailable path and basename matching is ambiguous; source bytes must remain unchanged.'
        : 'The preserved export references content that is not present in the reviewed repository collection; source bytes must remain unchanged.';
    } else {
      failureType = 'unclassified-first-party-missing';
      finalClassification = 'genuine-first-party-defect';
      proposedRemediation = 'Investigate and repair before release.';
    }
    return {
      targetUrl,
      httpStatus: 404,
      sourcePages,
      sourceRouteCategories: [...new Set(sourcePages.map((source) => routeCategory(new URL(source).pathname)))].sort(),
      targetRouteCategory: routeCategory(targetPath),
      internal: parsed.origin === siteOrigin,
      publicationClass: targetPath.startsWith(preservedPrefix) ? 'source-of-record-published-derivative' : (cloudflareGenerated ? 'edge-generated' : 'compatibility-or-archival-target'),
      targetHostname: parsed.hostname,
      targetPath,
      targetPathPrefix: pathPrefix(targetPath),
      sourceEvidenceCollections: [...new Set(sourcePages.map(sourceCollection))].sort(),
      repositoryExactPathExists: exactExists,
      repositoryCandidates: candidateSet,
      caseMismatch,
      incorrectRelativePath: failureType === 'moved-or-relative-path',
      missingExtension: failureType === 'missing-extension',
      movedToKnownEvidencePath: candidateSet.length === 1 && !caseMismatch && extensionCandidates.length === 0,
      retiredSharePointTenantUrl: false,
      historicalMicrosoft365TenantUrl: false,
      cloudflareGenerated,
      intentionallyUnavailableExternalResource: false,
      sourceMayBeModified: !preservedSourceReference,
      failureType,
      proposedRemediation,
      remediationType: finalClassification.startsWith('recoverable-') ? 'compatibility-or-link-repair' : (finalClassification === 'documented-archival-limitation' ? 'documented-exception' : (cloudflareGenerated ? 'edge-exclusion' : 'repository-fix')),
      finalClassification,
      exceptionRationale
    };
  });

  const sourceReferenceCount = records.reduce((total, record) => total + Math.max(record.sourcePages.length, 1), 0);
  const summary = {
    reportVersion: report.crawler.version,
    reportExecutedAt: report.crawler.executedAt,
    overallScore: report.qualityScores.overall?.score ?? report.qualityScores.overallScore ?? report.qualityScores.score ?? null,
    visitedUrls: report.stats.totalUrls,
    totalUniqueMissingTargets: records.length,
    totalSourceReferences: sourceReferenceCount,
    sourcesReconstructedBeyondCappedReportTable: records.filter((record) => record.sourcePages.length && !tableRows(report, '404').some((row) => new URL(row.url, siteOrigin).href === record.targetUrl)).length,
    firstPartyInternalMissingTargets: records.filter((record) => record.internal && !record.cloudflareGenerated).length,
    cloudflareGeneratedTargets: records.filter((record) => record.cloudflareGenerated).length,
    retiredTenantOnlyTargets: records.filter((record) => record.retiredSharePointTenantUrl).length,
    historicalExternalTargets: records.filter((record) => !record.internal).length,
    recoverableFromExistingRepositoryFile: records.filter((record) => record.finalClassification.startsWith('recoverable-')).length,
    pathsRequiringCompatibilityPages: records.filter((record) => record.remediationType === 'compatibility-or-link-repair').length,
    genuineDefects: records.filter((record) => record.finalClassification.includes('genuine-first-party')).length,
    documentedArchivalLimitations: records.filter((record) => record.finalClassification === 'documented-archival-limitation').length,
    unclassifiedInternal404s: records.filter((record) => record.finalClassification === 'genuine-first-party-defect').length,
    reportTableRows: tableRows(report, '404').length,
    accessibilityRows: tableRows(report, 'accessibility'),
    securityRows: tableRows(report, 'security'),
    redirectRows: tableRows(report, 'redirects'),
    duplicateDescriptionRows: tableRows(report, 'non-unique-descriptions')
  };
  const groups = {
    targetHostname: groupCounts(records, (record) => record.targetHostname),
    targetPathPrefix: groupCounts(records, (record) => record.targetPathPrefix),
    sourcePage: groupCounts(records, (record) => record.sourcePages),
    sourceEvidenceCollection: groupCounts(records, (record) => record.sourceEvidenceCollections),
    failureType: groupCounts(records, (record) => record.failureType),
    remediationType: groupCounts(records, (record) => record.remediationType)
  };
  return {schemaVersion: 1, sourceReport: report.crawler, summary, groups, records};
}

function writeReports(classification, outputDirectory, stem) {
  fs.mkdirSync(outputDirectory, {recursive: true});
  const jsonPath = path.join(outputDirectory, stem + '.classification.json');
  const csvPath = path.join(outputDirectory, stem + '.classification.csv');
  fs.writeFileSync(jsonPath, JSON.stringify(classification, null, 2) + '\n');
  const fields = [
    'targetUrl','httpStatus','sourcePages','sourceRouteCategories','targetRouteCategory','internal','publicationClass','targetHostname','targetPath','targetPathPrefix',
    'sourceEvidenceCollections','repositoryExactPathExists','repositoryCandidates','caseMismatch','incorrectRelativePath','missingExtension','movedToKnownEvidencePath',
    'retiredSharePointTenantUrl','historicalMicrosoft365TenantUrl','cloudflareGenerated','intentionallyUnavailableExternalResource','sourceMayBeModified',
    'failureType','proposedRemediation','remediationType','finalClassification','exceptionRationale'
  ];
  const csv = [fields.map(csvCell).join(','), ...classification.records.map((record) => fields.map((field) => csvCell(record[field])).join(','))].join('\n') + '\n';
  fs.writeFileSync(csvPath, csv);
  const statusOutput = argument('--wrapper-status-output');
  let wrapperStatusPath = null;
  if (statusOutput) {
    wrapperStatusPath = path.resolve(root, statusOutput);
    const sources = {};
    for (const record of classification.records) {
      for (const sourceUrl of record.sourcePages) {
        const sourcePath = new URL(sourceUrl).pathname.replace(/^\//, '');
        if (!sourcePath.startsWith(preservedPrefix.replace(/^\//, ''))) continue;
        if (!sources[sourcePath]) sources[sourcePath] = [];
        sources[sourcePath].push({
          targetPath: record.targetPath,
          httpStatus: record.httpStatus,
          classification: record.finalClassification,
          remediationType: record.remediationType,
          candidatePaths: record.repositoryCandidates,
          rationale: record.exceptionRationale || record.proposedRemediation
        });
      }
    }
    for (const entries of Object.values(sources)) entries.sort((a, b) => a.targetPath.localeCompare(b.targetPath));
    const status = {
      schemaVersion: 1,
      sourceReport: path.basename(classification.sourceReport.outputJsonFile || stem + '.json'),
      reportExecutedAt: classification.summary.reportExecutedAt,
      totalUniqueMissingTargets: classification.summary.totalUniqueMissingTargets,
      totalSourceReferences: classification.summary.totalSourceReferences,
      sources: Object.fromEntries(Object.entries(sources).sort((a, b) => a[0].localeCompare(b[0])))
    };
    fs.mkdirSync(path.dirname(wrapperStatusPath), {recursive: true});
    fs.writeFileSync(wrapperStatusPath, JSON.stringify(status, null, 2) + '\n');
  }
  return {jsonPath, csvPath, wrapperStatusPath};
}

function main() {
  const reportPath = argument('--report');
  if (!reportPath) throw new Error('Usage: classify-siteone-report.js --report <report.json> [--output-dir <dir>] [--wrapper-status-output <file>] [--fail-unclassified-internal]');
  const absoluteReport = path.resolve(reportPath);
  const report = JSON.parse(fs.readFileSync(absoluteReport, 'utf8'));
  siteOrigin = new URL(argument('--site-origin', report.options?.url || siteOrigin)).origin;
  const outputDirectory = path.resolve(root, argument('--output-dir', 'artifacts/audits/siteone-evidence-integrity'));
  const stem = path.basename(reportPath, path.extname(reportPath));
  const classification = classify(report);
  const written = writeReports(classification, outputDirectory, stem);
  console.log(JSON.stringify({summary: classification.summary, outputs: written}, null, 2));
  if (process.argv.includes('--fail-unclassified-internal') && classification.summary.unclassifiedInternal404s > 0) process.exitCode = 1;
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.stack || error); process.exit(1); }
}

module.exports = {classify, pathPrefix, routeCategory, reconstructSources};
