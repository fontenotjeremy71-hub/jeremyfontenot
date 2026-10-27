#!/usr/bin/env node
'use strict';
// Owner-supplied presentation input; evidence sources remain at their original paths.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const chunks = stem => fs.readdirSync(path.join(root, 'content/site/preview')).filter(f => f.startsWith(stem + '-') && f.endsWith('.json')).sort().map(f => JSON.parse(read('content/site/preview/' + f)));
const pages = Object.assign({}, ...chunks('pages'));
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const routes = {home:'index.html', 'home-lab':'home-lab-overview.html', evidence:'evidence-browser.html', skills:'skills.html', architecture:'architecture.html', automation:'automation.html', troubleshooting:'troubleshooting.html', 'additional-labs':'additional-labs.html', documentation:'documentation.html', gallery:'gallery.html', 'site-map':'site-map.html'};
for (const key of Object.keys(pages)) {
  if (routes[key]) continue;
  if (key.startsWith('projects/')) routes[key] = key.slice(9) + '.html';
  else if (key.includes('/')) routes[key] = 'portfolio-documents/' + key.replaceAll('/', '-') + '.html';
  else routes[key] = key + '.html';
}
delete routes['review-report']; // Preview QA notes are build inputs, not public portfolio claims.
const href = key => '/' + routes[key];
const projectEvidence = {
  'windows-laps-gpo':'/projects/windows-laps-gpo/evidence/',
  'entra-cloud-sync':'/projects/entra-cloud-sync/evidence/',
  'on-prem-home-lab':'/evidence-library/projects/on-prem-home-lab/current-validated-state/README.html',
  'windows-admin-center-lab':'/windows-admin-center-lab.html#validation',
  'scvmm-2022':'/evidence-library/projects/on-prem-home-lab/scvmm-2022/',
  'azure-arc-hybrid-management':'/evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/',
  'app01-storage-expansion':'/app01-storage-expansion.html#validation',
  'cross-platform-administration':'/home-lab-operations-proof.html',
  'servicenow-request-fulfillment':'/proof.html#servicenow-proof',
  'm365-messaging-security':'/proof.html#m365-messaging-security-proof',
  'windows-autopilot-intune':'/projects/windows-autopilot-intune/evidence/',
  'macos-abm-intune-runbook':'/projects/macos-abm-intune-runbook/evidence/',
  'm365-graph-administration-lab':'/proof.html#m365-graph-admin-proof'
};
function createHumanSiteMap(){
  const navKeys=['home','about','experience','skills','certifications','projects','home-lab','evidence','resume','contact'];
  const isProject=k=>k.startsWith('projects/')||(routes[k]&&/^(windows-laps-gpo|entra-cloud-sync|on-prem-home-lab|windows-admin-center-lab|scvmm-2022|azure-arc-hybrid-management|app01-storage-expansion|cross-platform-administration|servicenow-request-fulfillment|m365-messaging-security|windows-autopilot-intune|macos-abm-intune-runbook|m365-graph-administration-lab)\.html$/.test(routes[k]));
  const groups=[
    ['Main navigation',navKeys.filter(k=>routes[k])],
    ['Projects and case studies',Object.keys(routes).filter(k=>!navKeys.includes(k)&&isProject(k))],
    ['Technical topics and evidence',Object.keys(routes).filter(k=>!navKeys.includes(k)&&!isProject(k)&&!k.includes('/')&&k!=='site-map')],
    ['Technical source documents',Object.keys(routes).filter(k=>k.includes('/')&&!isProject(k))]
  ];
  const present=new Set(Object.values(routes).map(x=>'/'+x));
  present.add('/');
  const existing=read('sitemap.xml');
  const extras=[...new Set([...existing.matchAll(/<loc>https:\/\/jeremyfontenot\.online(\/[^<]*)<\/loc>/g)].map(m=>m[1]))]
    .filter(x=>!present.has(x)&&!present.has(x.replace(/\/$/,'/index.html'))&&!/\.(?:xml|json|txt)$/i.test(x));
  const titleOf=x=>x.replace(/^\//,'').replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/[\/_-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase())||'Home';
  const section=(title,links)=>'<section class="site-map-group"><h2>'+escape(title)+'</h2><div class="doc-grid">'+links.join('')+'</div></section>';
  const blocks=groups.map(([title,keys])=>section(title,keys.map(k=>'<a href="'+href(k)+'">'+escape(pages[k]?.title||k)+'</a>')));
  if(extras.length)blocks.push(section('Additional published resources',extras.sort().map(u=>'<a href="'+escape(u)+'">'+escape(titleOf(u))+'</a>')));
  return '<section class="page-heading"><p class="eyebrow">Portfolio navigation</p><h1>Site Map</h1><p class="lead">Browse the main portfolio pages, projects, supporting technical documentation, and additional published resources. This directory is regenerated from the site routes and XML sitemap during each build.</p></section><div class="site-map-directory">'+blocks.join('')+'</div>';
}
function connectProjectEvidence(html) {
  return html.replace(/<article\b(?=[^>]*\bdata-project\b)[^>]*>[\s\S]*?<\/article>/g, card => {
    for (const [slug,target] of Object.entries(projectEvidence)) {
      if (card.includes(`href="/${slug}.html"`)) return card.replace('href="/evidence-browser.html"', `href="${target}"`);
    }
    return card;
  });
}
function convert(html) {
  return html.replace(/<button(?![^>]*\btype=)/g, '<button type="button"').replace(/<a\b[^>]*>/g, tag => {
    const route = tag.match(/data-route="([^"]+)"/);
    const anchor = tag.match(/data-anchor="([^"]+)"/);
    if (route && routes[route[1]]) {
      tag = tag.replace(/href="[^"]*"/, `href="${href(route[1])}${anchor ? '#' + anchor[1] : ''}"`);
    } else if (anchor) tag = tag.replace(/href="[^"]*"/, `href="#${anchor[1]}"`);
    else if (route) return tag.replace(/href="[^"]*"/, 'href="/site-map.html"').replace(/ data-route="[^"]*"/, '');
    if (/href="(?:https:\/\/jeremyfontenot\.online\/|\/|#)/.test(tag)) tag = tag.replace(/ target="_blank"/, '');
    return tag.replace(/ data-route="[^"]*"/, '').replace(/ data-anchor="[^"]*"/, '');
  }).replace(/(?:href|src)="data:application\/pdf;base64,[^"]+"/g, m => m.split('=')[0] + '="/assets/resume/jeremy-fontenot-resume.pdf"')
    .replace(/href="data:application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document;base64,[^"]+"/g, 'href="/assets/resume/jeremy-fontenot-resume.docx"');
}
const nav = [['home','Home'],['about','About'],['experience','Experience'],['skills','Skills'],['certifications','Certifications'],['projects','Projects'],['home-lab','Home Lab'],['evidence','Evidence'],['resume','Resume'],['contact','Contact']];
function shell(key, page) {
  if(key==='site-map')page={...page,description:'Navigation directory of published portfolio pages, project case studies, technical documents, and evidence resources.'};
  const canonical = 'https://jeremyfontenot.online/' + (key === 'home' ? '' : routes[key]);
  const active = key.startsWith('projects/') ? 'projects' : key;
  const navigation = nav.map(([k,label]) => k === active ? `<span class="nav-current" aria-current="page">${label}</span>` : `<a data-route="${k}" href="${href(k)}"${k === active ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const crumb = key === 'home' ? '' : `<div class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>${escape(page.title)}</span></div>`;
  let body = key === 'site-map' ? createHumanSiteMap() : connectProjectEvidence(convert(page.body));
  if (key === 'projects/on-prem-home-lab') {
    for (const name of ['restore','restore-validation','artifacts','limits']) body = body.replace(new RegExp('id="(source-[^" ]+-' + name + ')"'), `id="${name}"`);
  }
  if (key === 'projects') {
    const ids = {'scvmm-2022':'scvmm','azure-arc-hybrid-management':'azure-arc','servicenow-request-fulfillment':'servicenow','m365-messaging-security':'m365-messaging-security','windows-autopilot-intune':'autopilot-intune','macos-abm-intune-runbook':'macos-abm-intune','m365-graph-administration-lab':'m365-graph-admin'};
    body = body.replace(/<article\b[^>]*>[\s\S]*?<\/article>/g, article => {
      for (const [slug,id] of Object.entries(ids)) if (article.includes('href="/' + slug + '.html"')) return article.replace('<article', '<article id="' + id + '"');
      return article;
    });
  }
  // Sitewide career copy corrections sourced from verified current-role tool usage.
  // Keep this in the generator so npm run build:preview preserves the published corrections.
  if (key === 'home') {
    body = body.replace(
      'PowerShell, Microsoft Graph, ServiceNow, and evidence-driven troubleshooting.',
      'Enterprise ticketing with Ivanti, Jira, and ServiceNow; separate PowerShell, Microsoft Graph, and ServiceNow administration lab work backed by evidence.'
    );
  }
  if (key === 'experience' || key === 'resume') {
    body = body.replace(
      'Active Directory account management, password resets, new-user setup, permissions, Windows and application troubleshooting, connectivity support, KB documentation, and Tier 2/3 escalation. Primary healthcare support includes Ivanti, Epic, MyChart, and Vocera.',
      'Provide enterprise service desk support across client environments, including Active Directory account management, password resets, new-user provisioning, permissions, Windows and application troubleshooting, and connectivity support. Triage and manage incidents and service requests using Ivanti, Jira, and ServiceNow; document resolutions and knowledge base articles, and coordinate Tier 2/3 escalations. Support healthcare applications including Epic, MyChart, and Vocera. Responsibilities reflect support-role access rather than unrestricted systems administration.'
    );
  }
  if (key === 'experience') {
    body = body.replace('<span class="tag">Ivanti</span><span class="tag">Epic</span>', '<span class="tag">Ivanti</span><span class="tag">Jira</span><span class="tag">ServiceNow</span><span class="tag">Epic</span>');
  }
  if (key === 'skills') {
    body = body.replace(
      'ServiceNow request fulfillment, catalog tasks, approval, assignment controls, and escalation. The separate administration lab has unfinished phases.',
      'Production service desk: incident and service request triage, ticket documentation, escalation, and knowledge management using Ivanti, Jira, and ServiceNow. Separately, personal ServiceNow administration labs demonstrate request fulfillment, catalog tasks, approvals, assignment controls, and escalation; later lab phases remain in progress.'
    );
  }
  if (key === 'home') {
    // Keep the core Proxmox group distinct from other documented lab systems.
    const oldFoot = '</div><div class="blueprint-foot">DOCUMENTED CONFIGURATION<br>Personal nonproduction environment · no uptime claim</div>';
    const systemMap = '</div><div class="blueprint-label" style="margin-top:20px;text-align:left">ADDITIONAL DOCUMENTED LAB SYSTEMS · PLACEMENT VARIES</div><div class="vm-grid"><div class="vm"><b><i class="dot"></i>HVHOST01</b><span>Hyper-V host → APP01 workload</span></div><div class="vm"><b><i class="dot"></i>VMM01</b><span>SCVMM management server</span></div><div class="vm"><b><i class="dot"></i>SYNC01</b><span>Earlier identity sync environment</span></div><div class="vm"><b><i class="dot"></i>macOS Monterey</b><span>Cross-platform client / lab</span></div></div><div class="blueprint-foot">DOCUMENTED SYSTEM MAP<br>Core Proxmox inventory plus additional lab systems; placements and simultaneous operation not asserted · personal nonproduction environment</div>';
    body = body.replace(oldFoot, systemMap);
    body = body.replace('Retained core lab overview: Dell PowerEdge R710 running Proxmox, with pfSense, DC01, WS01 and Linux01 virtual machines. This is a documentation diagram, not live telemetry.', 'Documented lab system map: Dell R710 Proxmox core includes pfSense, DC01, WS01 and Linux01. Additional systems include HVHOST01 with APP01, VMM01, SYNC01 and macOS Monterey. Their physical placement and simultaneous operation are not asserted.');
  }
  body = body.replace(/<a\b[^>]*>Endpoint and management-plane proof<\/a>/g, '<a href="/projects/windows-autopilot-intune/evidence/">Endpoint and management-plane proof</a>');
  body = body.replace(/C:\\Users\\[^\\<\s]+/gi, '%USERPROFILE%');
  body = body.replaceAll('https://jeremyfontenot.online/evidence-library/projects/on-prem-home-lab/Jeremy-Fontenot-On-Premises-Home-Lab-Documentation.docx', '/assets/documents/Jeremy-Fontenot-On-Premises-Home-Lab-Documentation.docx');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(page.title)} | Jeremy Fontenot</title><meta name="description" content="${escape(page.description)}"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:type" content="website"><meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary"><link rel="canonical" href="${canonical}"><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/assets/css/portfolio-preview.css"><script defer src="/assets/js/portfolio-preview.js"></script>${key === 'evidence' ? '<script defer src="/assets/js/portfolio-evidence-data.js"></script>' : ''}</head><body data-current="${escape(key)}"><a class="skip" href="#main">Skip to content</a><header class="site-header"><nav class="nav wrap" aria-label="Primary navigation"><a class="brand" href="/"><img class="brand-logo" src="/assets/logos/header_logo_88x88.png" alt="" width="44" height="44"><span>Jeremy Fontenot<small>Systems · cloud · infrastructure</small></span></a><button type="button" class="nav-toggle" aria-expanded="false" aria-controls="primary-nav">Menu</button><div id="primary-nav" class="nav-links">${navigation}</div></nav></header><main id="main" tabindex="-1"><div class="wrap" id="page-content">${crumb}${body}</div></main><footer class="site-footer"><div class="wrap"><div class="footer-top"><div><strong>Jeremy C. Fontenot</strong><p>Professional IT support experience. Evidence-backed personal-lab administration.</p></div><nav class="footer-links" aria-label="More portfolio pages">${[['architecture','Architecture'],['automation','Automation'],['troubleshooting','Troubleshooting'],['documentation','Documentation'],['gallery','Gallery'],['additional-labs','Additional Labs'],['site-map','Site Map']].map(([k,label]) => `<a href="${href(k)}">${label}</a>`).join('')}<a href="/systems-administration.html">Readiness</a><a href="/proof.html">Proof index</a><a href="/microsoft-365/">Microsoft 365</a><a href="/home-lab/">Home Lab catalog</a></nav></div><div class="footer-bottom"><span>Jeremy Fontenot · Abbeville, Louisiana</span><a href="https://github.com/fontenotjeremy71-hub/jeremyfontenot">Portfolio repository</a></div></div></footer><button type="button" class="back-top" aria-label="Back to top">↑</button><dialog id="image-dialog" aria-labelledby="dialog-caption"><button type="button" id="close-image">Close image</button><img id="dialog-image" alt=""><p id="dialog-caption"></p></dialog></body></html>\n`;
}
const outputs = {};
for (const [key, relative] of Object.entries(routes)) outputs[relative] = shell(key, pages[key]);
// Keep the ADM-LT01 supporting case study in the generated Home Lab page.
const admSection = '<section class="section" aria-labelledby="adm-lt01-title"><p class="eyebrow">Validated workstation administration</p><h2 id="adm-lt01-title">ADM-LT01 · Hybrid administration workstation</h2><p>Configured a dedicated Windows PowerShell administration workstation for VPN-based Active Directory, DNS, DHCP, Group Policy, and Hyper-V management, plus authenticated Microsoft Azure, Graph, Exchange Online, Teams, and SharePoint Online queries. The work is documented as personal-lab validation, not production administration.</p><p><a href="https://github.com/fontenotjeremy71-hub/jeremyfontenot/blob/main/docs/workstations/adm-lt01-hybrid-administration.md">Read the ADM-LT01 configuration and validation record</a></p></section>';
const admAnchor = '<section class="section"><h2>Infrastructure case studies</h2>';
if (!outputs['home-lab-overview.html'].includes(admAnchor)) throw new Error('ADM-LT01 insertion anchor missing');
outputs['home-lab-overview.html'] = outputs['home-lab-overview.html'].replace(admAnchor, admSection + admAnchor);
outputs['assets/js/portfolio-evidence-data.js'] = 'window.EVIDENCE=' + JSON.stringify(chunks('evidence').flat()) + ';\n';
// Defer scripts execute in document order: load data before initialization.
outputs[routes.evidence] = outputs[routes.evidence].replace('<script defer src="/assets/js/portfolio-preview.js"></script><script defer src="/assets/js/portfolio-evidence-data.js"></script>', '<script defer src="/assets/js/portfolio-evidence-data.js"></script><script defer src="/assets/js/portfolio-preview.js"></script>');
// Extend discovery while keeping every existing canonical route.
const existing = read('sitemap.xml');
const urls = new Set([...existing.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]));
for (const [key, relative] of Object.entries(routes)) urls.add('https://jeremyfontenot.online/' + (key === 'home' ? '' : relative));
outputs['sitemap.xml'] = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + [...urls].sort().map(url => `  <url><loc>${escape(url)}</loc></url>`).join('\n') + '\n</urlset>\n';
const hashes = {};
for (const [relative, content] of Object.entries(outputs)) {
  fs.mkdirSync(path.dirname(path.join(root, relative)), {recursive:true});
  fs.writeFileSync(path.join(root, relative), content);
  hashes[relative] = crypto.createHash('sha256').update(content).digest('hex');
}
fs.writeFileSync(path.join(root, 'content/site/preview/generated-hashes.json'), JSON.stringify({routes, files:hashes}, null, 2) + '\n');
console.log(`Integrated ${Object.keys(routes).length} static preview pages with existing magenta branding; original evidence paths preserved.`);
