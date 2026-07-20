"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const {
  mapRecord,
  relationshipType,
  skillIdsFor,
  validateMappedRelationship,
} = require("../scripts/lib/evidence-skill-mapping");

const root = path.resolve(__dirname, "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const config = readJson("content/site/evidence-skill-mapping.json");
const m365 = readJson("assets/data/m365-evidence-catalog.json");
const homeLab = readJson("assets/data/home-lab-evidence-catalog.json");
const generated = readJson("assets/data/evidence-skill-map.json");

test("every organized evidence record has one unique mapping relationship", () => {
  const sourceRecords = [...m365.records, ...homeLab.records];
  assert.equal(sourceRecords.length, 1410);
  assert.equal(generated.relationships.length, sourceRecords.length);
  assert.equal(new Set(generated.relationships.map((item) => item.evidenceId)).size, sourceRecords.length);
  assert.equal(generated.totals.unmappedEvidenceRecords, 0);
  for (const relationship of generated.relationships) {
    assert.match(relationship.sourceCommit, /^[0-9a-f]{40}$/);
    assert.match(relationship.sourceHash, /^[0-9a-f]{64}$/);
    assert.equal(relationship.sourceHashAlgorithm, "sha256");
    assert.ok(Number.isInteger(relationship.sourceSize));
    assert.ok(relationship.collectionContext);
    assert.ok(relationship.task);
    assert.ok(relationship.observedResult);
    assert.ok(relationship.scope);
    assert.ok(relationship.limitations);
    assert.ok(relationship.publicationClassification);
  }
});

test("all evidence-to-claim relationships remain reciprocal", () => {
  const records = new Map([...m365.records, ...homeLab.records].map((record) => [record.id, record]));
  for (const claim of [...m365.claimRelationships, ...homeLab.claimRelationships]) {
    for (const evidenceId of claim.evidenceIds) assert.ok(records.get(evidenceId).supportedClaims.includes(claim.claimId));
  }
  for (const record of records.values()) {
    for (const claimId of record.supportedClaims) {
      const claim = [...m365.claimRelationships, ...homeLab.claimRelationships].find((item) => item.claimId === claimId);
      assert.ok(claim.evidenceIds.includes(record.id));
    }
  }
});

test("configuration, inventory, operational, restore, and restricted evidence receive bounded relationship types", () => {
  const base = { publicationClassification: "public-original", sourcePath: "proof.json" };
  assert.equal(relationshipType({ ...base, evidenceType: "configuration" }), "configuration-evidence");
  assert.equal(relationshipType({ ...base, evidenceType: "inventories" }), "inventory-evidence");
  assert.equal(relationshipType({ ...base, evidenceType: "testing" }), "operational-test");
  assert.equal(relationshipType({ ...base, evidenceType: "validation", sourcePath: "restore-validation.md" }), "restore-test");
  assert.equal(relationshipType({ ...base, evidenceType: "validation", publicationClassification: "source-reference-only" }), "context-only");
});

test("every supported technology maps deterministically to approved skills", () => {
  const allowed = new Set(config.skills.map((skill) => skill.id));
  for (const record of [...m365.records, ...homeLab.records]) {
    const first = skillIdsFor(record);
    const second = skillIdsFor(record);
    assert.deepEqual(first, second);
    assert.ok(first.length > 0);
    first.forEach((skillId) => assert.ok(allowed.has(skillId), `${record.id}: ${skillId}`));
  }
});

test("invalid relationship contracts are rejected by the negative validator", () => {
  const errors = validateMappedRelationship({
    evidenceId: "fixture",
    skillIds: ["invented-skill"],
    supportedClaims: [],
    relationshipType: "invented-relationship",
    validationStatus: "unsupported-status",
  }, {
    skillIds: new Set(config.skills.map((skill) => skill.id)),
    relationshipTypes: new Set(config.allowedRelationshipTypes),
    readinessLabels: new Set(config.allowedReadinessLabels),
  });
  assert.ok(errors.some((error) => error.includes("Unknown skill")));
  assert.ok(errors.some((error) => error.includes("Unsupported relationship type")));
  assert.ok(errors.some((error) => error.includes("Unsupported validation status")));
  assert.ok(errors.some((error) => error.includes("supported claim")));
});

test("source-reference records remain discoverable without invented public routes", () => {
  const record = homeLab.records.find((item) => item.publicationClassification === "source-reference-only");
  const relationship = mapRecord(record, "assets/data/home-lab-evidence-catalog.json");
  assert.equal(relationship.publicRoute, null);
  assert.equal(relationship.relationshipType, "context-only");
  assert.ok(relationship.skillIds.length > 0);
});

test("generated human indexes contain complete SEO, accessible controls, and current totals", () => {
  const evidenceHtml = fs.readFileSync(path.join(root, "systems-skills/evidence-map.html"), "utf8");
  const claimHtml = fs.readFileSync(path.join(root, "evidence/claim-map.html"), "utf8");
  for (const html of [evidenceHtml, claimHtml]) {
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.match(html, /<meta name="description"/);
    assert.match(html, /<link rel="canonical"/);
    assert.match(html, /<meta property="og:title"/);
    assert.match(html, /<h1>/);
  }
  assert.match(evidenceHtml, /1410/);
  assert.match(evidenceHtml, /data-mapping-filter/);
  assert.match(evidenceHtml, /data-evidenceType=/);
  assert.match(claimHtml, /23<\/strong><span>bounded claims/);
  const visibleEvidenceText = evidenceHtml.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ");
  assert.doesNotMatch(visibleEvidenceText, /\b(?:19|20)\d{2}\b/);
  assert.doesNotMatch(visibleEvidenceText, /\b(?:recent|recently|latest|newest|fresh|freshness|date|dates|dated|year|years|month|months|timestamp|timestamps)\b/i);
});
