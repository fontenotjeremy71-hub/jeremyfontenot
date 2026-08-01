"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { mapRecord, validateMappedRelationship } = require("../lib/evidence-skill-mapping");

const root = path.resolve(__dirname, "..", "..");
const checkOnly = process.argv.includes("--check");
const sourcePaths = {
  config: "content/site/evidence-skill-mapping.json",
  microsoft365: "assets/data/m365-evidence-catalog.json",
  homeLab: "assets/data/home-lab-evidence-catalog.json",
};
const outputPaths = {
  data: "assets/data/evidence-skill-map.json",
  browserData: "assets/data/evidence-skill-map-browser.json",
  evidence: "systems-skills/evidence-map.html",
  claims: "evidence/claim-map.html",
};
const manifestPath = "content/site/generated-skill-map-hashes.json";

const readBuffer = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(readBuffer(relative).toString("utf8"));
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");
const countBy = (items, key) => Object.fromEntries([...new Set(items.map((item) => item[key]))].sort()
  .map((value) => [value, items.filter((item) => item[key] === value).length]));

const config = readJson(sourcePaths.config);
const catalogs = [
  { path: sourcePaths.microsoft365, data: readJson(sourcePaths.microsoft365) },
  { path: sourcePaths.homeLab, data: readJson(sourcePaths.homeLab) },
];
const records = catalogs.flatMap((catalog) => catalog.data.records.map((record) => ({ record, sourceCatalog: catalog.path })))
  .sort((left, right) => left.record.id.localeCompare(right.record.id));
const recordById = new Map(records.map(({ record }) => [record.id, record]));
const relationships = records.map(({ record, sourceCatalog }) => mapRecord(record, sourceCatalog));
const skillById = new Map(config.skills.map((skill) => [skill.id, skill]));
const claims = catalogs.flatMap((catalog) => catalog.data.claimRelationships.map((claim) => ({
  ...claim,
  lab: catalog.data.records[0]?.lab,
  sourceCatalog: catalog.path,
  skillIds: [...new Set(claim.evidenceIds.flatMap((id) => relationships.find((item) => item.evidenceId === id)?.skillIds || []))].sort(),
}))).sort((left, right) => left.claimId.localeCompare(right.claimId));

const failures = [];
const evidenceIds = new Set();
const mappingContract = {
  skillIds: new Set(config.skills.map((skill) => skill.id)),
  relationshipTypes: new Set(config.allowedRelationshipTypes),
  readinessLabels: new Set(config.allowedReadinessLabels),
};
for (const relationship of relationships) {
  if (evidenceIds.has(relationship.evidenceId)) failures.push(`Duplicate evidence relationship: ${relationship.evidenceId}`);
  evidenceIds.add(relationship.evidenceId);
  failures.push(...validateMappedRelationship(relationship, mappingContract).map((failure) => `${relationship.evidenceId}: ${failure}`));
}
for (const claim of claims) {
  for (const id of claim.evidenceIds) {
    const record = recordById.get(id);
    if (!record) failures.push(`Claim ${claim.claimId} references missing evidence ${id}`);
    else if (!record.supportedClaims.includes(claim.claimId)) failures.push(`Claim ${claim.claimId} is not reciprocal with ${id}`);
  }
}
for (const { record } of records) {
  for (const claimId of record.supportedClaims) {
    const claim = claims.find((item) => item.claimId === claimId);
    if (!claim?.evidenceIds.includes(record.id)) failures.push(`Evidence ${record.id} is not reciprocal with ${claimId}`);
  }
}
if (failures.length) throw new Error(`Evidence-to-skill mapping validation failed:\n${failures.join("\n")}`);

