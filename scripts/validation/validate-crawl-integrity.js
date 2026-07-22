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
  '/microsoft-365/',
  '/home-lab/',
  '/evidence/',
  '/projects.html',
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
    for (const archiveRoot of archivalRoots) {
      if (url.pathname.startsWith(archiveRoot)) {
        fail(`raw archival route must not appear in sitemap.xml: ${url.pathname}`);
      }
    }
  }

  for (const requiredRoute of requiredRoutes) {
    if (!seen.has(requiredRoute)) fail(`required recruiter-facing route is missing from sitemap.xml: ${requiredRoute}`);
  }

  return routes;
}

const robots = validateRobots();
const routes = validateSitemap();
console.log(
  `Crawl integrity validated: ${routes.length} canonical sitemap routes; ` +
  `${robots.disallowed.length} disallow directive(s); ${crawlerExcludedRoots.length} crawler-only roots protected.`,
);
