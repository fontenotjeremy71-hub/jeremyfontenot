"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const readText = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const readJson = (relative) => JSON.parse(readText(relative));
const exists = (relative) => fs.existsSync(path.join(root, relative));
const failures = [];
const requireCondition = (condition, message) => { if (!condition) failures.push(message); };

const cname = readText("CNAME").trim();
const robots = readText("robots.txt");
const sitemap = readText("sitemap.xml");
const publication = readJson("config/publication-manifest.json");
const m365 = readJson("assets/data/m365-evidence-catalog.json");
const homeLab = readJson("assets/data/home-lab-evidence-catalog.json");
const skillMap = readJson("assets/data/evidence-skill-map.json");

requireCondition(cname === "jeremyfontenot.online", "CNAME must preserve jeremyfontenot.online.");
requireCondition(/User-agent:\s*\*/i.test(robots) && /Allow:\s*\//i.test(robots), "robots.txt must allow the public site.");
requireCondition(/Sitemap:\s*https:\/\/jeremyfontenot\.online\/sitemap\.xml/i.test(robots), "robots.txt must reference the canonical sitemap.");

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
];
for (const route of requiredRoutes) {
  const canonical = `https://jeremyfontenot.online${route}`;
  requireCondition(sitemap.includes(`<loc>${canonical}</loc>`), `Sitemap is missing required route: ${canonical}`);
}

for (const file of publication.requiredRootFiles || []) requireCondition(exists(file), `Required publication root file is missing: ${file}`);
for (const directory of ["assets", "evidence-library", "systems-skills", "microsoft-365", "home-lab", "evidence"]) {
  requireCondition((publication.directories || []).includes(directory), `Publication manifest is missing required directory: ${directory}`);
}
for (const rootName of [".git", ".github", "artifacts", "config", "content", "schemas", "scripts", "tests", "node_modules"]) {
  requireCondition((publication.forbiddenOutputRoots || []).includes(rootName), `Publication manifest must forbid source-only root: ${rootName}`);
}

requireCondition(Array.isArray(m365.records) && m365.records.length === 971, `Microsoft 365 catalog must contain 971 records; found ${m365.records?.length}.`);
requireCondition(Array.isArray(homeLab.records) && homeLab.records.length === 439, `Home Lab catalog must contain 439 records; found ${homeLab.records?.length}.`);
requireCondition(Array.isArray(skillMap.relationships) && skillMap.relationships.length === 1410, `Evidence-to-skill map must contain 1,410 relationships; found ${skillMap.relationships?.length}.`);
requireCondition(skillMap.totals?.unmappedEvidenceRecords === 0, "Evidence-to-skill map must contain zero unmapped records.");
requireCondition(skillMap.totals?.skills === 12, `Evidence-to-skill map must contain 12 bounded skills; found ${skillMap.totals?.skills}.`);
requireCondition(skillMap.totals?.claims === 23, `Evidence-to-skill map must contain 23 reciprocal claims; found ${skillMap.totals?.claims}.`);

const sourceIds = [...m365.records, ...homeLab.records].map((record) => record.id);
const mappedIds = skillMap.relationships.map((relationship) => relationship.evidenceId);
requireCondition(new Set(sourceIds).size === sourceIds.length, "Authoritative catalogs contain duplicate evidence IDs.");
requireCondition(new Set(mappedIds).size === mappedIds.length, "Evidence-to-skill map contains duplicate evidence IDs.");
requireCondition(sourceIds.length === mappedIds.length && sourceIds.every((id) => mappedIds.includes(id)), "Evidence-to-skill map does not cover every authoritative evidence ID exactly once.");

for (const relative of [
  "systems-skills/evidence-map.html",
  "evidence/claim-map.html",
  "assets/data/evidence-skill-map.json",
  "microsoft-365/evidence-catalog.html",
  "home-lab/evidence-catalog.html",
]) requireCondition(exists(relative), `Required generated release artifact is missing: ${relative}`);

for (const relative of ["systems-skills/evidence-map.html", "evidence/claim-map.html"]) {
  const html = readText(relative);
  requireCondition(/<title>[^<]+<\/title>/i.test(html), `${relative} is missing a title.`);
  requireCondition(/<meta\s+name=["']description["']/i.test(html), `${relative} is missing a meta description.`);
  requireCondition(/<link\s+rel=["']canonical["']/i.test(html), `${relative} is missing a canonical link.`);
  requireCondition(/<meta\s+property=["']og:title["']/i.test(html), `${relative} is missing Open Graph metadata.`);
  requireCondition((html.match(/<h1\b/gi) || []).length === 1, `${relative} must contain exactly one h1.`);
}

if (failures.length) {
  console.error(`Release readiness validation failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(JSON.stringify({
  status: "READY",
  requiredRoutes: requiredRoutes.length,
  microsoft365Records: m365.records.length,
  homeLabRecords: homeLab.records.length,
  mappedRelationships: skillMap.relationships.length,
  skills: skillMap.totals.skills,
  claims: skillMap.totals.claims,
  unmappedEvidenceRecords: skillMap.totals.unmappedEvidenceRecords,
  forbiddenPublicationRoots: publication.forbiddenOutputRoots.length,
}, null, 2));