const skills = config.skills.map((skill) => ({
  ...skill,
  evidenceIds: relationships.filter((item) => item.skillIds.includes(skill.id)).map((item) => item.evidenceId),
  claimIds: claims.filter((claim) => claim.skillIds.includes(skill.id)).map((claim) => claim.claimId),
}));
const publicCount = relationships.filter((item) => item.publicRoute).length;
const machineMap = {
  schemaVersion: 1,
  phase: config.phase,
  generatedFrom: Object.fromEntries(Object.entries(sourcePaths).map(([key, relative]) => [key, { path: relative, sha256: sha256(readBuffer(relative)) }])),
  totals: {
    evidenceRecords: relationships.length,
    mappedEvidenceRecords: relationships.filter((item) => item.skillIds.length).length,
    unmappedEvidenceRecords: relationships.filter((item) => !item.skillIds.length).length,
    skills: skills.length,
    claims: claims.length,
    publicEvidenceRecords: publicCount,
    metadataOrSourceReferenceRecords: relationships.length - publicCount,
    byLab: countBy(relationships, "lab"),
    byRelationshipType: countBy(relationships, "relationshipType"),
    byValidationStatus: countBy(relationships, "validationStatus"),
  },
  relationshipTypes: config.allowedRelationshipTypes,
  readinessLabels: config.allowedReadinessLabels,
  skills,
  developmentAreas: config.developmentAreas,
  claims,
  relationships,
  boundaries: [
    "Professional Service Desk experience and personal-lab systems administration evidence remain distinct.",
    "A source hash proves a recorded byte comparison only; it is not a universal tamper-proof guarantee.",
    "Isolated restore evidence does not prove full disaster recovery, recurring assurance, application recovery, RTO, or RPO.",
    "Configuration and inventory exports prove captured reviewed state, not organization-wide enforcement or current production ownership."
  ],
};

// The provenance-rich machine map remains authoritative. The browser payload
// removes source-only fields and interns repeated review copy so the interactive
// view can load quickly without changing any visible record content.
const browserTextFields = ["task", "observedResult", "scope", "limitations"];
const browserText = Object.fromEntries(browserTextFields.map((field) => [
  field,
  [...new Set(relationships.map((relationship) => relationship[field]))].sort(),
]));
const browserTextIndex = Object.fromEntries(browserTextFields.map((field) => [
  field,
  new Map(browserText[field].map((value, index) => [value, index])),
]));
const browserMap = {
  schemaVersion: 1,
  skills: config.skills.map(({ id, label: skillLabel }) => ({ id, label: skillLabel })),
  text: browserText,
  relationships: relationships.map((relationship) => ({
    evidenceId: relationship.evidenceId,
    lab: relationship.lab,
    technology: relationship.technology,
    evidenceType: relationship.evidenceType,
    skillIds: relationship.skillIds,
    relationshipType: relationship.relationshipType,
    validationStatus: relationship.validationStatus,
    systems: relationship.systems,
    task: browserTextIndex.task.get(relationship.task),
    observedResult: browserTextIndex.observedResult.get(relationship.observedResult),
    scope: browserTextIndex.scope.get(relationship.scope),
    limitations: browserTextIndex.limitations.get(relationship.limitations),
    publicRoute: relationship.publicRoute,
  })),
};

const label = (id) => skillById.get(id)?.label || id;
const options = (values, labels = {}) => [...new Set(values)].sort().map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(labels[value] || value)}</option>`).join("");
const pageStart = ({ title, description, canonical, heading, lead }) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="index, follow"><link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:site_name" content="Jeremy Fontenot"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="https://jeremyfontenot.online/assets/og/og-portfolio.png"><link rel="stylesheet" href="/assets/css/site.css"><link rel="stylesheet" href="/assets/css/evidence-skill-map.css"><script src="/assets/js/site.js" defer></script></head><body class="foundation-page mapping-page"><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><nav class="nav" aria-label="Primary navigation"><a class="brand" href="/"><img src="/assets/logos/header_logo_88x88.png" alt="Jeremy Fontenot logo" width="44" height="44"><span>Jeremy Fontenot</span><small>Support · systems · evidence</small></a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu">Menu</button><div class="nav-links" id="primary-menu"><a href="/">Home</a><a href="/systems-administration.html">Readiness</a><a href="/projects.html">Projects</a><a href="/proof.html">Proof</a><a href="/dashboard.html">Dashboard</a><a href="/resume.html">Resume</a><a href="/contact.html">Contact</a></div></nav></header><main id="main"><section class="page page-hero"><p class="eyebrow">Evidence-to-skill mapping</p><h1>${escapeHtml(heading)}</h1><p class="lead">${escapeHtml(lead)}</p><div class="actions"><a class="button primary" href="/systems-administration.html">Review readiness</a><a class="button" href="/systems-skills/">Review systems skills</a><a class="button" href="/evidence/claim-map.html">Review claim map</a></div></section>`;
const pageEnd = `</main><footer class="site-footer compact-footer"><p class="credibility">Experienced IT support professional with demonstrated junior systems administration capability. Professional and personal-lab evidence remain distinct.</p><nav class="compact-footer-links" aria-label="Footer navigation"><a href="/systems-skills/" aria-label="Systems skills">Skills</a><a href="/evidence/">Evidence</a><a href="/sitemap.xml">Sitemap</a></nav></footer></body></html>\n`;

