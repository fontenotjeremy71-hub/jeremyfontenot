#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const json=JSON.parse(fs.readFileSync(path.join(root,'artifacts/browser-validation/sitewide-static-audit.json'),'utf8'));
const csvPath=path.join(root,'artifacts/audits/portfolio-page-validation-matrix-20261020.csv');
const content=fs.readFileSync(csvPath,'utf8');
const lines=content.trimEnd().split(/\r?\n/);
const quote=s=>'"'+String(s).replace(/"/g,'""')+'"';
const existing=new Set(lines.slice(1).map(line=>(line.match(/^"([^"]+)"/)||[])[1]).filter(Boolean));
let added=0;
for(const p of json.pages){
 if(existing.has(p.url))continue;
 const row=[p.url,'recursive static audit; not sitemap', 'NOT TESTED on production',p.title||'NOT VERIFIED',
 'AUTOMATED STATIC CHECK ONLY; technical evidence review pending','NOT VISUALLY REVIEWED',
 'NOT TESTED','NOT TESTED','NOT TESTED','NOT TESTED',
 p.issues.length?'FLAGGED: '+p.issues.join(' | '):'STATIC LINKS SCANNED; browser pending',
 'NOT VERIFIED','NONE VERIFIED','NOT TESTED','BLOCKED'];
 lines.push(row.map(quote).join(','));existing.add(p.url);added++;
}
fs.writeFileSync(csvPath,lines.join('\n')+'\n');
console.log(JSON.stringify({rows:existing.size,added}));
