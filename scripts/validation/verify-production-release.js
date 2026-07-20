"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const repository = "fontenotjeremy71-hub/jeremyfontenot";
const targetSha = process.env.TARGET_SHA;
const baseUrl = "https://jeremyfontenot.online";
const reportPath = process.env.REPORT_PATH || "artifacts/release/final-live-verification.json";
const workflowNames = ["Repository Validation", "Deploy static site"];
const requiredRoutes = [
  "/", "/systems-administration.html", "/systems-skills/",
  "/systems-skills/evidence-map.html", "/microsoft-365/",
  "/microsoft-365/evidence-catalog.html", "/home-lab/",
  "/home-lab/evidence-catalog.html", "/evidence/",
  "/evidence/claim-map.html", "/projects.html", "/proof.html",
  "/dashboard.html", "/resume.html", "/contact.html",
];
const forbiddenRoutes = [
  "/.git/", "/.github/", "/artifacts/", "/config/",
  "/content/", "/schemas/", "/scripts/", "/tests/",
];
const viewports = [
  { width: 320, height: 800 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

if (!targetSha || !/^[0-9a-f]{40}$/i.test(targetSha)) {
  throw new Error("TARGET_SHA must be a full commit SHA.");
}

async function request(url, options = {}, timeout = 60_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, {
      redirect: "follow",
      ...options,
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/json,application/xml;q=0.9,*/*;q=0.8",
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function text(url, expectedStatus = 200) {
  const response = await request(url);
  if (response.status !== expectedStatus) {
    throw new Error(`${url} returned ${response.status}; expected ${expectedStatus}.`);
  }
  return { status: response.status, body: await response.text() };
}

async function verifyWorkflows() {
  const response = await request(
    `https://api.github.com/repos/${repository}/actions/runs?head_sha=${targetSha}&per_page=100`,
    { headers: { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" } },
  );
  if (!response.ok) throw new Error(`GitHub workflow query returned ${response.status}: ${await response.text()}`);
  const payload = await response.json();
  const runs = (payload.workflow_runs || [])
    .filter((run) => run.head_sha === targetSha && run.head_branch === "main" && run.event === "push")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const selected = workflowNames.map((name) => runs.find((run) => run.name === name));
  if (selected.some((run) => !run)) {
    throw new Error(`Missing required push workflow. Observed: ${runs.map((run) => run.name).join(", ") || "none"}.`);
  }
  const unsuccessful = selected.filter((run) => run.status !== "completed" || run.conclusion !== "success");
  if (unsuccessful.length) {
    throw new Error(`Required workflow is not successful: ${unsuccessful.map((run) => `${run.name}:${run.status}:${run.conclusion}`).join(", ")}.`);
  }
  return selected.map((run) => ({
    id: run.id,
    name: run.name,
    status: run.status,
    conclusion: run.conclusion,
    headSha: run.head_sha,
    event: run.event,
    htmlUrl: run.html_url,
  }));
}

async function verifyHttp() {
  const sitemap = await text(`${baseUrl}/sitemap.xml`);
  const urls = [...sitemap.body.matchAll(/<loc>(https:\/\/jeremyfontenot\.online[^<]+)<\/loc>/g)]
    .map((match) => match[1]);
  if (!urls.length) throw new Error("Production sitemap is empty.");
  for (const route of requiredRoutes) {
    if (!urls.includes(`${baseUrl}${route}`)) throw new Error(`Sitemap is missing ${route}.`);
  }

  const routeChecks = [];
  for (const url of urls) {
    const result = await text(url);
    routeChecks.push({ url, status: result.status, bytes: Buffer.byteLength(result.body) });
  }

  const forbiddenChecks = [];
  for (const route of forbiddenRoutes) {
    const response = await request(`${baseUrl}${route}`);
    forbiddenChecks.push({ route, status: response.status });
    if (response.status !== 404) throw new Error(`Source-only route ${route} returned ${response.status}; expected 404.`);
  }

  const css = await text(`${baseUrl}/assets/css/evidence-skill-map.css`);
  for (const marker of ["color: #0f172a", "color: #075fbd", "color: #6040a0"]) {
    if (!css.body.includes(marker)) throw new Error(`Deployed CSS is missing ${marker}.`);
  }

  const skillMap = JSON.parse((await text(`${baseUrl}/assets/data/evidence-skill-map.json`)).body);
  const m365 = JSON.parse((await text(`${baseUrl}/assets/data/m365-evidence-catalog.json`)).body);
  const homeLab = JSON.parse((await text(`${baseUrl}/assets/data/home-lab-evidence-catalog.json`)).body);
  if (skillMap.relationships?.length !== 1410 || skillMap.totals?.skills !== 12 ||
      skillMap.totals?.claims !== 23 || skillMap.totals?.unmappedEvidenceRecords !== 0) {
    throw new Error(`Invalid deployed relationship totals: ${JSON.stringify(skillMap.totals)}.`);
  }
  if (m365.records?.length !== 971 || homeLab.records?.length !== 439) {
    throw new Error(`Invalid deployed catalog totals: M365=${m365.records?.length}, HomeLab=${homeLab.records?.length}.`);
  }

  return {
    sitemapRouteCount: urls.length,
    routeChecks,
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

async function verifyBrowser() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport,
        reducedMotion: "reduce",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36",
      });
      const page = await context.newPage();
      const errors = [];
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      page.on("pageerror", (error) => errors.push(error.message));
      for (const route of ["/systems-skills/evidence-map.html", "/evidence/claim-map.html"]) {
        const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 120_000 });
        if (!response || response.status() !== 200) throw new Error(`Browser load failed for ${route}.`);
        const metrics = await page.evaluate(() => {
          const parse = (value) => {
            const match = String(value).match(/rgba?\(([^)]+)\)/i);
            if (!match) return null;
            const parts = match[1].split(/[,/\s]+/).filter(Boolean).map(Number);
            return { r: parts[0], g: parts[1], b: parts[2], a: Number.isFinite(parts[3]) ? parts[3] : 1 };
          };
          const background = (element) => {
            for (let current = element; current; current = current.parentElement) {
              const color = parse(getComputedStyle(current).backgroundColor);
              if (color && color.a > 0.99) return color;
            }
            return { r: 255, g: 255, b: 255 };
          };
          const channel = (value) => {
            const n = value / 255;
            return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
          };
          const luminance = (color) => 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
          const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) /
            (Math.min(luminance(a), luminance(b)) + 0.05);
          const visible = (element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
          };
          const samples = [...document.querySelectorAll(".mapping-summary > *, .skill-summary-card, .mapping-card, .mapping-filters")]
            .filter(visible).slice(0, 60);
          const contrastFailures = samples.filter((element) => {
            const foreground = parse(getComputedStyle(element).color);
            return !foreground || contrast(foreground, background(element)) < 4.5;
          }).length;
          const unnamedLinks = [...document.querySelectorAll("a[href]")].filter(visible).filter((link) => {
            const label = `${link.textContent || ""} ${link.getAttribute("aria-label") || ""} ${link.getAttribute("title") || ""}`.trim();
            const imageAlt = [...link.querySelectorAll("img")].map((image) => image.alt || "").join(" ").trim();
            return !label && !imageAlt;
          }).length;
          return {
            h1Count: document.querySelectorAll("h1").length,
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            cards: document.querySelectorAll("[data-mapping-card]").length,
            samples: samples.length,
            contrastFailures,
            unnamedLinks,
          };
        });
        if (metrics.h1Count !== 1 || metrics.scrollWidth > metrics.clientWidth + 2 || !metrics.cards ||
            !metrics.samples || metrics.contrastFailures || metrics.unnamedLinks || errors.length) {
          throw new Error(`Live browser validation failed for ${route} at ${viewport.width}px: ${JSON.stringify({ metrics, errors })}.`);
        }
        results.push({ route, viewport, ...metrics, errors });
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
  return results;
}

(async () => {
  const report = {
    status: "READY",
    verifiedAt: new Date().toISOString(),
    targetSha,
    workflows: await verifyWorkflows(),
    http: await verifyHttp(),
    browser: await verifyBrowser(),
    limitations: [
      "The verification confirms deployment and live static-site behavior, not search-engine indexing.",
      "Binary evidence retains the documented manual-review and no-OCR limitations.",
    ],
  };
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
})().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
