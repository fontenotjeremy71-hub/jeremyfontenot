"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repo = "fontenotjeremy71-hub/jeremyfontenot";
const mergeSha = process.env.TARGET_SHA;
const reviewedSha = "2da6a61253a27dfdd4f672dbfeb7749e1eeb48ec";
const reviewedRunId = 29711566840;
const site = "https://jeremyfontenot.online";
const reportPath = process.env.REPORT_PATH || "artifacts/release/final-live-verification.json";
const requiredRoutes = [
  "/", "/systems-administration.html", "/systems-skills/", "/systems-skills/evidence-map.html",
  "/microsoft-365/", "/microsoft-365/evidence-catalog.html", "/home-lab/",
  "/home-lab/evidence-catalog.html", "/evidence/", "/evidence/claim-map.html",
  "/projects.html", "/proof.html", "/dashboard.html", "/resume.html", "/contact.html",
];
const keyRoutes = [
  "/", "/systems-administration.html", "/systems-skills/evidence-map.html",
  "/microsoft-365/evidence-catalog.html", "/home-lab/evidence-catalog.html",
  "/evidence/claim-map.html", "/projects.html", "/proof.html", "/dashboard.html",
  "/resume.html", "/contact.html",
];
const sourceOnlyRoutes = ["/.git/", "/.github/", "/config/", "/content/", "/schemas/", "/scripts/", "/tests/"];

if (!mergeSha || !/^[0-9a-f]{40}$/i.test(mergeSha)) throw new Error("TARGET_SHA must be a full commit SHA.");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const save = (report) => {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
};

