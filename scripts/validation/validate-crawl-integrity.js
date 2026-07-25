#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const siteOrigin = 'https://jeremyfontenot.online';
const robotsPath = path.join(root, 'robots.txt');
const sitemapPath = path.join(root, 'sitemap.xml');

const archivalRoots = [
  '/evidence-library/preserved-sharepoint/source/',
  '/evidence-library/preserved-sharepoint/docs/',
];

const crawlerExcludedRoots = [
  '/cdn-cgi/',
  ...archivalRoots,
];

// Raw machine-readable and source artifacts remain publicly accessible through
// contextual proof pages, but they are not standalone search landing pages.
const nonIndexableSitemapExtensions = new Set([
  '.csv',
  '.json',
  '.md',
  '.txt',
  '.xml',
  '.yaml',
  '.yml',
  '.log',
  '.ps1',
  '.sh',
]);

// These public compatibility URLs currently resolve through an external redirect
// and therefore must not be advertised as canonical sitemap destinations.
const redirectOnlyRoutes = new Set([
  '/index.html',
  '/powershell-automation.html',
]);

const requiredRoutes = new Set([
  '/',
  '/systems-administration.html',
  '/systems-skills/',
  '/systems-skills/evidence-map.html',
  '/microsoft-365/',
  '/microsoft-365/evidence-catalog.html',
  '/home-lab/',
  '/home-lab/evidence-catalog.html',
  '/evidence/',
  '/evidence/claim-map.html',
  '/projects.html',
  '/proof.html',
  '/resume.html',
  '/contact.html',
]);

function fail(message) {
  throw new Error(`Crawl integrity validation failed: ${message}`);
}

function readRequiredFile(filePath) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    fail(`required file is missing: ${path.relative(root, filePath)}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function parseRobotsDirectives(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+#.*$/, '').trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(':');
      if (separator < 0) return {name: line.toLowerCase(), value: ''};
      return {
        name: line.slice(0, separator).trim().toLowerCase(),
        value: line.slice(separator + 1).trim(),
      };
    });
}

function validateRobots() {
  const directives = parseRobotsDirectives(readRequiredFile(robotsPath));
  const userAgents = directives.filter((entry) => entry.name === 'user-agent').map((entry) => entry.value);
  if (!userAgents.includes('*')) fail('robots.txt must define a User-agent: * policy.');

  const disallowed = new Set(directives.filter((entry) => entry.name === 'disallow').map((entry) => entry.value));
  for (const excludedRoot of crawlerExcludedRoots) {
    if (!disallowed.has(excludedRoot)) fail(`robots.txt must disallow crawler-only root ${excludedRoot}`);
  }

  const sitemapValues = directives.filter((entry) => entry.name === 'sitemap').map((entry) => entry.value);
  const expectedSitemap = `${siteOrigin}/sitemap.xml`;
  if (!sitemapValues.includes(expectedSitemap)) fail(`robots.txt must declare ${expectedSitemap}`);

  return {disallowed: [...disallowed], sitemapValues};
}

function parseSitemapLocations(content) {
  const locations = [...content.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1]);
  if (locations.length === 0) fail('sitemap.xml does not contain any <loc> entries.');
  return locations;
}

function validateSitemap() {
  const locations = parseSitemapLocations(readRequiredFile(sitemapPath));
  const routes = [];
  const seen = new Set();
  let contextualEvidenceRouteCount = 0;

  for (const location of locations) {
    let url;
    try {
      url = new URL(location);
    } catch {
      fail(`sitemap contains an invalid URL: ${location}`);
    }

    if (url.origin !== siteOrigin) fail(`sitemap contains a noncanonical origin: ${location}`);
    if (url.search || url.hash) fail(`sitemap URL must not contain a query or fragment: ${location}`);
    if (seen.has(url.pathname)) fail(`sitemap contains a duplicate route: ${url.pathname}`);
    seen.add(url.pathname);
    routes.push(url.pathname);

    if (redirectOnlyRoutes.has(url.pathname)) {
      fail(`redirect-only route must not appear in sitemap.xml: ${url.pathname}`);
    }

    const extension = path.posix.extname(url.pathname).toLowerCase();
    if (nonIndexableSitemapExtensions.has(extension)) {
      fail(`raw evidence artifact must not appear in sitemap.xml: ${url.pathname}`);
    }

    for (const archiveRoot of archivalRoots) {
      if (url.pathname.startsWith(archiveRoot)) {
        fail(`raw archival route must not appear in sitemap.xml: ${url.pathname}`);
      }
    }

    if (url.pathname.startsWith('/evidence-library/') && (url.pathname.endsWith('/') || extension === '.html')) {
      contextualEvidenceRouteCount += 1;
    }
  }

  for (const requiredRoute of requiredRoutes) {
    if (!seen.has(requiredRoute)) fail(`required recruiter-facing route is missing from sitemap.xml: ${requiredRoute}`);
  }

  if (contextualEvidenceRouteCount === 0) {
    fail('sitemap must retain at least one contextual HTML evidence route.');
  }

  return {routes, contextualEvidenceRouteCount};
}

const robots = validateRobots();
const sitemap = validateSitemap();
console.log(
  `Crawl integrity validated: ${sitemap.routes.length} canonical sitemap routes; ` +
  `${sitemap.contextualEvidenceRouteCount} contextual evidence route(s); ` +
  `${robots.disallowed.length} disallow directive(s); ${crawlerExcludedRoots.length} crawler-only roots protected.`,
);