const skillCards = skills.map((skill) => `<article class="skill-summary-card" id="skill-${escapeHtml(skill.id)}"><span class="status-label validated">${escapeHtml(skill.readinessLabel.replaceAll("-", " "))}</span><h3>${escapeHtml(skill.label)}</h3><dl><dt>Task</dt><dd>${escapeHtml(skill.task)}</dd><dt>Job relevance</dt><dd>${escapeHtml(skill.jobRelevance)}</dd><dt>Scope</dt><dd>${escapeHtml(skill.scope)}</dd><dt>Limitations</dt><dd>${escapeHtml(skill.limitations)}</dd></dl><p><strong>${skill.evidenceIds.length}</strong> related evidence records · <strong>${skill.claimIds.length}</strong> related claims</p></article>`).join("");
const recordCards = relationships.map((relationship) => {
  const record = recordById.get(relationship.evidenceId);
  // Source filenames remain available in the machine-readable provenance layer and
  // proof routes. Public card headings use stable capability labels so filenames
  // containing collection dates or recency terms do not become presentation copy.
  const title = `${relationship.technology.replaceAll("-", " ")} ${relationship.evidenceType.replaceAll("-", " ")} evidence`;
  const proof = record.publicRoute ? `<a href="${escapeHtml(record.publicRoute)}">Inspect supporting proof</a>` : `<span>Metadata or source reference only; no public artifact route.</span>`;
  return `<article class="mapping-card" data-mapping-card data-lab="${escapeHtml(relationship.lab)}" data-technology="${escapeHtml(relationship.technology)}" data-skill="${escapeHtml(relationship.skillIds.join(" "))}" data-evidenceType="${escapeHtml(relationship.evidenceType)}" data-system="${escapeHtml(relationship.systems.join(" "))}" data-relationship="${escapeHtml(relationship.relationshipType)}" data-validation="${escapeHtml(relationship.validationStatus)}"><p class="eyebrow">${escapeHtml(relationship.evidenceId)}</p><h3>${escapeHtml(title)}</h3><div class="mapping-tags"><span>${escapeHtml(relationship.lab)}</span><span>${escapeHtml(relationship.technology)}</span><span>${escapeHtml(relationship.evidenceType)}</span><span>${escapeHtml(relationship.relationshipType)}</span><span>${escapeHtml(relationship.validationStatus)}</span></div><dl><div><dt>Skills</dt><dd>${relationship.skillIds.map(label).map(escapeHtml).join(", ")}</dd></div><div><dt>Task</dt><dd>${escapeHtml(record.task)}</dd></div><div><dt>Observed result</dt><dd>${escapeHtml(record.result)}</dd></div><div><dt>Scope</dt><dd>${escapeHtml(record.scope)}</dd></div><div><dt>Limitations</dt><dd>${escapeHtml(record.limitations)}</dd></div></dl><p class="proof-links">${proof}</p></article>`;
}).join("");
const evidencePage = `${pageStart({title:"Evidence-to-Skill Map | Jeremy Fontenot",description:"Recruiter-friendly filters connecting every organized Microsoft 365 and Home Lab evidence record to skills, tasks, observed results, job relevance, scope, limitations, and claims.",canonical:"https://jeremyfontenot.online/systems-skills/evidence-map.html",heading:"Every organized artifact connected to a practical skill.",lead:"This generated relationship layer references the authoritative Microsoft 365 and Home Lab catalogs. It adds hiring context without replacing evidence provenance or integrity records."})}<section class="section"><div class="mapping-summary"><article><strong>${relationships.length}</strong><span>mapped evidence records</span></article><article><strong>${skills.length}</strong><span>bounded skills</span></article><article><strong>${claims.length}</strong><span>reciprocal claims</span></article><article><strong>0</strong><span>unmapped records</span></article></div></section><section class="section" aria-labelledby="skills-title"><div class="section-head"><p class="eyebrow">Practical contribution areas</p><h2 id="skills-title">Skill, task, job relevance, proof, scope, and limitations.</h2></div><div class="skill-summary-grid">${skillCards}</div></section><section class="section" data-mapping-root aria-labelledby="records-title"><div class="section-head"><p class="eyebrow">Recruiter-friendly evidence filters</p><h2 id="records-title">Inspect the relationship layer.</h2></div><div class="mapping-filters" id="filters"><div class="mapping-filter-field"><label for="mapping-search">Search</label><input id="mapping-search" name="q" type="search" data-mapping-filter></div><div class="mapping-filter-field"><label for="mapping-lab">Lab</label><select id="mapping-lab" name="lab" data-mapping-filter><option value="all">All labs</option>${options(relationships.map((item) => item.lab))}</select></div><div class="mapping-filter-field"><label for="mapping-technology">Technology</label><select id="mapping-technology" name="technology" data-mapping-filter><option value="all">All technologies</option>${options(relationships.map((item) => item.technology))}</select></div><div class="mapping-filter-field"><label for="mapping-skill">Skill</label><select id="mapping-skill" name="skill" data-mapping-filter><option value="all">All skills</option>${options(skills.map((item) => item.id),Object.fromEntries(skills.map((item) => [item.id,item.label])))}</select></div><div class="mapping-filter-field"><label for="mapping-type">Evidence type</label><select id="mapping-type" name="evidenceType" data-mapping-filter><option value="all">All evidence types</option>${options(relationships.map((item) => item.evidenceType))}</select></div><div class="mapping-filter-field"><label for="mapping-system">System</label><select id="mapping-system" name="system" data-mapping-filter><option value="all">All systems</option>${options(relationships.flatMap((item) => item.systems))}</select></div><div class="mapping-filter-field"><label for="mapping-relationship">Relationship</label><select id="mapping-relationship" name="relationship" data-mapping-filter><option value="all">All relationships</option>${options(relationships.map((item) => item.relationshipType))}</select></div><div class="mapping-filter-field"><label for="mapping-validation">Validation status</label><select id="mapping-validation" name="validation" data-mapping-filter><option value="all">All statuses</option>${options(relationships.map((item) => item.validationStatus))}</select></div><button class="button" type="button" data-mapping-reset>Reset filters</button></div><p class="mapping-status" role="status" aria-live="polite" data-mapping-status>${relationships.length} of ${relationships.length} evidence relationships shown</p><div class="mapping-empty" data-mapping-empty hidden>No records match these filters.</div><div class="mapping-grid">${recordCards}</div></section><script src="/assets/js/evidence-skill-map.js" defer></script>${pageEnd}`;

