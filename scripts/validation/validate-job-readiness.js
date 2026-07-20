"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const visibleText = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&[a-z0-9#]+;/gi, " ")
  .replace(/\s+/g, " ")
  .trim();

const home = read("index.html");
const readiness = read("systems-administration.html");
const sitemap = read("sitemap.xml");
const homeText = visibleText(home);
const readinessText = visibleText(readiness);

const failures = [];
const requireMatch = (value, pattern, message) => {
  if (!pattern.test(value)) failures.push(message);
};

requireMatch(homeText, /experienced IT support professional/i, "Homepage must identify experienced IT support.");
requireMatch(homeText, /junior systems administration capability/i, "Homepage must state junior systems administration capability.");
requireMatch(home, /href=["']\.\/systems-administration\.html["'][^>]*>Readiness</i, "Homepage primary navigation must link to the readiness page.");
requireMatch(readiness, /<h1[^>]*>[\s\S]*Experienced support foundation[\s\S]*Demonstrated systems capability/i, "Readiness page must lead with the approved positioning.");
requireMatch(readinessText, /What I can contribute now/i, "Readiness page must include practical contribution tasks.");
requireMatch(readinessText, /Junior Systems Administrator/i, "Readiness page must include Junior Systems Administrator.");
requireMatch(readinessText, /Infrastructure Support Technician/i, "Readiness page must include Infrastructure Support Technician.");
requireMatch(readinessText, /Systems Support Specialist/i, "Readiness page must include Systems Support Specialist.");
requireMatch(readinessText, /Microsoft 365 Support Administrator/i, "Readiness page must include Microsoft 365 Support Administrator.");
requireMatch(readinessText, /IT Operations Technician/i, "Readiness page must include IT Operations Technician.");
requireMatch(readinessText, /Windows Server and Active Directory/i, "Readiness page must include Windows Server and Active Directory capability.");
requireMatch(readinessText, /Microsoft 365 and Entra ID/i, "Readiness page must include Microsoft 365 and Entra capability.");
requireMatch(readinessText, /Proxmox and backup operations/i, "Readiness page must include Proxmox and backup capability.");
requireMatch(readinessText, /Linux administration/i, "Readiness page must include Linux administration.");
requireMatch(readinessText, /PowerShell automation/i, "Readiness page must include PowerShell automation.");
requireMatch(readinessText, /Readiness matrix/i, "Readiness page must include a readiness matrix.");
requireMatch(readinessText, /Professionally applied/i, "Readiness matrix must include professionally applied work.");
requireMatch(readinessText, /Demonstrated in lab/i, "Readiness matrix must include demonstrated-in-lab work.");
requireMatch(readinessText, /Validated through testing/i, "Readiness matrix must include validated-through-testing work.");
requireMatch(readinessText, /DNS, DHCP, and Group Policy/i, "Readiness matrix must explicitly cover DNS, DHCP, and Group Policy.");
requireMatch(readinessText, /Troubleshoot and document RCA/i, "Readiness matrix must explicitly cover troubleshooting and RCA.");
requireMatch(readinessText, /Escalate with evidence/i, "Readiness matrix must explicitly cover evidence-based escalation.");
requireMatch(readiness, /href=["']\.\/systems-skills\/evidence-map\.html/i, "Readiness page must link to the generated evidence-to-skill map.");
requireMatch(readiness, /href=["']\.\/evidence\/claim-map\.html/i, "Readiness page must link to the reciprocal claim map.");
requireMatch(readinessText, /Professional and lab separation/i, "Readiness page must distinguish professional and lab evidence.");
requireMatch(sitemap, /https:\/\/jeremyfontenot\.online\/systems-administration\.html/, "Sitemap must include the readiness page.");

const forbidden = /\b(aspiring|hoping to transition|readiness percentage)\b/i;
if (forbidden.test(homeText) || forbidden.test(readinessText)) {
  failures.push("Recruiter-facing readiness content contains prohibited weak or arbitrary positioning.");
}

if (failures.length > 0) {
  console.error("Job readiness presentation validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Job readiness presentation validation passed.");
