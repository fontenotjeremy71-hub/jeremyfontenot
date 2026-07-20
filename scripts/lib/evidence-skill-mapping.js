"use strict";

const technologySkills = {
  "microsoft-365": {
    "tenant-administration": ["microsoft-365-entra", "identity-administration"],
    "entra-id": ["identity-administration", "microsoft-365-entra"],
    intune: ["microsoft-365-entra", "troubleshooting"],
    "exchange-online": ["microsoft-365-entra", "troubleshooting"],
    sharepoint: ["microsoft-365-entra", "technical-documentation"],
    teams: ["microsoft-365-entra", "troubleshooting"],
    "security-compliance": ["identity-administration", "microsoft-365-entra"],
    applications: ["identity-administration", "microsoft-365-entra"],
    automation: ["powershell-automation", "microsoft-365-entra"],
  },
  "home-lab": {
    environment: ["technical-documentation", "troubleshooting"],
    proxmox: ["virtualization", "troubleshooting"],
    "active-directory": ["identity-administration", "windows-server", "dns-dhcp-gpo"],
    "dns-dhcp": ["dns-dhcp-gpo", "troubleshooting"],
    networking: ["networking", "troubleshooting"],
    pfsense: ["networking", "troubleshooting"],
    "windows-server": ["windows-server", "troubleshooting"],
    "windows-clients": ["troubleshooting", "identity-administration"],
    linux: ["linux-administration", "troubleshooting"],
    "backup-recovery": ["backup-operations", "virtualization"],
    "monitoring-logging": ["troubleshooting", "escalation"],
    security: ["troubleshooting", "technical-documentation"],
    automation: ["powershell-automation", "technical-documentation"],
  },
};

function normalizeEvidenceType(value) {
  return String(value || "").toLowerCase().replace(/s$/, "");
}

function relationshipType(record) {
  const type = normalizeEvidenceType(record.evidenceType);
  const path = String(record.sourcePath || "").toLowerCase();
  if (["metadata-only", "source-reference-only"].includes(record.publicationClassification)) return "context-only";
  if (/restore/.test(path) && ["testing", "validation", "report"].includes(type)) return "restore-test";
  if (type === "configuration") return "configuration-evidence";
  if (type === "inventorie" || type === "inventory") return "inventory-evidence";
  if (type === "testing") return "operational-test";
  if (type === "validation") return "direct-validation";
  if (["documentation", "report", "manifest"].includes(type)) return "documentation-support";
  return "supporting-evidence";
}

function validationStatus(record) {
  const state = String(record.resultState || "").toLowerCase();
  const type = normalizeEvidenceType(record.evidenceType);
  if (state === "insufficient" || state === "misleading-overstated") return "development-area";
  if (state === "documented-only" || ["documentation", "report", "manifest"].includes(type)) return "documented-and-reviewed";
  if (state === "directly-proven" || ["testing", "validation"].includes(type)) return "validated-through-testing";
  return "demonstrated-in-lab";
}

function systemsFor(record) {
  const haystack = `${record.technology} ${record.sourcePath} ${record.task}`.toLowerCase();
  const systems = [];
  const add = (id, pattern) => { if (pattern.test(haystack)) systems.push(id); };
  add("proxmox", /proxmox|pve|qemu/);
  add("pfsense", /pfsense/);
  add("active-directory", /active.directory|\bad\b|dc01|domain.controller|group.policy|\bgpo\b/);
  add("windows", /windows|ws01|dc01/);
  add("linux", /linux|ubuntu|linux01|sssd|kerberos/);
  add("dns-dhcp", /\bdns\b|\bdhcp\b/);
  add("microsoft-365", /microsoft.365|m365|entra|intune|exchange|sharepoint|teams|conditional.access/);
  add("powershell", /powershell|\.ps1\b|microsoft.graph|\bgraph\b/);
  add("backup-recovery", /backup|restore|archive|vzdump/);
  return systems.length ? [...new Set(systems)] : [record.lab];
}

function skillIdsFor(record) {
  const base = technologySkills[record.lab]?.[record.technology] || [];
  const ids = [...base];
  const type = normalizeEvidenceType(record.evidenceType);
  const haystack = `${record.sourcePath} ${record.task}`.toLowerCase();
  if (/powershell|\.ps1\b|microsoft.graph|\bgraph\b/.test(haystack)) ids.push("powershell-automation");
  if (/backup|restore|archive|vzdump/.test(haystack)) ids.push("backup-operations");
  if (/\bdns\b|\bdhcp\b|group.policy|\bgpo\b/.test(haystack)) ids.push("dns-dhcp-gpo");
  if (["documentation", "report", "manifest"].includes(type)) ids.push("technical-documentation");
  if (["testing", "validation", "report"].includes(type)) ids.push("escalation");
  return [...new Set(ids.length ? ids : ["troubleshooting"])].sort();
}

function mapRecord(record, sourceCatalog) {
  return {
    evidenceId: record.id,
    title: String(record.sourcePath || record.id).split("/").at(-1),
    sourceCatalog,
    currentRepositoryPath: record.publicPath || null,
    sourceRepository: record.sourceRepository,
    sourcePath: record.sourcePath,
    sourceCommit: record.sourceCommit,
    sourceHashAlgorithm: record.sourceIntegrity?.algorithm || record.hashAlgorithm,
    sourceHash: record.sourceIntegrity?.hash || record.hash,
    sourceSize: record.sourceIntegrity?.size ?? record.size,
    sourceVerificationMethod: record.sourceVerificationMethod,
    collectionContext: record.collectionContext,
    lab: record.lab,
    technology: record.technology,
    evidenceType: record.evidenceType,
    skillIds: skillIdsFor(record),
    supportedClaims: [...record.supportedClaims].sort(),
    relationshipType: relationshipType(record),
    validationStatus: validationStatus(record),
    systems: systemsFor(record).sort(),
    task: record.task,
    observedResult: record.result,
    scope: record.scope,
    limitations: record.limitations,
    publicationClassification: record.publicationClassification,
    publicRoute: record.publicRoute,
    relatedArtifacts: {
      logicalDestination: record.logicalDestination || null,
      attestationPath: record.attestationPath || null,
      publicPath: record.publicPath || null,
    },
  };
}

function validateMappedRelationship(relationship, { skillIds, relationshipTypes, readinessLabels }) {
  const errors = [];
  if (!relationship.evidenceId) errors.push("Evidence ID is required.");
  if (!Array.isArray(relationship.skillIds) || relationship.skillIds.length === 0) errors.push("At least one supported skill is required.");
  for (const skillId of relationship.skillIds || []) if (!skillIds.has(skillId)) errors.push(`Unknown skill: ${skillId}`);
  if (!relationshipTypes.has(relationship.relationshipType)) errors.push(`Unsupported relationship type: ${relationship.relationshipType}`);
  if (!readinessLabels.has(relationship.validationStatus)) errors.push(`Unsupported validation status: ${relationship.validationStatus}`);
  if (!Array.isArray(relationship.supportedClaims) || relationship.supportedClaims.length === 0) errors.push("At least one supported claim is required.");
  return errors;
}

module.exports = {
  mapRecord,
  normalizeEvidenceType,
  relationshipType,
  skillIdsFor,
  systemsFor,
  validateMappedRelationship,
  validationStatus,
};