const paginationMarkup = `<nav class="mapping-pagination" aria-label="Evidence results pages" data-mapping-pagination><button class="button" type="button" data-mapping-previous>Previous</button><span data-mapping-page>Page 1</span><button class="button" type="button" data-mapping-next>Next</button></nav>`;
const evidencePageWithPagination = evidencePage
  .replace(
    '<h2 id="records-title">Inspect the relationship layer.</h2>',
    '<h2 id="records-title">Inspect the relationship layer without the endless scroll.</h2><p>Every record remains searchable and linked. Results load in focused pages so reviewers can compare evidence without overwhelming the document.</p>'
  )
  .replace(
    `<button class="button" type="button" data-mapping-reset>Reset filters</button></div><p class="mapping-status" role="status" aria-live="polite" data-mapping-status>${relationships.length} of ${relationships.length} evidence relationships shown</p>`,
    `<div class="mapping-filter-field"><label for="mapping-page-size">Results per page</label><select id="mapping-page-size" name="pageSize" data-mapping-page-size><option value="24">24 results</option><option value="48">48 results</option><option value="96">96 results</option></select></div><button class="button" type="button" data-mapping-reset>Reset filters</button></div><p class="mapping-status" role="status" aria-live="polite" data-mapping-status>Loading ${relationships.length} mapped evidence relationships…</p>${paginationMarkup}`
  )
  .replace(
    `<div class="mapping-grid">${recordCards}</div></section><script src="/assets/js/evidence-skill-map.js" defer></script>`,
    `<div class="mapping-grid" tabindex="-1" data-mapping-grid></div><noscript><p class="mapping-empty">JavaScript is required for the interactive relationship map. Every record remains available in the <a href="/assets/data/evidence-skill-map.json">machine-readable map</a>, <a href="/microsoft-365/evidence-catalog.html">Microsoft 365 catalog</a>, and <a href="/home-lab/evidence-catalog.html">Home Lab catalog</a>.</p></noscript>${paginationMarkup}</section><script src="/assets/js/evidence-skill-map.js" defer></script>`
  );

