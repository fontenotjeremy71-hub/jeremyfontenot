'use strict';
const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const audit=JSON.parse(fs.readFileSync(path.join(root,'artifacts/browser-validation/sitewide-static-audit.json'),'utf8'));
const urls=audit.pages.map(p=>p.url);
const widths=[375,768,1366,1920];
const triageFile=path.join(root,'artifacts/browser-validation/sitewide-findings-triage.json');
const visualPending=new Set(fs.existsSync(triageFile)
 ?JSON.parse(fs.readFileSync(triageFile,'utf8')).items
   .filter(f=>f.disposition==='BLOCKED — VISUAL INSPECTION UNAVAILABLE')
   .map(f=>new URL(f.url).pathname)
 :[]);
const screenshotDir=path.join(root,'artifacts/browser-validation/visual-review-screenshots');

test.describe('Sitewide responsive route sweep',()=>{
 test('all discovered routes: browser load, overflow, console errors at four widths',async({browser},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop','Audit four viewport widths once');
  test.setTimeout(20*60*1000);
  const results=[];
  const preservedPrefix='/evidence-library/preserved-sharepoint/source/';
  for(const width of widths){
   const context=await browser.newContext({viewport:{width,height:900}});
   const page=await context.newPage();
   for(const full of urls){
    const address=new URL(full),issues=[];
    const pageErrors=[],badResponses=[];
    const onErr=e=>pageErrors.push(e.message);
    const onResp=res=>{if(res.status()>=400&&res.url().startsWith('http://127.0.0.1:4173'))badResponses.push(res.status()+' '+res.url());};
    page.on('pageerror',onErr);page.on('response',onResp);
    let status=null;
    try{
      const response=await page.goto(address.pathname,{waitUntil:'domcontentloaded',timeout:12000});
      status=response?.status()??null;
      await page.waitForTimeout(45);
      const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
      if(sizes.scroll>sizes.client+2)issues.push('horizontal overflow '+sizes.scroll+'>'+sizes.client);
      if(status!==200)issues.push('HTTP '+status);
      if(pageErrors.length)issues.push(...pageErrors.slice(0,3));
      if(badResponses.length)issues.push(...badResponses.slice(0,3));
      if(visualPending.has(address.pathname)){
        fs.mkdirSync(screenshotDir,{recursive:true});
        const label=address.pathname.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,110)||'homepage';
        await page.screenshot({path:path.join(screenshotDir,label+'-'+width+'.png'),fullPage:true,animations:'disabled'});
      }
    }catch(e){issues.push('navigation error: '+e.message.slice(0,160));}
    const isPreservedSource=address.pathname.startsWith(preservedPrefix);
    let limitation=null;
    if(isPreservedSource&&issues.every(x=>x.startsWith('horizontal overflow '))&&issues.length){
      const wrapper=address.pathname.replace('/source/','/wrappers/');
      try{
        const response=await page.goto(wrapper,{waitUntil:'domcontentloaded',timeout:12000});
        const wrapSize=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
        const originalLink=await page.locator('a[href*="/source/"]').count();
        if(response?.status()===200&&wrapSize.scroll<=wrapSize.client+2&&originalLink>0){
          limitation={kind:'preserved-third-party-mobile-overflow',sourceOverflow:issues[0],responsiveWrapper:wrapper,wrapperHttp:200,wrapperScrollWidth:wrapSize.scroll,wrapperClientWidth:wrapSize.client,originalLinkPresent:true};
          issues.length=0;
        }else issues.push('responsive wrapper does not adequately expose preserved original: HTTP '+response?.status()+' width '+wrapSize.scroll+'>'+wrapSize.client+' original link '+originalLink);
      }catch(e){issues.push('responsive wrapper unavailable: '+e.message.slice(0,120));}
    }
    results.push({url:full,width,status,issues,limitation});
    page.off('pageerror',onErr);page.off('response',onResp);
   }
   await context.close();
  }
  const output=path.join(root,'artifacts/browser-validation/sitewide-responsive-results.json');
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify({widths,pages:urls.length,routeViewportChecks:results.length,preservedSourceLimitations:results.filter(x=>x.limitation).length,results},null,2)+'\n');
  const failures=results.filter(r=>r.issues.length);
  expect(failures.slice(0,15),failures.length+' failures; inspect saved browser audit JSON').toEqual([]);
 });
});
