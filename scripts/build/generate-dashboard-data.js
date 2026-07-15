const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const CLAIM_MAP = path.join(ROOT, "evidence-library", "projects", "on-prem-home-lab", "current-validated-state", "claim-map.csv");
const HASHES = path.join(ROOT, "evidence-library", "integrity", "evidence-hashes.json");
const EVIDENCE_CONFIG = path.join(ROOT, "scripts", "config", "evidence-pages.json");
const OUTPUT = path.join(ROOT, "assets", "data", "evidence-dashboard.json");
const CHECK = process.argv.includes("--check");
const VERBOSE = process.argv.includes("--verbose");
const TEXT_EXTENSIONS = new Set([".md", ".txt", ".csv", ".json", ".yaml", ".yml", ".ps1", ".svg", ".html", ".xml", ".gitkeep"]);

function resolveRepositoryPath(relativePath) {
  const normalized = String(relativePath).replace(/[\\/]+/g, path.sep);
  const resolved = path.resolve(ROOT, normalized);
  const rootPrefix = `${ROOT}${path.sep}`;

  if (resolved !== ROOT && !resolved.startsWith(rootPrefix)) {
    throw new Error(`Repository path escapes the project root: ${relativePath}`);
  }

  return resolved;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') { value += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) { row.push(value); value = ""; }
    else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value); value = "";
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
    } else value += character;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const headers = rows.shift();
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""])));
}

function normalizedHash(filePath) {
  const extension = path.basename(filePath).toLowerCase() === ".gitkeep" ? ".gitkeep" : path.extname(filePath).toLowerCase();
  const raw = fs.readFileSync(filePath);
  let text = raw.toString("utf8");
  if (raw[0] === 0xff && raw[1] === 0xfe) text = raw.subarray(2).toString("utf16le");
  else if (raw[0] === 0xfe && raw[1] === 0xff) {
    const swapped = Buffer.from(raw.subarray(2));
    swapped.swap16();
    text = swapped.toString("utf16le");
  }
  const bytes = TEXT_EXTENSIONS.has(extension)
    ? Buffer.from(text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n"), "utf8")
    : raw;
  return crypto.createHash("sha256").update(bytes).digest("hex").toUpperCase();
}

function buildData() {
  const claims = parseCsv(fs.readFileSync(CLAIM_MAP, "utf8"));
  const classifications = {};
  claims.forEach((row) => { classifications[row.classification] = (classifications[row.classification] || 0) + 1; });
  const direct = claims.filter((row) => row.supporting_artifact.includes("/direct-evidence/")).length;
  const boundaries = claims.filter((row) => /limitation/i.test(row.classification)).length;

  const hashRecords = JSON.parse(fs.readFileSync(HASHES, "utf8"));
  let hashVerified = 0;
  let hashFailed = 0;
  hashRecords.forEach((entry) => {
    const filePath = resolveRepositoryPath(entry.path);
    if (fs.existsSync(filePath) && normalizedHash(filePath) === String(entry.sha256).toUpperCase()) hashVerified += 1;
    else { hashFailed += 1; if (VERBOSE) console.error(`Hash check failed: ${entry.path}`); }
  });

  const generated = JSON.parse(fs.readFileSync(EVIDENCE_CONFIG, "utf8"));
  const generatedConsistent = generated.filter((entry) => {
    const output = resolveRepositoryPath(entry.output);
    return fs.existsSync(output) && fs.readFileSync(output, "utf8").includes("GENERATED FILE — DO NOT EDIT DIRECTLY.");
  }).length;

  return {
    claims: { total: claims.length, direct, boundaries, classifications },
    integrity: { verified: hashVerified, failed: hashFailed },
    generatedPages: { configured: generated.length, consistent: generatedConsistent },
    sources: {
      claimMap: "evidence-library/projects/on-prem-home-lab/current-validated-state/claim-map.csv",
      hashes: "evidence-library/integrity/evidence-hashes.json",
      generatedPageConfig: "scripts/config/evidence-pages.json"
    }
  };
}

const expected = `${JSON.stringify(buildData(), null, 2)}\n`;
if (CHECK) {
  const existing = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, "utf8").replace(/\r\n/g, "\n") : "";
  if (existing !== expected) {
    console.error("Dashboard data is missing or stale.");
    process.exitCode = 1;
  } else console.log("Dashboard data is consistent with repository sources.");
} else {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, expected, "utf8");
  console.log("Dashboard data generated from repository sources.");
}