const claimCards = claims.map((claim) => {
  const publicRoutes = [...new Set(claim.evidenceIds.map((id) => recordById.get(id)?.publicRoute).filter(Boolean))];
  const links = publicRoutes.slice(0, 12).map((route) => `<a href="${escapeHtml(route)}">Inspect proof</a>`).join("");
  return `<article class="mapping-card" id="claim-${escapeHtml(claim.claimId)}"><p class="eyebrow">${escapeHtml(claim.claimId)}</p><h3>${escapeHtml(claim.claimText)}</h3><div class="mapping-tags"><span>${escapeHtml(claim.lab)}</span><span>${escapeHtml(claim.supportLevel)}</span></div><dl><div><dt>Related skills</dt><dd>${claim.skillIds.map(label).map(escapeHtml).join(", ")}</dd></div><div><dt>Evidence records</dt><dd>${claim.evidenceIds.length}</dd></div><div><dt>Scope</dt><dd>${escapeHtml(claim.scope)}</dd></div><div><dt>Limitations</dt><dd>${escapeHtml(claim.limitations)}</dd></div></dl><div class="proof-links">${links || "No direct public artifact route; relationships remain discoverable in the evidence-to-skill map."}</div></article>`;
}).join("");
const claimsPage = `${pageStart({title:"Evidence-to-Claim Index | Jeremy Fontenot",description:"Human-readable reciprocal claim relationships for the organized Microsoft 365 and Home Lab evidence catalogs, including related skills, proof counts, scope, and limitations.",canonical:"https://jeremyfontenot.online/evidence/claim-map.html",heading:"Claims remain reciprocal, inspectable, and bounded.",lead:"Each claim below points back to catalog evidence records, while every supporting record names the same claim. Scope and limitations remain part of the relationship."})}<section class="section"><div class="mapping-summary"><article><strong>${claims.length}</strong><span>bounded claims</span></article><article><strong>${relationships.length}</strong><span>reciprocal evidence records</span></article><article><strong>0</strong><span>unmapped records</span></article></div><div class="mapping-grid">${claimCards}</div></section>${pageEnd}`;
const claimsPageWithSemanticHeading = claimsPage.replace(
  '</div><div class="mapping-grid">',
  '</div><div class="section-head"><p class="eyebrow">Bounded claim index</p><h2 id="claims-title">Inspect bounded claims and supporting proof.</h2></div><div class="mapping-grid" aria-labelledby="claims-title">'
);

const expected = {
  [outputPaths.data]: Buffer.from(json(machineMap)),
  [outputPaths.browserData]: Buffer.from(`${JSON.stringify(browserMap)}\n`),
  [outputPaths.evidence]: Buffer.from(evidencePageWithPagination),
  [outputPaths.claims]: Buffer.from(claimsPageWithSemanticHeading),
};
const hashManifest = {
  schemaVersion: 1,
  generatedFrom: machineMap.generatedFrom,
  outputs: Object.fromEntries(Object.entries(expected).map(([relative, bytes]) => [relative, { algorithm: "sha256", hash: sha256(bytes), size: bytes.length }])),
};
expected[manifestPath] = Buffer.from(json(hashManifest));

if (checkOnly) {
  const drift = Object.entries(expected).filter(([relative, bytes]) => {
    const target = path.join(root, relative);
    return !fs.existsSync(target) || !readBuffer(relative).equals(bytes);
  }).map(([relative]) => relative);
  if (drift.length) throw new Error(`Evidence-to-skill generated output drift:\n${drift.join("\n")}`);
  console.log(`Evidence-to-skill mapping check passed: ${relationships.length} records, ${skills.length} skills, ${claims.length} claims.`);
} else {
  for (const [relative, bytes] of Object.entries(expected)) {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
  }
  console.log(`Evidence-to-skill mapping generation passed: ${relationships.length} records, ${skills.length} skills, ${claims.length} claims.`);
}
