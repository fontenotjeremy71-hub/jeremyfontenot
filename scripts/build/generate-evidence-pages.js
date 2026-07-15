const fs = require("node:fs");
const path = require("node:path");
const MarkdownIt = require("markdown-it");

const REPOSITORY_ROOT = path.resolve(__dirname, "..", "..");
const CONFIG_PATH = path.join(REPOSITORY_ROOT, "scripts", "config", "evidence-pages.json");
const GENERATOR_PATH = "scripts/build/generate-evidence-pages.js";
const SITE_ORIGIN = "https://jeremyfontenot.online";
const GENERATED_MARKER = "GENERATED FILE — DO NOT EDIT DIRECTLY.";
const CHECK_MODE = process.argv.includes("--check");

if (process.argv.some((argument) => argument.startsWith("--") && argument !== "--check")) {
  throw new Error("Unknown option. Supported option: --check");
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function pathKey(value) {
  const normalized = path.normalize(value);
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function resolveInsideRepository(relativePath, label) {
  if (typeof relativePath !== "string" || relativePath.trim() === "") {
    throw new Error(`${label} must be a non-empty repository-relative path.`);
  }

  const absolutePath = path.resolve(REPOSITORY_ROOT, relativePath);
  const repositoryRelative = path.relative(REPOSITORY_ROOT, absolutePath);
  if (repositoryRelative === "" || repositoryRelative.startsWith("..") || path.isAbsolute(repositoryRelative)) {
    throw new Error(`${label} escapes the repository: ${relativePath}`);
  }

  return absolutePath;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function canonicalUrl(outputPath) {
  return `${SITE_ORIGIN}/${toPosix(outputPath).split("/").map(encodeURIComponent).join("/")}`;
}

function splitUrlSuffix(url) {
  const queryIndex = url.indexOf("?");
  const fragmentIndex = url.indexOf("#");
  const indexes = [queryIndex, fragmentIndex].filter((index) => index >= 0);
  const splitIndex = indexes.length > 0 ? Math.min(...indexes) : -1;
  return splitIndex >= 0
    ? { pathPart: url.slice(0, splitIndex), suffix: url.slice(splitIndex) }
    : { pathPart: url, suffix: "" };
}

function validateSafeUrl(url, context) {
  const value = String(url).trim();
  if (value === "") {
    return value;
  }
  if (/^[\u0000-\u001f\u007f]/.test(value) || /^\/\//.test(value)) {
    throw new Error(`Unsafe URL in ${context}: ${url}`);
  }
  const protocolMatch = value.match(/^([a-z][a-z0-9+.-]*):/i);
  if (protocolMatch && !["https", "http", "mailto", "tel"].includes(protocolMatch[1].toLowerCase())) {
    throw new Error(`Unsafe URL protocol in ${context}: ${url}`);
  }
  return value;
}

function sourceHeading(markdown) {
  const match = markdown.match(/^#\s+(.+?)\s*$/m);
  return match ? match[1].trim() : "";
}

function headingText(token) {
  if (!token || !Array.isArray(token.children)) {
    return token ? token.content : "";
  }
  return token.children
    .filter((child) => ["text", "code_inline"].includes(child.type))
    .map((child) => child.content)
    .join("");
}

function createSlugger() {
  const counts = new Map();
  return (value) => {
    const base = String(value)
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
    const count = (counts.get(base) || 0) + 1;
    counts.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };
}

function prepareEntries(rawConfig) {
  if (!Array.isArray(rawConfig) || rawConfig.length === 0) {
    throw new Error("Evidence page configuration must be a non-empty array.");
  }

  const sourceKeys = new Set();
  const outputKeys = new Set();
  const entries = rawConfig.map((entry, index) => {
    const requiredFields = ["source", "output", "title", "category", "parentLabel", "returnUrl", "returnLabel"];
    for (const field of requiredFields) {
      if (typeof entry[field] !== "string" || entry[field].trim() === "") {
        throw new Error(`Configuration entry ${index + 1} is missing ${field}.`);
      }
    }

    const sourceAbsolute = resolveInsideRepository(entry.source, `Source for entry ${index + 1}`);
    const outputAbsolute = resolveInsideRepository(entry.output, `Output for entry ${index + 1}`);
    if (path.extname(sourceAbsolute).toLowerCase() !== ".md") {
      throw new Error(`Configured source must be Markdown: ${entry.source}`);
    }
    if (path.extname(outputAbsolute).toLowerCase() !== ".html") {
      throw new Error(`Configured output must be HTML: ${entry.output}`);
    }
    if (!fs.existsSync(sourceAbsolute)) {
      throw new Error(`Configured source is missing: ${entry.source}`);
    }

    const sourceKey = pathKey(sourceAbsolute);
    const outputKey = pathKey(outputAbsolute);
    if (sourceKeys.has(sourceKey)) {
      throw new Error(`Duplicate source configured: ${entry.source}`);
    }
    if (outputKeys.has(outputKey)) {
      throw new Error(`Duplicate output configured: ${entry.output}`);
    }
    sourceKeys.add(sourceKey);
    outputKeys.add(outputKey);

    const normalizedEntry = {
      ...entry,
      source: toPosix(path.relative(REPOSITORY_ROOT, sourceAbsolute)),
      output: toPosix(path.relative(REPOSITORY_ROOT, outputAbsolute)),
      sourceAbsolute,
      outputAbsolute,
    };
    validateSafeUrl(normalizedEntry.returnUrl, `return URL for ${entry.source}`);
    return normalizedEntry;
  });

  return entries;
}

function transformMarkdownUrl(url, entry, sourceToOutput) {
  const safeUrl = validateSafeUrl(url, entry.source);
  if (
    safeUrl === "" ||
    safeUrl.startsWith("#") ||
    safeUrl.startsWith("/") ||
    /^[a-z][a-z0-9+.-]*:/i.test(safeUrl)
  ) {
    return safeUrl;
  }

  const { pathPart, suffix } = splitUrlSuffix(safeUrl);
  if (pathPart === "") {
    return safeUrl;
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathPart);
  } catch {
    throw new Error(`Invalid URL encoding in ${entry.source}: ${url}`);
  }

  const resolvedTarget = path.resolve(path.dirname(entry.sourceAbsolute), decodedPath);
  const repositoryRelative = path.relative(REPOSITORY_ROOT, resolvedTarget);
  if (repositoryRelative.startsWith("..") || path.isAbsolute(repositoryRelative)) {
    throw new Error(`Relative link escapes the repository in ${entry.source}: ${url}`);
  }

  const generatedTarget = sourceToOutput.get(pathKey(resolvedTarget));
  if (!generatedTarget) {
    return safeUrl;
  }

  let relativeOutput = toPosix(path.relative(path.dirname(entry.outputAbsolute), generatedTarget));
  if (!relativeOutput.startsWith(".")) {
    relativeOutput = `./${relativeOutput}`;
  }
  return `${relativeOutput}${suffix}`;
}

function renderMarkdown(markdown, entry, sourceToOutput) {
  const md = new MarkdownIt({
    html: false,
    linkify: false,
    typographer: false,
    breaks: false,
  });

  const defaultLinkOpen = md.renderer.rules.link_open || ((tokens, index, options, environment, renderer) => renderer.renderToken(tokens, index, options));
  const defaultImage = md.renderer.rules.image || ((tokens, index, options, environment, renderer) => renderer.renderToken(tokens, index, options));

  md.renderer.rules.link_open = (tokens, index, options, environment, renderer) => {
    const hrefIndex = tokens[index].attrIndex("href");
    if (hrefIndex >= 0) {
      const transformed = transformMarkdownUrl(tokens[index].attrs[hrefIndex][1], entry, sourceToOutput);
      tokens[index].attrs[hrefIndex][1] = transformed;
      if (/^https?:/i.test(transformed)) {
        tokens[index].attrSet("rel", "noopener noreferrer");
      }
    }
    return defaultLinkOpen(tokens, index, options, environment, renderer);
  };

  md.renderer.rules.image = (tokens, index, options, environment, renderer) => {
    const sourceIndex = tokens[index].attrIndex("src");
    if (sourceIndex >= 0) {
      tokens[index].attrs[sourceIndex][1] = transformMarkdownUrl(tokens[index].attrs[sourceIndex][1], entry, sourceToOutput);
    }
    tokens[index].attrSet("loading", "lazy");
    tokens[index].attrSet("decoding", "async");
    return defaultImage(tokens, index, options, environment, renderer);
  };

  md.renderer.rules.table_open = () => '<div class="evidence-table-scroll" role="region" aria-label="Scrollable evidence table" tabindex="0">\n<table>\n';
  md.renderer.rules.table_close = () => "</table>\n</div>\n";

  let tokens = md.parse(markdown, { entry });
  if (
    tokens.length >= 3 &&
    tokens[0].type === "heading_open" &&
    tokens[0].tag === "h1" &&
    tokens[1].type === "inline" &&
    headingText(tokens[1]) === (entry.sourceTitle || entry.title) &&
    tokens[2].type === "heading_close"
  ) {
    tokens = tokens.slice(3);
  }

  const slug = createSlugger();
  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index].type === "heading_open") {
      const textToken = tokens[index + 1];
      tokens[index].attrSet("id", slug(headingText(textToken)));
    }
  }

  return md.renderer.render(tokens, md.options, { entry });
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function generatedComment(entry) {
  return `<!--\n  ${GENERATED_MARKER}\n  Source: ${entry.source}\n  Generator: ${GENERATOR_PATH}\n-->`;
}

function renderPage(entry, renderedMarkdown) {
  const canonical = canonicalUrl(entry.output);
  const description = `Generated HTML presentation of the Markdown evidence record: ${entry.title}.`;
  const sourceFilename = path.basename(entry.source);
  const sourceHref = `./${sourceFilename}`;
  const pageTitle = `${entry.title} | Jeremy Fontenot`;
  const breadcrumbJson = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_ORIGIN}/` },
      { "@type": "ListItem", position: 2, name: entry.parentLabel, item: new URL(entry.returnUrl, SITE_ORIGIN).href },
      { "@type": "ListItem", position: 3, name: entry.title, item: canonical },
    ],
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: entry.title,
        description,
        url: canonical,
        author: { "@type": "Person", name: "Jeremy Fontenot", url: `${SITE_ORIGIN}/` },
      },
      breadcrumbJson,
    ],
  };

  return `${generatedComment(entry)}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#0f172a">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:site_name" content="Jeremy Fontenot">
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${SITE_ORIGIN}/assets/og/og-portfolio.png">
  <meta property="og:image:alt" content="IT support and infrastructure operations portfolio for Jeremy Fontenot">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${SITE_ORIGIN}/assets/og/og-portfolio.png">
  <link rel="icon" href="/assets/logos/favicon_64x64.png">
  <link rel="stylesheet" href="/assets/css/site.css">
  <link rel="stylesheet" href="/assets/css/evidence-document.css">
  <script src="/assets/js/site.js" defer></script>
  <script type="application/ld+json">${safeJson(jsonLd)}</script>
</head>
<body class="generated-evidence-page proof-page">
  <a class="skip-link" href="#evidence-content">Skip to evidence content</a>
  <header class="site-header">
    <nav class="nav" aria-label="Primary navigation">
      <a class="brand" href="/">
        <img src="/assets/logos/header_logo_88x88.png" alt="Jeremy Fontenot logo" width="44" height="44" decoding="async">
        <span>Jeremy Fontenot</span>
        <small>Support · systems · evidence</small>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu">Menu</button>
      <div class="nav-links" id="primary-menu"><a href="/">Home</a><a href="/projects.html">Projects</a><a href="/proof.html" aria-current="page">Proof</a><a href="/dashboard.html">Dashboard</a><a href="/resume.html">Resume</a><a href="/contact.html">Contact</a></div>
    </nav>
  </header>
  <main id="evidence-content" class="page evidence-page-shell" tabindex="-1">
    <nav class="evidence-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li><a href="${escapeHtml(entry.returnUrl)}">${escapeHtml(entry.parentLabel)}</a></li>
        <li aria-current="page">${escapeHtml(entry.title)}</li>
      </ol>
    </nav>
    <section class="evidence-introduction" aria-labelledby="evidence-title">
      <p class="eyebrow">${escapeHtml(entry.category)}</p>
      <h1 id="evidence-title">${escapeHtml(entry.title)}</h1>
      <p class="lead">This page renders a Markdown evidence record for accessible browser review. Inspect the method, captured output, result, scope, and limitations before using it to support a claim.</p>
      <dl class="evidence-metadata">
        <div><dt>Evidence category</dt><dd>${escapeHtml(entry.category)}</dd></div>
        <div><dt>Source record</dt><dd>Authoritative Markdown artifact</dd></div>
        <div><dt>Source format</dt><dd>Markdown</dd></div>
        <div><dt>Presentation format</dt><dd>Generated HTML</dd></div>
      </dl>
      <div class="actions evidence-actions">
        <a class="button primary" href="${escapeHtml(sourceHref)}">View source Markdown</a>
        <a class="button" href="${escapeHtml(entry.returnUrl)}">${escapeHtml(entry.returnLabel)}</a>
      </div>
    </section>
    <article class="evidence-document" aria-label="Rendered evidence document">
${renderedMarkdown.trimEnd()}
    </article>
    <aside class="source-integrity-notice" aria-label="Source relationship notice">
      <h2>Source relationship</h2>
      <p>The linked Markdown controls this rendered copy. Evidence strength depends on the commands, captured output, result, reproducibility, scope, and limitations in that record.</p>
      <div class="actions">
        <a class="button primary" href="${escapeHtml(sourceHref)}">View source Markdown</a>
        <a class="button" href="${escapeHtml(entry.returnUrl)}">${escapeHtml(entry.returnLabel)}</a>
      </div>
    </aside>
  </main>
  <footer class="site-footer compact-footer" aria-label="Site footer">
    <div class="compact-footer-grid">
      <div class="compact-footer-brand"><img src="/assets/logos/header_logo_88x88.png" alt="" width="46" height="46" decoding="async"><div><strong>Jeremy Fontenot</strong><p>Service Desk and IT Support professional advancing toward systems administration and infrastructure operations.</p></div></div>
      <nav class="compact-footer-links" aria-label="Footer navigation"><a href="/projects.html">Projects</a><a href="/proof.html">Proof</a><a href="/dashboard.html">Dashboard</a><a href="/resume.html">Resume</a><a href="/contact.html">Contact</a><a href="/sitemap.xml">Sitemap</a></nav>
      <div class="compact-footer-contact" aria-label="Professional contact links"><a href="mailto:jeremy.fontenot@jeremyfontenot.online">Email</a><a href="https://www.linkedin.com/in/jeremy-fontenot/">LinkedIn</a><a href="https://github.com/fontenotjeremy71-hub">GitHub</a></div>
    </div>
    <p class="credibility">This generated page preserves the source record's wording and limitations; it does not expand the source claim.</p>
    <p class="footer-meta">Jeremy Fontenot · Abbeville, Louisiana · Central Time</p>
  </footer>
</body>
</html>
`;
}

function assertGeneratedPage(entry, html) {
  const failures = [];
  if (!html.includes(generatedComment(entry))) failures.push("generated-file comment");
  if (!html.includes(`<link rel="canonical" href="${canonicalUrl(entry.output)}">`)) failures.push("self-referencing canonical");
  if (!html.includes(`href="./${path.basename(entry.source)}"`)) failures.push("source Markdown link");
  if ((html.match(/<h1\b/g) || []).length !== 1) failures.push("exactly one h1");
  if (/(?:javascript|vbscript|data):/i.test(html)) failures.push("unsafe URL protocol");
  if (/<(?:iframe|object|embed|form)\b/i.test(html)) failures.push("unsafe embedded element");
  if (/\son[a-z]+\s*=/i.test(html)) failures.push("inline event handler");
  if (/[A-Za-z]:\\(?:Users|home)\\/i.test(html)) failures.push("local absolute path");

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) failures.push(`duplicate IDs (${[...new Set(duplicateIds)].join(", ")})`);

  if (failures.length > 0) {
    throw new Error(`Generated validation failed for ${entry.output}: ${failures.join(", ")}`);
  }
}

function main() {
  const rawConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const entries = prepareEntries(rawConfig);
  const sourceToOutput = new Map(entries.map((entry) => [pathKey(entry.sourceAbsolute), entry.outputAbsolute]));
  let staleCount = 0;

  for (const entry of entries) {
    const markdown = fs.readFileSync(entry.sourceAbsolute, "utf8");
    const detectedTitle = sourceHeading(markdown);
    if (detectedTitle === "") {
      throw new Error(`A required level-one title could not be determined: ${entry.source}`);
    }
    if (detectedTitle !== (entry.sourceTitle || entry.title)) {
      throw new Error(`Configured title does not match the Markdown title: ${entry.source}`);
    }

    const existing = fs.existsSync(entry.outputAbsolute)
      ? fs.readFileSync(entry.outputAbsolute, "utf8")
      : null;
    if (existing !== null && (!existing.includes(GENERATED_MARKER) || !existing.includes(`Source: ${entry.source}`))) {
      throw new Error(`Output collides with a non-generated file: ${entry.output}`);
    }

    const renderedMarkdown = renderMarkdown(markdown, entry, sourceToOutput);
    const expected = renderPage(entry, renderedMarkdown).replace(/\r\n/g, "\n");
    assertGeneratedPage(entry, expected);

    if (CHECK_MODE) {
      if (existing === expected) {
        console.log(`Evidence page current: ${entry.source} -> ${entry.output}`);
      } else {
        staleCount += 1;
        console.error(`Evidence page stale: ${entry.source} -> ${entry.output}`);
      }
      continue;
    }

    fs.mkdirSync(path.dirname(entry.outputAbsolute), { recursive: true });
    fs.writeFileSync(entry.outputAbsolute, expected, "utf8");
    console.log(`Evidence page generated: ${entry.source} -> ${entry.output}`);
  }

  if (CHECK_MODE && staleCount > 0) {
    console.error(`${staleCount} generated evidence page(s) are missing or stale.`);
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
