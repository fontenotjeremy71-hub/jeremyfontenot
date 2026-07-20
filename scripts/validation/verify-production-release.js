"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const repository = process.env.GITHUB_REPOSITORY || "fontenotjeremy71-hub/jeremyfontenot";
const targetSha = process.env.TARGET_SHA;
const token = process.env.GITHUB_TOKEN || "";
const baseUrl = "https://jeremyfontenot.online";
const reportPath = process.env.REPORT_PATH || path.join("artifacts", "release", "final-live-verification.json");
const requiredWorkflowNames = ["Repository Validation", "Deploy static site"];
const requiredRoutes = [
  "/",
  "/systems-administration.html",
  "/systems-skills/",
  "/systems-skills/evidence-map.html",
  "/microsoft-365/",
  "/microsoft-365/evidence-catalog.html",
  "/home-lab/",
  "/home-lab/evidence-catalog.html",
  "/evidence/",
  "/evidence/claim-map.html",
  "/projects.html",
  "/proof.html",
  "/dashboard.html",
  "/resume.html",
  "/contact.html",
  "/assets/data/evidence-skill-map.json",
];
const forbiddenRoutes = [
  "/.git/",
  "/.github/",
  "/artifacts/",
  "/config/",
  "/content/",
  "/schemas/",
  "/scripts/",
  "/tests/",
];
const browserRoutes = [
  "/systems-skills/evidence-map.html",
  "/evidence/claim-map.html",
];
const viewports = [
  { width: 320, height: 800 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

if (!targetSha || !/^[0-9a-f]{40}$/i.test(targetSha)) {
  throw new Error("TARGET_SHA must be a full 40-character commit SHA.");
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithTimeout(url, options = {}, timeoutMilliseconds = 45_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMilliseconds);
  try {
    return await fetch(url, {
      redirect: "follow",
      ...options,
      signal: controller.signal,
      headers: {
        "user-agent": "jeremyfontenot-release-verifier",
        "cache-control": "no-cache",
        pragma: "no-cache",
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function githubApi(relativePath) {
  const response = await fetchWithTimeout(`https://api.github.com/repos/${repository}/${relativePath}`, {
    headers: {
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API request failed (${response.status}) for ${relativePath}: ${await response.text()}`);
  }
  return response.json();
}

async function waitForRequiredWorkflows() {
  const attempts = 60;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const data = await githubApi(`actions/runs?head_sha=${encodeURIComponent(targetSha)}&per_page=100`);
    const matchingRuns = (data.workflow_runs || [])
      .filter((run) => run.head_sha === targetSha && run.event === "push" && run.head_branch === "main")
      .sort((left, right) => new Date(right.created_at) - new Date(left.created_at));
    const selected = requiredWorkflowNames.map((name) => matchingRuns.find((run) => run.name === name)).filter(Boolean);

    if (selected.length === requiredWorkflowNames.length && selected.every((run) => run.status === "completed")) {
      const failed = selected.filter((run) => run.conclusion !== "success");
      if (failed.length) {
        throw new Error(`Required workflow failure: ${failed.map((run) => `${run.name}=${run.conclusion} (${run.id})`).join(", ")}`);
      }
      return selected.map((run) => ({
        id: run.id,
        name: run.name,
        event: run.event,
        status: run.status,
        conclusion: run.conclusion,
        headSha: run.head_sha,
        headBranch: run.head_branch,
        createdAt: run.created_at,
        updatedAt: run.updated_at,
        htmlUrl: run.html_url,
      }));
    }

    if (attempt === attempts) {
      const observed = matchingRuns.map((run) => `${run.name}:${run.status}:${run.conclusion || "pending"}:${run.id}`).join(", ") || "none";
      throw new Error(`Timed out waiting for required push workflows on ${targetSha}. Observed: ${observed}`);
    }
    await sleep(15_000);
  }
  throw new Error("Workflow polling exited unexpectedly.");
}

async function fetchText(url, expectedStatus = 200) {
  const separator = url.includes("?") ? "&" : "?";
  const response = await fetchWithTimeout(`${url}${separator}release_sha=${targetSha.slice(0, 12)}`);
  if (response.status !== expectedStatus) {
    throw new Error(`Expected HTTP ${expectedStatus} for ${url}; received ${response.status}.`);
  }
  return { response, text: await response.text() };
}

async function verifyHttpSurface() {
  const sitemapResult = await fetchText(`${baseUrl}/sitemap.xml`);
  const sitemapRoutes = [...sitemapResult.text.matchAll(/<loc>(https:\/\/jeremyfontenot\.online[^<]+)<\/loc>/g)].map((match) => match[1]);
  if (!sitemapRoutes.length) throw new Error("Production sitemap contains no canonical routes.");

  for (const route of requiredRoutes.filter((route) => !route.startsWith("/assets/"))) {
    const canonical = `${baseUrl}${route}`;
    if (!sitemapRoutes.includes(canonical)) throw new Error(`Production sitemap is missing required route: ${canonical}`);
  }

  const checkedRoutes = [];
  for (const url of [...new Set([...sitemapRoutes, ...requiredRoutes.map((route) => `${baseUrl}${route}`)])]) {
    const result = await fetchText(url);
    checkedRoutes.push({ url, status: result.response.status, bytes: Buffer.byteLength(result.text) });
  }

  const forbiddenChecks = [];
  for (const route of forbiddenRoutes) {
    const url = `${baseUrl}${route}`;
    const response = await fetchWithTimeout(`${url}?release_sha=${targetSha.slice(0, 12)}`);
    forbiddenChecks.push({ url, status: response.status });
    if (response.status !== 404) throw new Error(`Source-only production path must return 404: ${url} returned ${response.status}.`);
  }

  const css = await fetchText(`${baseUrl}/assets/css/evidence-skill-map.css`);
  for (const marker of ["color: #0f172a", "color: #075fbd", "color: #6040a0"]) {
    if (!css.text.includes(marker)) throw new Error(`Production Phase 5 CSS marker is missing: ${marker}`);
  }

  const skillMapResult = await fetchText(`${baseUrl}/assets/data/evidence-skill-map.json`);
  const skillMap = JSON.parse(skillMapResult.text);
  if (!Array.isArray(skillMap.relationships) || skillMap.relationships.length !== 1410) {
    throw new Error(`Production evidence-skill map must contain 1,410 relationships; found ${skillMap.relationships?.length}.`);
  }
  if (skillMap.totals?.skills !== 12 || skillMap.totals?.claims !== 23 || skillMap.totals?.unmappedEvidenceRecords !== 0) {
    throw new Error(`Production evidence-skill totals are invalid: ${JSON.stringify(skillMap.totals)}.`);
  }

  const m365Result = await fetchText(`${baseUrl}/assets/data/m365-evidence-catalog.json`);
  const homeLabResult = await fetchText(`${baseUrl}/assets/data/home-lab-evidence-catalog.json`);
  const m365 = JSON.parse(m365Result.text);
  const homeLab = JSON.parse(homeLabResult.text);
  if (m365.records?.length !== 971) throw new Error(`Production Microsoft 365 catalog must contain 971 records; found ${m365.records?.length}.`);
  if (homeLab.records?.length !== 439) throw new Error(`Production Home Lab catalog must contain 439 records; found ${homeLab.records?.length}.`);

  return {
    sitemapRouteCount: sitemapRoutes.length,
    checkedRoutes,
    forbiddenChecks,
    cssMarkers: ["#0f172a", "#075fbd", "#6040a0"],
    catalogTotals: {
      microsoft365: m365.records.length,
      homeLab: homeLab.records.length,
      relationships: skillMap.relationships.length,
      skills: skillMap.totals.skills,
      claims: skillMap.totals.claims,
      unmapped: skillMap.totals.unmappedEvidenceRecords,
    },
  };
}

async function verifyBrowserSurface() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
      page.on("pageerror", (error) => consoleErrors.push(error.message));

      for (const route of browserRoutes) {
        const response = await page.goto(`${baseUrl}${route}?release_sha=${targetSha.slice(0, 12)}`, {
          waitUntil: "networkidle",
          timeout: 120_000,
        });
        if (!response || response.status() !== 200) throw new Error(`Browser load failed for ${route} at ${viewport.width}px.`);

        const metrics = await page.evaluate(() => {
          const parseColor = (value) => {
            const match = String(value).match(/rgba?\(([^)]+)\)/i);
            if (!match) return null;
            const parts = match[1].split(/[,/\s]+/).filter(Boolean).map(Number);
            return { r: parts[0], g: parts[1], b: parts[2], a: Number.isFinite(parts[3]) ? parts[3] : 1 };
          };
          const effectiveBackground = (element) => {
            let current = element;
            while (current) {
              const color = parseColor(getComputedStyle(current).backgroundColor);
              if (color && color.a > 0.99) return color;
              current = current.parentElement;
            }
            return { r: 255, g: 255, b: 255, a: 1 };
          };
          const channel = (value) => {
            const normalized = value / 255;
            return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
          };
          const luminance = (color) => 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
          const ratio = (foreground, background) => {
            const light = Math.max(luminance(foreground), luminance(background));
            const dark = Math.min(luminance(foreground), luminance(background));
            return (light + 0.05) / (dark + 0.05);
          };
          const visible = (element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
          };
          const accessibleName = (link) => {
            const labelledBy = (link.getAttribute("aria-labelledby") || "").split(/\s+/).filter(Boolean)
              .map((id) => document.getElementById(id)?.textContent || "").join(" ");
            const images = [...link.querySelectorAll("img")].map((image) => image.alt || "").join(" ");
            return `${link.textContent || ""} ${link.getAttribute("aria-label") || ""} ${labelledBy} ${images} ${link.getAttribute("title") || ""}`.trim();
          };
          const containers = [...document.querySelectorAll(".mapping-summary > *, .skill-summary-card, .mapping-card, .mapping-filters")]
            .filter(visible).slice(0, 60);
          const contrastFailures = containers.flatMap((element) => {
            const foreground = parseColor(getComputedStyle(element).color);
            const contrast = foreground ? ratio(foreground, effectiveBackground(element)) : 0;
            return contrast >= 4.5 ? [] : [{ className: element.className, contrast }];
          });
          const linkContrastFailures = [...document.querySelectorAll(".mapping-card a, .skill-summary-card a, .mapping-filters a")]
            .filter(visible).slice(0, 60).flatMap((link) => {
              const foreground = parseColor(getComputedStyle(link).color);
              const contrast = foreground ? ratio(foreground, effectiveBackground(link)) : 0;
              return contrast >= 4.5 ? [] : [{ href: link.getAttribute("href"), contrast }];
            });
          const unnamedLinks = [...document.querySelectorAll("a[href]")].filter(visible).filter((link) => !accessibleName(link));
          return {
            title: document.title,
            h1Count: document.querySelectorAll("h1").length,
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            sampledContainers: containers.length,
            contrastFailures,
            linkContrastFailures,
            unnamedLinkCount: unnamedLinks.length,
            cardCount: document.querySelectorAll("[data-mapping-card]").length,
          };
        });

        if (metrics.h1Count !== 1) throw new Error(`${route} must contain exactly one h1 at ${viewport.width}px.`);
        if (metrics.scrollWidth > metrics.clientWidth + 2) throw new Error(`${route} has horizontal overflow at ${viewport.width}px.`);
        if (!metrics.sampledContainers || metrics.contrastFailures.length || metrics.linkContrastFailures.length) {
          throw new Error(`${route} failed live contrast validation at ${viewport.width}px: ${JSON.stringify(metrics)}.`);
        }
        if (metrics.unnamedLinkCount) throw new Error(`${route} has ${metrics.unnamedLinkCount} unnamed visible links at ${viewport.width}px.`);
        if (!metrics.cardCount) throw new Error(`${route} rendered no mapping cards at ${viewport.width}px.`);
        if (consoleErrors.length) throw new Error(`${route} emitted browser errors at ${viewport.width}px: ${consoleErrors.join(" | ")}`);

        results.push({ route, viewport, ...metrics, consoleErrors });
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
  return results;
}

(async () => {
  const workflows = await waitForRequiredWorkflows();
  const http = await verifyHttpSurface();
  const browser = await verifyBrowserSurface();
  const report = {
    status: "READY",
    verifiedAt: new Date().toISOString(),
    repository,
    targetSha,
    workflows,
    http,
    browser,
    limitations: [
      "Live verification proves the published static surface and deployment state; it does not establish search-engine indexing.",
      "Binary evidence retains the repository's documented manual-review and no-OCR limitations.",
    ],
  };
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
})().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
