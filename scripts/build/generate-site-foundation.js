#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const repositoryRoot = path.resolve(__dirname, '..', '..');
const checkMode = process.argv.includes('--check');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8'));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function navigation(currentId) {
  const links = [
    ['home', 'Home', '/'],
    ['readiness', 'Readiness', '/systems-administration.html'],
    ['systems-skills', 'Skills', '/systems-skills/'],
    ['microsoft-365', 'Microsoft 365', '/microsoft-365/'],
    ['home-lab', 'Home Lab', '/home-lab/'],
    ['evidence', 'Evidence', '/evidence/'],
    ['resume', 'Resume', '/resume.html'],
    ['contact', 'Contact', '/contact.html']
  ];
  return links.map(([id, label, href]) => {
    const current = id === currentId ? ' aria-current="page"' : '';
    return `<a href="${href}"${current}>${escapeHtml(label)}</a>`;
  }).join('');
}

function footer() {
  return `
  <footer class="site-footer">
    <div class="compact-footer-grid">
      <div class="compact-footer-brand">
        <img src="/assets/logos/header_logo_88x88.png" alt="Jeremy Fontenot logo" width="44" height="44" loading="lazy" decoding="async">
        <div><strong>Jeremy Fontenot</strong><p>Experienced IT support professional with demonstrated junior systems administration capability.</p></div>
      </div>
      <nav class="compact-footer-links" aria-label="Foundation routes"><a href="/systems-skills/">Skills</a><a href="/microsoft-365/">Microsoft 365</a><a href="/home-lab/">Home Lab</a><a href="/evidence/">Evidence</a><a href="/sitemap.xml">Sitemap</a></nav>
      <div class="compact-footer-contact"><a href="/resume.html">Resume</a><a href="/contact.html">Contact</a></div>
    </div>
    <p class="credibility">Professional experience and personal-lab evidence remain separate. Scope and limitations stay visible.</p>
    <p class="footer-meta">Jeremy Fontenot · Abbeville, Louisiana · Central Time</p>
  </footer>`;
}

function actionMarkup(actions) {
  return actions.map((action) => {
    const classes = ['button'];
    if (action.style === 'primary') classes.push('primary');
    if (action.style === 'text') classes.push('text-button');
    return `<a class="${classes.join(' ')}" href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>`;
  }).join('');
}

function cardMarkup(card) {
  return `<article class="capability-card"><span class="tile-code">${escapeHtml(card.code)}</span><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.text)}</p><div class="proof-links"><a href="${escapeHtml(card.href)}">${escapeHtml(card.linkLabel)}</a></div></article>`;
}

function sectionMarkup(section) {
  return `
    <section class="section" id="${escapeHtml(section.id)}" aria-labelledby="${escapeHtml(section.id)}-title">
      <div class="section-head reveal"><p class="eyebrow">${escapeHtml(section.eyebrow)}</p><h2 id="${escapeHtml(section.id)}-title">${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.summary)}</p></div>
      <div class="capability-grid reveal">${section.cards.map(cardMarkup).join('')}</div>
    </section>`;
}

