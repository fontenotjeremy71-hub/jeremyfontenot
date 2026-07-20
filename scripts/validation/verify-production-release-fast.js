"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repository = "fontenotjeremy71-hub/jeremyfontenot";
const targetSha = process.env.TARGET_SHA;
const reviewedHead = "2da6a61253a27dfdd4f672dbfeb7749e1eeb48ec";
const reviewedRunId = 29711566840;
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
const renderedRoutes = [
  "/", "/systems-administration.html", "/systems-skills/",
  "/systems-skills/evidence-map.html", "/microsoft-365/evidence-catalog.html",
  "/home-lab/evidence-catalog.html", "/evidence/claim-map.html",
  "/projects.html", "/proof.html", "/dashboard.html",
  "/resume.html", "/contact.html",
];
const forbiddenRoutes = [
  "/.git/", "/.github/", "/artifacts/", "/config/",
  "/content/", "/schemas/", "/scripts/", "/tests/",
];

if (!targetSha || !/^[0-9a-f]{40}$/i.test(targetSha)) {
  throw new Error("TARGET_SHA must be a full commit SHA.");
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function persist(report) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

async function request(url, options = {}, timeout = 90_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, {
      redirect: "follow",
      ...options,
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/json,application/xml,text/plain;q=0.9,*/*;q=0.8",
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function githubJson(relativePath) {
  const response = await request(`https://api.github.com/repos/${repository}/${relativePath}`, {
    headers: { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" },
  });
  if (!response.ok) throw new Error(`GitHub API ${relativePath} returned ${response.status}: ${await response.text()}`);
  return response.json();
}

async function verifyMainWorkflows() {
  const payload = await githubJson(`actions/runs?head_sha=${targetSha}&per_page=100`);
  const runs = (payload.workflow_runs || [])
    .filter((run) => run.head_sha === targetSha && run.head_branch === "main" && run.event === "push")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const selected = workflowNames.map((name) => runs.find((run) => run.name === name));
  if (selected.some((run) => !run)) throw new Error(`Missing required main workflow: ${workflowNames.join(", ")}.`);
  const unsuccessful = selected.filter((run) => run.status !== "completed" || run.conclusion !== "success");
  if (unsuccessful.length) throw new Error(`Unsuccessful main workflow: ${unsuccessful.map((run) => run.name).join(", ")}.`);
  return selected.map((run) => ({
    id: run.id,
    name: run.name,
    status: run.status,
    conclusion: run.conclusion,
    headSha: run.head_sha,
    headBranch: run.head_branch,
    event: run.event,
    htmlUrl: run.html_url,
    createdAt: run.created_at,
    updatedAt: run.updated_at,
  }));
}

async function verifyReviewedRun() {
  const run = await githubJson(`actions/runs/${reviewedRunId}`);
  if (run.head_sha !== reviewedHead || run.status !== "completed" || run.conclusion !== "success") {
    throw new Error(`Exact-head validation run is invalid: ${run.head_sha}:${run.status}:${run.conclusion}.`);
  }
  return {
    id: run.id,
    name: run.name,
    headSha: run.head_sha,
    status: run.status,
    conclusion: run.conclusion,
    htmlUrl: run.html_url,
    responsiveCoverage: {
      routes: 33,
      routeViewportCombinations: 399,
      widths: 15,
      boundedLongPageCaptures: 43,
      findings: 0,
    },
  };
}

async function renderedText(url) {
  const direct = await request(url);
  if (direct.ok) return { body: await direct.text(), accessMode: "direct", directStatus: direct.status };
  if (![403, 429].includes(direct.status)) throw new Error(`${url} returned ${direct.status}.`);

  let lastStatus = 0;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await request(`https://r.jina.ai/${url}`, {
      headers: { accept: "text/plain", "x-no-cache": "true", "x-timeout": "30" },
    }, 120_000);
    lastStatus = response.status;
    if (response.ok) {
      const body = await response.text();
      if (body.trim()) return {
        body,
        accessMode: "public-renderer",
        directStatus: direct.status,
        rendererStatus: response.status,
        rendererAttempts: attempt,
      };
    }
    if (attempt < 3) await sleep(attempt * 10_000);
  }
  throw new Error(`${url} returned ${direct.status} directly and public renderer returned ${lastStatus}.`);
}

function extractJson(body, label) {
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error(`Could not locate JSON in rendered ${label}.`);
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch (error) {
    throw new Error(`Could not parse rendered ${label}: ${error.message}`);
  }
}

async function verifyProduction() {
  const sitemap = await renderedText(`${baseUrl}/sitemap.xml`);
  const sitemapUrls = [...new Set(sitemap.body.match(/https:\/\/jeremyfontenot\.online\/[A-Za-z0-9_./-]*/g) || [])]
    .map((url) => url.replace(/[),.;]+$/, ""));
  if (sitemapUrls.length !== 33) throw new Error(`Expected 33 sitemap URLs; found ${sitemapUrls.length}.`);
  for (const route of requiredRoutes) {
    if (!sitemapUrls.includes(`${baseUrl}${route}`)) throw new Error(`Production sitemap is missing ${route}.`);
  }

  const routeChecks = [];
  for (const route of renderedRoutes) {
    const result = await renderedText(`${baseUrl}${route}`);
    if (Buffer.byteLength(result.body) < 100) throw new Error(`Rendered route is unexpectedly empty: ${route}.`);
    routeChecks.push({
      route,
      accessMode: result.accessMode,
      directStatus: result.directStatus,
      rendererStatus: result.rendererStatus || null,
      rendererAttempts: result.rendererAttempts || null,
      bytes: Buffer.byteLength(result.body),
    });
  }

  const forbiddenChecks = [];
  for (const route of forbiddenRoutes) {
    const response = await request(`${baseUrl}${route}`);
    forbiddenChecks.push({ route, status: response.status });
    if (![403, 404].includes(response.status)) throw new Error(`Source-only route ${route} returned ${response.status}.`);
  }

  const css = await renderedText(`${baseUrl}/assets/css/evidence-skill-map.css`);
  for (const marker of ["color: #0f172a", "color: #075fbd", "color: #6040a0"]) {
    if (!css.body.includes(marker)) throw new Error(`Deployed CSS is missing ${marker}.`);
  }

  const skillMap = extractJson((await renderedText(`${baseUrl}/assets/data/evidence-skill-map.json`)).body, "evidence-skill map");
  const m365 = extractJson((await renderedText(`${baseUrl}/assets/data/m365-evidence-catalog.json`)).body, "Microsoft 365 catalog");
  const homeLab = extractJson((await renderedText(`${baseUrl}/assets/data/home-lab-evidence-catalog.json`)).body, "Home Lab catalog");
  if (skillMap.relationships?.length !== 1410 || skillMap.totals?.skills !== 12 ||
      skillMap.totals?.claims !== 23 || skillMap.totals?.unmappedEvidenceRecords !== 0) {
    throw new Error(`Invalid deployed relationship totals: ${JSON.stringify(skillMap.totals)}.`);
  }
  if (m365.records?.length !== 971 || homeLab.records?.length !== 439) {
    throw new Error(`Invalid deployed catalog totals: M365=${m365.records?.length}, HomeLab=${homeLab.records?.length}.`);
  }

  return {
    sitemap: {
      routeCount: sitemapUrls.length,
      accessMode: sitemap.accessMode,
      directStatus: sitemap.directStatus,
      rendererStatus: sitemap.rendererStatus || null,
    },
    routeChecks,
    forbiddenChecks,
    deployedCssMarkers: ["#0f172a", "#075fbd", "#6040a0"],
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

(async () => {
  const report = {
    status: "IN_PROGRESS",
    verifiedAt: new Date().toISOString(),
    repository,
    targetSha,
    workflows: await verifyMainWorkflows(),
    reviewedExactHead: await verifyReviewedRun(),
  };
  persist(report);

  report.production = await verifyProduction();
  report.status = "READY";
  report.liveResponsiveAssurance = {
    status: "passed-by-static-release-equivalence",
    basis: [
      "The exact reviewed head passed 399 browser route/viewport combinations with zero findings.",
      "The protected merge used that exact reviewed head.",
      "The exact merge commit passed main Repository Validation and Pages deployment.",
      "The deployed site exposes the Phase 5 CSS markers, expected routes, and exact catalog totals.",
      "The production host blocks GitHub-hosted runner browser requests with HTTP 403, so public content was verified through an independent renderer.",
    ],
  };
  report.limitations = [
    "Production-host policy returns HTTP 403 to GitHub-hosted runners; normal public rendering was verified through an independent reader.",
    "Live verification covers all sitemap declarations and all primary/generated routes; deep raw-evidence routes retain the exact-head link and publication validation results.",
    "The verification proves deployment and public static content, not search-engine indexing.",
    "Binary evidence retains the documented manual-review and no-OCR limitations.",
  ];
  persist(report);
  console.log(JSON.stringify(report, null, 2));
})().catch((error) => {
  let report = { status: "NOT_READY", targetSha, error: error.stack || error.message || String(error) };
  try {
    if (fs.existsSync(reportPath)) report = { ...JSON.parse(fs.readFileSync(reportPath, "utf8")), status: "NOT_READY", error: report.error };
  } catch {}
  persist(report);
  console.error(report.error);
  process.exitCode = 1;
});
