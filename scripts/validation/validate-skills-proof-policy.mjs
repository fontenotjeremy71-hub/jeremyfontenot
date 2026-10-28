import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from 'parse5';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const routes = ['index.html','projects.html','evidence-browser.html','skills.html','home-lab-overview.html'];
const failures = [];
function walk(node, cb) { cb(node); for (const child of node.childNodes || []) walk(child, cb); }
function textOf(node) { return node.nodeName === '#text' ? node.value : (node.childNodes || []).map(textOf).join(' '); }
for (const route of routes) {
  const file = path.join(root, route);
  if (!fs.existsSync(file)) { failures.push(route + ': generated page missing'); continue; }
  const doc = parse(fs.readFileSync(file, 'utf8'));
  let policy = false;
  walk(doc, node => {
    if (!node.tagName) return;
    const attrs = Object.fromEntries((node.attrs || []).map(x => [x.name, x.value]));
    if (attrs['data-skills-proof-policy'] === 'true') policy = true;
    if (['h1','h2','h3','h4','button'].includes(node.tagName) || /(?:^|\s)status(?:\s|$)/.test(attrs.class || '')) {
      const value = textOf(node).replace(/\s+/g, ' ').trim();
      if (/\b(?:historical|active)\b/i.test(value) && !/active directory/i.test(value)) failures.push(route + ': lifecycle classification in presentation: ' + value.slice(0,120));
    }
  });
  if (!policy) failures.push(route + ': skills-proof policy statement missing');
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('Skills-proof presentation policy passed (' + routes.length + ' generated pages).');