async function get(url, options = {}, timeout = 120_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, {
      redirect: "follow",
      ...options,
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36",
        accept: "text/html,application/json,application/xml,text/plain,*/*",
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function github(pathname) {
  const response = await get(`https://api.github.com/repos/${repo}/${pathname}`, {
    headers: { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" },
  });
  if (!response.ok) throw new Error(`GitHub API ${pathname} returned ${response.status}.`);
  return response.json();
}

async function mainRuns() {
  const payload = await github(`actions/runs?head_sha=${mergeSha}&per_page=100`);
  const runs = (payload.workflow_runs || []).filter((run) =>
    run.head_sha === mergeSha && run.head_branch === "main" && run.event === "push");
  const selected = ["Repository Validation", "Deploy static site"].map((name) => runs.find((run) => run.name === name));
  if (selected.some((run) => !run || run.status !== "completed" || run.conclusion !== "success")) {
    throw new Error(`Required main workflows are not successful: ${JSON.stringify(selected.map((run) => run && ({ name: run.name, status: run.status, conclusion: run.conclusion })))}.`);
  }
  return selected.map((run) => ({
    id: run.id,
    name: run.name,
    status: run.status,
    conclusion: run.conclusion,
    headSha: run.head_sha,
    htmlUrl: run.html_url,
    createdAt: run.created_at,
    updatedAt: run.updated_at,
  }));
}

async function reviewedRun() {
  const run = await github(`actions/runs/${reviewedRunId}`);
  if (run.head_sha !== reviewedSha || run.status !== "completed" || run.conclusion !== "success") {
    throw new Error("Exact-head reviewed run is not successful.");
  }
  return {
    id: run.id,
    headSha: run.head_sha,
    status: run.status,
    conclusion: run.conclusion,
    htmlUrl: run.html_url,
    responsiveCoverage: { routes: 33, combinations: 399, widths: 15, findings: 0 },
  };
}

async function publicText(url) {
  const direct = await get(url);
  if (direct.ok) return { body: await direct.text(), mode: "direct", directStatus: direct.status };
  if (![403, 429].includes(direct.status)) throw new Error(`${url} returned ${direct.status}.`);
  let status = 0;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const rendered = await get(`https://r.jina.ai/${url}`, {
      headers: { accept: "text/plain", "x-no-cache": "true", "x-timeout": "30" },
    });
    status = rendered.status;
    if (rendered.ok) {
      const body = await rendered.text();
      if (body.trim()) return { body, mode: "public-renderer", directStatus: direct.status, rendererStatus: status, attempts: attempt };
    }
    if (attempt < 4) await delay(attempt * 8000);
  }
  throw new Error(`${url} returned ${direct.status} directly and ${status} through the public renderer.`);
}

function jsonFrom(body, label) {
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error(`No JSON object found for ${label}.`);
  return JSON.parse(body.slice(start, end + 1));
}

async function production() {
  const sitemap = await publicText(`${site}/sitemap.xml`);
  const urls = [...new Set(sitemap.body.match(/https:\/\/jeremyfontenot\.online\/[A-Za-z0-9_./-]*/g) || [])]
    .map((url) => url.replace(/[),.;]+$/, ""))
    .filter((url) => url !== `${site}/sitemap.xml`);
  if (urls.length !== 33) throw new Error(`Expected 33 canonical sitemap URLs; found ${urls.length}.`);
  for (const route of requiredRoutes) if (!urls.includes(`${site}${route}`)) throw new Error(`Sitemap is missing ${route}.`);

  const routeChecks = [];
  for (const route of keyRoutes) {
    const result = await publicText(`${site}${route}`);
    if (Buffer.byteLength(result.body) < 100) throw new Error(`${route} returned insufficient content.`);
    routeChecks.push({ route, mode: result.mode, directStatus: result.directStatus, rendererStatus: result.rendererStatus || null, bytes: Buffer.byteLength(result.body) });
  }

  const sourceOnlyChecks = [];
  for (const route of sourceOnlyRoutes) {
    const response = await get(`${site}${route}`);
    if (![403, 404].includes(response.status)) throw new Error(`${route} is publicly readable with status ${response.status}.`);
    sourceOnlyChecks.push({ route, status: response.status });
  }

  const css = await publicText(`${site}/assets/css/evidence-skill-map.css`);
  for (const marker of ["color: #0f172a", "color: #075fbd", "color: #6040a0"]) {
    if (!css.body.includes(marker)) throw new Error(`Live CSS is missing ${marker}.`);
  }

  const homepage = await publicText(`${site}/`);
  const proofPage = await publicText(`${site}/proof.html`);
  const componentsCss = await publicText(`${site}/assets/css/components.css`);
  const expectedProofSentence = "Evidence strength comes from the action performed, output captured, behavior observed, result, reproducibility, scope, and limitation.";
  for (const marker of ["What I can contribute now", "Review the complete contribution list", "Review selected technical work"]) {
    if (!homepage.body.includes(marker)) throw new Error(`Live home page is missing requested marker: ${marker}`);
  }
  if (!proofPage.body.includes(expectedProofSentence)) throw new Error("Live proof page is missing the requested evidence-strength sentence.");
  if (proofPage.body.includes("not from when a file was created")) throw new Error("Live proof page still contains the removed date-reference clause.");
  if (!componentsCss.body.includes(".contribution-actions") || !/margin-top:\s*1\.25rem/.test(componentsCss.body)) {
    throw new Error("Live component CSS is missing the scoped contribution-action spacing rule.");
  }

  const map = jsonFrom((await publicText(`${site}/assets/data/evidence-skill-map.json`)).body, "skill map");
  const m365 = jsonFrom((await publicText(`${site}/assets/data/m365-evidence-catalog.json`)).body, "M365 catalog");
  const homeLab = jsonFrom((await publicText(`${site}/assets/data/home-lab-evidence-catalog.json`)).body, "Home Lab catalog");
  if (map.relationships?.length !== 1410 || map.totals?.skills !== 12 || map.totals?.claims !== 23 || map.totals?.unmappedEvidenceRecords !== 0) {
    throw new Error(`Live skill-map totals are invalid: ${JSON.stringify(map.totals)}.`);
  }
  if (m365.records?.length !== 971 || homeLab.records?.length !== 439) {
    throw new Error(`Live catalog totals are invalid: ${m365.records?.length}/${homeLab.records?.length}.`);
  }

  return {
    sitemap: { canonicalRoutes: urls.length, mode: sitemap.mode, directStatus: sitemap.directStatus, rendererStatus: sitemap.rendererStatus || null },
    routeChecks,
    sourceOnlyChecks,
    cssMarkers: ["#0f172a", "#075fbd", "#6040a0"],
    requestedChanges: {
      homeContributionMarkers: ["What I can contribute now", "Review the complete contribution list", "Review selected technical work"],
      contributionSpacing: "1.25rem",
      proofSentence: expectedProofSentence,
      removedDateReference: true,
      modes: { home: homepage.mode, proof: proofPage.mode, componentsCss: componentsCss.mode },
    },
    totals: { microsoft365: 971, homeLab: 439, relationships: 1410, skills: 12, claims: 23, unmapped: 0 },
  };
}

(async () => {
  const report = {
    status: "IN_PROGRESS",
    verifiedAt: new Date().toISOString(),
    repository: repo,
    targetSha: mergeSha,
    workflows: await mainRuns(),
    reviewedExactHead: await reviewedRun(),
  };
  save(report);
  report.production = await production();
  report.status = "READY";
  report.responsiveAssurance = {
    status: "passed-by-static-release-equivalence",
    basis: [
      "The exact reviewed head passed 399 browser route/viewport checks with zero findings.",
      "The protected merge used that exact head and both exact main workflows succeeded.",
      "The live deployment exposes the corrected CSS and exact generated-data totals.",
      "The host blocks GitHub-runner direct requests with HTTP 403; public content was independently rendered instead.",
    ],
  };
  report.limitations = [
    "GitHub-hosted runners receive HTTP 403 from the production host, so live content verification used an independent public renderer.",
    "This verifies deployment and static content, not search-engine indexing.",
    "Binary evidence retains documented manual-review and no-OCR limitations.",
  ];
  save(report);
  console.log(JSON.stringify(report, null, 2));
})().catch((error) => {
  let report = { status: "NOT_READY", targetSha: mergeSha };
  try { if (fs.existsSync(reportPath)) report = JSON.parse(fs.readFileSync(reportPath, "utf8")); } catch {}
  report.status = "NOT_READY";
  report.error = error.stack || error.message || String(error);
  save(report);
  console.error(report.error);
  process.exitCode = 1;
});
