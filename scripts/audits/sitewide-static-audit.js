#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),origin='https://jeremyfontenot.online';
const file=p=>path.join(root,p.replace(/^\/+/,'')), exists=p=>fs.existsSync(file(p));
const urlRoute=u=>{try{let x=new URL(u,origin+'/');if(x.origin!==origin)return null;const p=decodeURIComponent(x.pathname);return p.endsWith('/')?p+'index.html':p;}catch{return null;}};
const sitemap=fs.readFileSync(file('sitemap.xml'),'utf8');
const seeds=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const queue=seeds.map(urlRoute),seen=new Set(),rows=[],discover=new Set();
const issues=[],read=p=>fs.readFileSync(file(p),'utf8');
while(queue.length){
  let route=queue.shift();if(!route||seen.has(route))continue;seen.add(route);
  if(!/\.html$/i.test(route))continue;
  let rel=route.replace(/^\//,'');let url=origin+route.replace(/index\.html$/,'');
  if(!exists(rel)){rows.push({url,route:rel,source:'missing',issues:['sitemap or linked route not found in repository'],status:'BLOCKED'});continue;}
  let html=read(rel),title=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'',description=(html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)||[])[1]||'';
  let tags=[...html.matchAll(/<(?:a|link|script|img)\b[^>]*(?:href|src)="([^"]+)"/gi)].map(x=>x[1]);const problems=[];
  if(!title.trim())problems.push('missing title');if(!description.trim())problems.push('missing description');
  if(!/<h1\b/i.test(html))problems.push('missing H1');
  if(!/<html\b[^>]*lang=/i.test(html))problems.push('missing html language');
  if(!/<meta\b[^>]*\bname\s*=\s*["\']viewport["\']/i.test(html))problems.push('missing viewport metadata');
  if(!/<nav\b/i.test(html) && !(/\/projects\/(?:macos-abm-intune-runbook|windows-autopilot-intune)\/evidence\/index\.html$/i.test(route) && /<a\b[^>]*href="\/(?:macos-abm-intune-runbook|windows-autopilot-intune)\.html"[^>]*>Back to case study<\/a>/i.test(html)))problems.push('missing navigation');
  if(!/portfolio-preview\.css|\/assets\/css\/site\.css|\/assets\/css\/style\.css/i.test(html))problems.push('shared stylesheet not identified (manual review)');
  if(/\beight curated case studies\b/i.test(html))problems.push('stale eight-project count');
  if(/<img\b(?![^>]*\balt=)[^>]*>/i.test(html))problems.push('image missing alt attribute');
  for(const ref of tags){if(!ref||/^(?:mailto:|tel:|javascript:|data:|#)/i.test(ref))continue;
    let x;try{x=new URL(ref,origin+route)}catch{problems.push('invalid reference '+ref);continue}
    if(x.origin!==origin)continue;
    const loc=decodeURIComponent(x.pathname),local=loc.endsWith('/')?loc+'index.html':loc;
    if(/\.html$/i.test(local)){if(!seen.has(local))queue.push(local);discover.add(origin+loc);}
    else if(!exists(local.replace(/^\//,'')))problems.push('missing local asset '+loc);
  }
  rows.push({url,route:rel,title,description,source:'repository HTML static inspection',issues:[...new Set(problems)],status:problems.length?'REVIEW':'BLOCKED'});
}
const output={created:new Date().toISOString(),seedCount:seeds.length,discoveredHtmlRoutes:rows.length,notInSitemap:rows.filter(r=>!seeds.some(u=>urlRoute(u)?.replace(/^\//,'')===r.route)).map(r=>r.url),issueCount:rows.reduce((n,r)=>n+r.issues.length,0),pages:rows};
let dest=process.argv.includes('--output')?process.argv[process.argv.indexOf('--output')+1]:'artifacts/browser-validation/sitewide-static-audit.json';
fs.mkdirSync(path.dirname(file(dest)),{recursive:true});fs.writeFileSync(file(dest),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({sitemap:seeds.length,htmlRoutes:rows.length,newRoutes:output.notInSitemap.length,issueCount:output.issueCount,output:dest}));
