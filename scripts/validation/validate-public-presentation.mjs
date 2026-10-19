import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from 'parse5';

// Source evidence is immutable. Presentation policy applies to public landing
// pages, not technical literals, captured command output, or retained chronology.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mode = process.argv[2];
const failures = [];
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const files = [...new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([,url]) => {
  const pathname = decodeURIComponent(new URL(url).pathname);
  return pathname.endsWith('/') ? pathname.slice(1) + 'index.html' : pathname.slice(1);
}))];
const attrs = node => Object.fromEntries((node.attrs || []).map(({name,value}) => [name,value]));
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join(' ');
function all(node, predicate, output = []) {
  if (predicate(node)) output.push(node);
  for (const child of node.childNodes || []) all(child, predicate, output);
  return output;
}
const primary = new Set(Object.entries(JSON.parse(fs.readFileSync(path.join(root, 'content/site/preview/generated-hashes.json'))).routes)
  .filter(([key]) => !key.includes('/') || key.startsWith('projects/')).map(([,file]) => file));
const datePattern = /\b(?:19|20)\d{2}-\d{2}-\d{2}\b|\b\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?\b/i;
let checked = 0;
for (const file of files) {
  if (['content','no-date'].includes(mode) && !primary.has(file)) continue;
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const doc = parse(html);
  const nodes = all(doc, n => Boolean(n.tagName));
  checked++;
  const error = message => failures.push(`${file}: ${message}`);
  if (mode === 'seo') {
    const titles = nodes.filter(n => n.tagName === 'title');
    if (titles.length !== 1 || !text(titles[0]).trim()) error('requires one nonempty title');
    // Retained evidence indexes require usable document metadata; social cards
    // are enforced on authored portfolio presentation, not immutable evidence.
    const keys = /^projects\/[^/]+\/evidence\//.test(file) ? ['description'] : ['description','og:title','og:description'];
    for (const key of keys) {
      if (!nodes.some(n => n.tagName === 'meta' && (attrs(n).name === key || attrs(n).property === key) && attrs(n).content?.trim())) error(`missing ${key}`);
    }
    const canonical = nodes.find(n => n.tagName === 'link' && attrs(n).rel === 'canonical');
    const expected = 'https://jeremyfontenot.online/' + (file === 'index.html' ? '' : file.endsWith('/index.html') ? file.slice(0,-10) : file);
    if (!canonical || attrs(canonical).href !== expected) error(`canonical must be ${expected}`);
  } else if (mode === 'content' || mode === 'no-date') {
    function visit(node, retained = false) {
      const a = attrs(node);
      retained ||= /(?:^|\s)(?:document|imported)(?:\s|$)/.test(a.class || '') || ['pre','code','script','style','time'].includes(node.tagName);
      // Evidence titles and resumes may retain technically relevant chronology.
      retained ||= a['data-allow-evidence-date'] !== undefined || a['data-allow-resume-date'] !== undefined;
      const surface = ['h1','h2','h3','h4','button'].includes(node.tagName) || /(?:^|\s)status(?:\s|$)/.test(a.class || '') || node.tagName === 'nav';
      if (!retained && surface) {
        const value = text(node).replace(/\s+/g,' ').trim();
        if (mode === 'no-date' && datePattern.test(value)) error(`calendar date in a heading or control: ${value.slice(0,140)}`);
        if (mode === 'content' && /\blorem ipsum\b|\bTODO:\s*(?:write|replace|finish)\b|\bcoming soon\b|\bfake evidence\b/i.test(value)) error(`unfinished presentation text: ${value.slice(0,140)}`);
      }
      for (const child of node.childNodes || []) visit(child, retained);
    }
    visit(doc);
  } else throw new Error(`Unknown presentation validation: ${mode}`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  console.error(`${mode} validation failed (${failures.length} findings).`);
  process.exitCode = 1;
} else console.log(`${mode} presentation validation passed (${checked} canonical pages).`);