function pageShell({id, route, title, description, eyebrow, headline, summary, actions, jumpLinks, bodySections, scopeHeading, scopeText}) {
  const canonical = `https://jeremyfontenot.online${route}`;
  const jump = jumpLinks.length > 0
    ? `<nav class="section-jump-nav page-shell" aria-label="Page sections">${jumpLinks.map((item) => `<a href="#${escapeHtml(item.id)}">${escapeHtml(item.label)}</a>`).join('')}</nav>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#0f172a">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <link rel="canonical" href="${canonical}">
  <meta property="og:site_name" content="Jeremy Fontenot">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://jeremyfontenot.online/assets/og/og-portfolio.png">
  <meta property="og:image:alt" content="Jeremy Fontenot systems administration portfolio">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="https://jeremyfontenot.online/assets/og/og-portfolio.png">
  <link rel="icon" href="/assets/logos/favicon_64x64.png">
  <link rel="manifest" href="/assets/site.webmanifest">
  <link rel="stylesheet" href="/assets/css/site.css">
  <script src="/assets/js/site.js" defer></script>
  <script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage',name:title.replace(' | Jeremy Fontenot',''),description,url:canonical})}</script>
</head>
<body class="foundation-page ${escapeHtml(id)}-page">
  <!-- GENERATED FILE — DO NOT EDIT DIRECTLY. -->
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <nav class="nav" aria-label="Primary navigation">
      <a class="brand" href="/"><img src="/assets/logos/header_logo_88x88.png" alt="Jeremy Fontenot logo" width="44" height="44" decoding="async"><span>Jeremy Fontenot</span><small>Support · systems · evidence</small></a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu">Menu</button>
      <div class="nav-links" id="primary-menu">${navigation(id)}</div>
    </nav>
  </header>
  <main id="main">
    <section class="page page-hero" aria-labelledby="page-title">
      <div class="page-hero-grid">
        <div class="reveal is-visible"><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1 id="page-title">${escapeHtml(headline)}</h1><p class="lead">${escapeHtml(summary)}</p><div class="actions">${actionMarkup(actions)}</div></div>
        <aside class="operator-map reveal is-visible" aria-label="Architecture summary">
          <div class="operator-map-head"><span>Foundation route</span><span>Evidence bounded</span></div>
          <div class="operator-nodes">
            <a href="/systems-skills/"><b>01 / SKILLS</b><span>Responsibilities</span><em>Work a junior administrator can perform</em></a>
            <a href="/microsoft-365/"><b>02 / CLOUD</b><span>Microsoft 365</span><em>Personal-tenant administration evidence</em></a>
            <a href="/home-lab/"><b>03 / SYSTEMS</b><span>Home Lab</span><em>Infrastructure administration evidence</em></a>
            <a href="/evidence/"><b>04 / PROOF</b><span>Evidence</span><em>Provenance, scope, and limitations</em></a>
          </div>
        </aside>
      </div>
    </section>
    ${jump}
    ${bodySections}
    <section class="section" id="scope" aria-labelledby="scope-title"><div class="scope-note-card reveal"><p class="eyebrow">Scope</p><h2 id="scope-title">${escapeHtml(scopeHeading)}</h2><p>${escapeHtml(scopeText)}</p><div class="inline-actions"><a href="/systems-administration.html#boundaries">Review readiness boundaries</a><a href="/proof.html">Open the proof index</a></div></div></section>
  </main>
  ${footer()}
</body>
</html>
`;
}

function renderLandingPage(page) {
  const jumpLinks = page.sections.map((section) => ({id: section.id, label: section.eyebrow}));
  jumpLinks.push({id: 'scope', label: 'Scope'});
  return pageShell({
    id: page.id,
    route: page.route,
    title: page.title,
    description: page.description,
    eyebrow: page.eyebrow,
    headline: page.headline,
    summary: page.summary,
    actions: page.primaryActions,
    jumpLinks,
    bodySections: page.sections.map(sectionMarkup).join(''),
    scopeHeading: page.scopeHeading,
    scopeText: page.scopeText
  });
}

function technologyCard(technology) {
  return `<article class="capability-card"><span class="status-label ${escapeHtml(technology.status)}">${escapeHtml(technology.statusLabel)}</span><h3>${escapeHtml(technology.label)}</h3><dl class="claim-details"><div><dt>Skill</dt><dd>${escapeHtml(technology.skill)}</dd></div><div><dt>Task</dt><dd>${escapeHtml(technology.task)}</dd></div><div><dt>Result</dt><dd>${escapeHtml(technology.result)}</dd></div><div><dt>Scope</dt><dd>${escapeHtml(technology.scope)}</dd></div><div><dt>Limitations</dt><dd>${escapeHtml(technology.limitations)}</dd></div></dl><div class="proof-links"><a href="${escapeHtml(technology.proof.href)}">${escapeHtml(technology.proof.label)}</a></div></article>`;
}

