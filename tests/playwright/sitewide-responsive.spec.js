'use strict';
const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const widths=[375,768,1366,1920];
test.describe('Sitewide responsive route sweep',()=>{
 test('all sitemap routes: browser load, overflow, console errors at four widths',async({browser})=>{
  test.setTimeout(20*60*1000);
  const results=[];
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
    }catch(e){issues.push('navigation error: '+e.message.slice(0,160));}
    results.push({url:full,width,status,issues});
    page.off('pageerror',onErr);page.off('response',onResp);
   }
   await context.close();
  }
  const output=path.join(root,'artifacts/browser-validation/sitewide-responsive-results.json');
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify({widths,pages:urls.length,results},null,2)+'\n');
  const failures=results.filter(r=>r.issues.length);
  expect(failures.slice(0,15),failures.length+' failures; inspect saved browser audit JSON').toEqual([]);
 });
});
