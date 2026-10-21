#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const audit=read('artifacts/browser-validation/sitewide-static-audit.json');
const base='evidence-library/preserved-sharepoint/source/';
const rules={
 'missing navigation':p=>p.route.startsWith(base)?['Expected behavior','Preserved source export has no site-wide navigation; preserve source bytes and expose navigation through derived catalog.']:['Requires visual inspection','Published non-source route has no native nav element; determine whether compatibility shell links provide navigation.'],
 'shared stylesheet not identified (manual review)':p=>p.route.startsWith(base)?['Expected behavior','Preserved source export uses its original styling; shared portfolio stylesheet must not be injected into preserved evidence.']:['Requires visual inspection','Stylesheet heuristic did not recognize page styling; inspect rendered page.'],
 'missing viewport metadata':p=>['Requires visual inspection','Source export does not declare a viewport; check whether published derivative is usable at narrow widths without rewriting preserved source.'],
};
const findings=[];
for(const p of audit.pages)for(const issue of p.issues){
 let classification,reason;
 if(issue==='missing local asset /evidence-library/preserved-sharepoint/source/docs/business/sharepoint/Artifacts/site-relative' && p.route.startsWith(base)){classification='Expected behavior';reason='Verified in preserved Home export: site-relative is an offline placeholder in source img src attributes, while public sanitized derivatives use unavailable-preserved-asset.svg; original evidence must remain byte-preserved.';}
 else if(issue.startsWith('missing local asset ')){classification='Confirmed defect requiring correction';reason='Resolved local resource absent from repository, not a verified preserved placeholder; fix published source or generator.';}
 else if(rules[issue]) [classification,reason]=rules[issue](p);
 else {classification='Requires technical evidence';reason='Unrecognized heuristic; cannot close without source review.';}
 findings.push({route:p.route,url:p.url,issue,classification,reason,corrected:false});
}
const totals=Object.fromEntries([...new Set(findings.map(x=>x.classification))].map(x=>[x,findings.filter(y=>y.classification===x).length]));
if(findings.length!==audit.issueCount)throw new Error('Finding total mismatch');
const output={sourceWorkflow:'39535264710',discovered: audit.pages.length, findings:findings.length,totals,items:findings};
const dest=path.join(root,'artifacts/browser-validation/sitewide-findings-triage.json');
fs.writeFileSync(dest,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({discovered:output.discovered,findings:output.findings,totals}));