function renderTechnologyPage(taxonomy) {
  const id = taxonomy.platform;
  const title = `${taxonomy.label} Capability | Jeremy Fontenot`;
  const headline = taxonomy.platform === 'microsoft-365'
    ? 'Microsoft 365 administration organized by technology and proof.'
    : 'Home Lab administration organized by technology and proof.';
  const description = taxonomy.summary;
  const jumpLinks = taxonomy.technologies.map((technology) => ({id: technology.slug, label: technology.label}));
  jumpLinks.push({id: 'scope', label: 'Scope'});
  const bodySections = `
    <section class="section" id="technology-map" aria-labelledby="technology-map-title">
      <div class="section-head reveal"><p class="eyebrow">Technology map</p><h2 id="technology-map-title">Skill, task, result, proof, scope, and limitations.</h2><p>Each technology record follows the same presentation contract so later migration phases can add evidence without redesigning the site.</p></div>
      <div class="capability-grid reveal">${taxonomy.technologies.map((technology) => `<div id="${escapeHtml(technology.slug)}">${technologyCard(technology)}</div>`).join('')}</div>
    </section>`;
  return pageShell({
    id,
    route: taxonomy.route,
    title,
    description,
    eyebrow: `${taxonomy.label} capability`,
    headline,
    summary: taxonomy.summary,
    actions: [
      {label: taxonomy.platform === 'microsoft-365' ? 'Open Microsoft 365 catalog' : 'Open Home Lab catalog', href: taxonomy.platform === 'microsoft-365' ? '/microsoft-365/evidence-catalog.html' : '/home-lab/evidence-catalog.html', style: 'primary'},
      {label: 'Open job readiness', href: '/systems-administration.html', style: 'default'},
      {label: 'Inspect evidence', href: '/evidence/', style: 'text'}
    ],
    jumpLinks,
    bodySections,
    scopeHeading: taxonomy.platform === 'microsoft-365' ? 'Personal-tenant capability with explicit boundaries.' : 'Personal infrastructure capability with explicit boundaries.',
    scopeText: taxonomy.platform === 'microsoft-365'
      ? 'The evidence supports personal-tenant administration and support capability. It does not claim client, production, or enterprise-scale tenant ownership.'
      : 'The evidence supports personally operated nonproduction infrastructure work. It does not claim employer systems, enterprise scale, production availability, or formal recovery assurance.'
  });
}

const landingPages = readJson('content/site/landing-pages.json').pages;
const taxonomies = [
  readJson('content/microsoft-365/technologies.json'),
  readJson('content/home-lab/technologies.json')
];

const outputs = new Map();
for (const page of landingPages) outputs.set(page.outputPath, renderLandingPage(page));
for (const taxonomy of taxonomies) outputs.set(`${taxonomy.platform}/index.html`, renderTechnologyPage(taxonomy));

function sha256(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

let failed = false;
if (checkMode) {
  const manifestPath = path.join(repositoryRoot, 'content/site/generated-foundation-hashes.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const expectedPaths = [...outputs.keys()].sort();
  const manifestPaths = Object.keys(manifest.files || {}).sort();

  if (JSON.stringify(expectedPaths) !== JSON.stringify(manifestPaths)) {
    console.error('Generated foundation hash manifest does not contain the expected output paths.');
    failed = true;
  }

  for (const [relativePath, expected] of outputs) {
    const expectedHash = sha256(expected);
    if (manifest.files?.[relativePath] !== expectedHash) {
      console.error(`Generated foundation hash drift: ${relativePath}`);
      failed = true;
    }
    const absolutePath = path.join(repositoryRoot, relativePath);
    if (fs.existsSync(absolutePath) && fs.readFileSync(absolutePath, 'utf8') !== expected) {
      console.error(`Generated page content drift: ${relativePath}`);
      failed = true;
    }
  }
} else {
  for (const [relativePath, expected] of outputs) {
    const absolutePath = path.join(repositoryRoot, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), {recursive: true});
    fs.writeFileSync(absolutePath, expected, 'utf8');
    console.log(`Generated ${relativePath}`);
  }
}

if (failed) process.exit(1);
if (checkMode) console.log(`Site foundation source hashes are current (${outputs.size} pages).`);
