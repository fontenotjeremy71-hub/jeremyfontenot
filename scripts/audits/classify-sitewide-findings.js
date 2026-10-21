#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),sourceRoot='evidence-library/preserved-sharepoint/source/';
const audit=JSON.parse(fs.readFileSync(path.join(root,'artifacts/browser-validation/sitewide-static-audit.json'),'utf8'));
const findings=[],sourceCache=new Map();
function inspect(route){
 if(sourceCache.has(route))return sourceCache.get(route);
 const pathname=path.join(root,route),exists=fs.existsSync(pathname);
 const body=exists?fs.readFileSync(pathname,'utf8'):'';
 const info={exists,sha256:exists?crypto.createHash('sha256').update(body).digest('hex'):null,
   hasNav:/<nav\b/i.test(body),viewport:/<meta\s+name=["']viewport["']/i.test(body),
   styles:[...body.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)].map(x=>x[0]),
   offlineSrc:(body.match(/(?:href|src)=["']site-relative["']/gi)||[]).length,
   unavailableAsset:body.includes('unavailable-preserved-asset.svg'),
   sourceExport:/data-sp-|SharePoint|spfx|sharepoint/i.test(body),
   raw:body};
 sourceCache.set(route,info);return info;
}
for(const page of audit.pages)for(const issue of page.issues){
 const info=inspect(page.route),preserved=page.route.startsWith(sourceRoot);
 let classification='BLOCKED — EVIDENCE REQUIRED',reason='Insufficient file-specific evidence to dismiss finding.';
 if(!info.exists){reason='Route file absent from repository.';}
 else if(issue==='missing navigation'&&info.hasNav){classification='FALSE POSITIVE — VERIFIED';reason='The file contains an HTML nav element.';}
 else if(issue==='missing navigation'&&preserved&&info.sourceExport){classification='EXPECTED BEHAVIOR — VERIFIED';reason='This exact source file contains SharePoint export markers and lacks a native nav. Original export is preserved; wrapper navigation still requires separate visual verification.';}
 else if(issue==='shared stylesheet not identified (manual review)'&&preserved&&info.sourceExport){classification='EXPECTED BEHAVIOR — VERIFIED';reason='This exact SharePoint-export source retains independent styling; absence of portfolio shared stylesheet is intentional. Wrapper presentation is not visually verified.';}
 else if(issue.startsWith('missing local asset ')&&preserved&&info.offlineSrc>0&&issue.endsWith('/site-relative')){classification='EXPECTED BEHAVIOR — VERIFIED';reason='This exact source file contains src/href="site-relative" offline SharePoint placeholder; original cannot be mutated. Public wrapper/reference accessibility remains separately testable.';}
 else if(issue==='missing viewport metadata'&&preserved&&info.sourceExport){classification='BLOCKED — VISUAL INSPECTION UNAVAILABLE';reason='Verified viewport tag absent from this exact SharePoint source; whether narrow viewport is usable requires rendered review.';}
 else if(!preserved){classification='BLOCKED — VISUAL INSPECTION UNAVAILABLE';reason='This route is not a preserved SharePoint source. Its missing navigation or recognized style needs rendered/manual verification.';}
 findings.push({route:page.route,url:page.url,issue,disposition:classification,reason,
 evidence:{path:page.route,sha256:info.sha256,sourceExportMarkers:info.sourceExport,
 actualNavigation:info.hasNav,actualViewportMeta:info.viewport,stylesheetLinks:info.styles.length,
 offlinePlaceholders:info.offlineSrc,unavailableAssetReference:info.unavailableAsset},corrected:false});
}
const totals=Object.fromEntries([...new Set(findings.map(x=>x.disposition))].map(k=>[k,findings.filter(x=>x.disposition===k).length]));
if(findings.length!==audit.issueCount)throw Error('Finding mismatch expected '+audit.issueCount+' found '+findings.length);
const output={sourceWorkflow:'39535264710',generated:new Date().toISOString(),findings:findings.length,sourceFilesInspected:sourceCache.size,totals,items:findings};
fs.writeFileSync(path.join(root,'artifacts/browser-validation/sitewide-findings-triage.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({findings:output.findings,sourceFilesInspected:output.sourceFilesInspected,totals}));
