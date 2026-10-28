// Read-only interaction verification; each recorded check has an asserted result.
const {chromium,expect}=require('@playwright/test');
const fs=require('node:fs');
const output='artifacts/production-completion';
const origin='https://jeremyfontenot.online';
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({executablePath:process.env.PORTFOLIO_BROWSER_EXECUTABLE,headless:true,args:['--no-sandbox'],...(process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
  const checks=[];
  for(const viewport of [{width:360,height:900},{width:1440,height:1000}]){
    const context=await browser.newContext({viewport});
    const page=await context.newPage();
    const check=async(name,fn)=>{try{await fn();checks.push({viewport:viewport.width,name,result:'pass'});}catch(e){checks.push({viewport:viewport.width,name,result:'fail',error:e.message});}fs.writeFileSync(output+'/navigation.json',JSON.stringify(checks,null,2));};
    const go=async path=>{const r=await page.goto(origin+path,{waitUntil:'domcontentloaded'});expect(r.status()).toBe(200);await expect(page.locator('main')).toBeVisible();};
    await go('/');
    const nav=await page.locator('header a[href]').evaluateAll(a=>a.map(x=>({text:x.textContent,href:x.getAttribute('href')})));
    for(const item of nav){
      await check('Primary navigation '+item.href,async()=>{
        await go('/');
        const toggle=page.locator('.nav-toggle');
        if(await toggle.isVisible()){await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','true');}
        await page.locator(`header a[href="${item.href}"]`).first().click();
        await expect(page).toHaveURL(origin+item.href);
        await expect(page.locator('h1').first()).toBeVisible();
      });
    }
    await check('Menu keyboard close',async()=>{await go('/');const t=page.locator('.nav-toggle');if(await t.isVisible()){await t.click();await t.press('Escape');await expect(t).toHaveAttribute('aria-expanded','false');}else await expect(page.locator('#primary-nav')).toBeVisible();});
    await go('/');
    const ctas=await page.locator('main a[href],footer a[href^="/"]').evaluateAll(a=>[...new Set(a.map(x=>x.getAttribute('href')))].filter(h=>h.startsWith('/')&&!h.includes('#')));
    for(const href of ctas)await check('Homepage/footer CTA '+href,async()=>{await go('/');await page.locator(`a[href="${href}"]`).filter({visible:true}).first().click();await expect(page.locator('h1').first()).toBeVisible();expect(new URL(page.url()).pathname.replace(/index.html$/,'')).toBe(new URL(href,origin).pathname.replace(/index.html$/,''));});
    await go('/projects.html');
    const projects=await page.locator('[data-project] h3 a').evaluateAll(a=>a.map(x=>x.getAttribute('href')));
    for(const href of projects)await check('Project card '+href,async()=>{await go('/projects.html');await page.locator(`[data-project] h3 a[href="${href}"]`).click();await expect(page.locator('h1').first()).toBeVisible();expect(new URL(page.url()).pathname).toBe(new URL(href,origin).pathname);});
    await go('/projects.html');
    for(const category of await page.locator('[data-category-filter]').evaluateAll(a=>a.map(x=>x.dataset.categoryFilter)))await check('Project category '+category,async()=>{await page.locator(`[data-category-filter="${category}"]`).click();await expect(page.locator(`[data-category-filter="${category}"]`)).toHaveAttribute('aria-pressed','true');expect(await page.locator('[data-project]:visible').count()).toBeGreaterThan(0);});
    await check('Project search matching/empty/reset',async()=>{await go('/projects.html');await page.locator('#project-search').fill('Windows LAPS');await expect(page.locator('[data-project]:visible')).toHaveCount(1);await page.locator('#project-search').fill('zzzz-no-result');await expect(page.locator('#project-empty')).toBeVisible();await page.locator('#project-search').fill('');await expect(page.locator('[data-project]:visible')).toHaveCount(13);});
    await go('/evidence-browser.html');
    for(const id of ['evidence-project','evidence-type','evidence-technology','evidence-skill']){
      const values=await page.locator('#'+id+' option').evaluateAll(a=>a.map(x=>x.value).filter(Boolean));
      for(const value of values)await check(id+' = '+value,async()=>{await page.locator('#'+id).selectOption(value);expect(await page.locator('.evidence-row').count()).toBeGreaterThan(0);await expect(page.locator('#evidence-page')).toContainText('Page 1');await page.locator('#'+id).selectOption('');});
    }
    await check('Evidence pagination next/previous',async()=>{await page.locator('#evidence-next').click();await expect(page.locator('#evidence-page')).toContainText('Page 2');await page.locator('#evidence-prev').click();await expect(page.locator('#evidence-page')).toContainText('Page 1');});
    await check('Evidence search empty/reset',async()=>{await page.locator('#evidence-search').fill('zzzz-no-result');await expect(page.locator('#evidence-count')).toHaveText('0 source references');await page.locator('#evidence-search').fill('');expect(await page.locator('.evidence-row').count()).toBe(16);});
    await check('Evidence scope disclosure',async()=>{await page.locator('.evidence-row summary').first().click();await expect(page.locator('.evidence-row details').first()).toHaveAttribute('open','');});
    for(const route of ['/projects/windows-autopilot-intune/evidence/','/projects/macos-abm-intune-runbook/evidence/','/evidence-library/preserved-sharepoint/'])await check('Evidence index navigation '+route,async()=>{await go(route);expect(await page.locator('a[href]').count()).toBeGreaterThan(1);const a=page.locator('a[href="/"]').first();await a.click();await expect(page).toHaveURL(origin+'/');});
    await check('Gallery open/close/focus',async()=>{await go('/gallery.html');const opener=page.locator('[data-image]').first();await opener.click();await expect(page.locator('dialog')).toBeVisible();await page.locator('#close-image').click();await expect(page.locator('dialog')).not.toBeVisible();await expect(opener).toBeFocused();});
    await check('Verified resume PDF download',async()=>{await go('/resume.html');const pending=page.waitForEvent('download');await page.locator('a[download]').first().click();const download=await pending;expect(download.suggestedFilename()).toMatch(/\.pdf$/);expect(await download.failure()).toBeNull();});
    await check('Print control calls browser print',async()=>{await go('/resume.html');await page.evaluate(()=>{window.__qaPrintCalled=false;window.print=()=>{window.__qaPrintCalled=true;};});await page.locator('[data-print]').click();expect(await page.evaluate(()=>window.__qaPrintCalled)).toBe(true);});
    await check('Back to top control',async()=>{await go('/projects.html');await page.locator('footer').scrollIntoViewIfNeeded();await page.locator('.back-top').click();await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(0);});
    await go('/projects.html');await page.screenshot({path:output+'/projects-'+viewport.width+'.png',fullPage:true});
    await context.close();
    console.log(viewport.width,checks.length,'checks recorded');
  }
  await browser.close();
  console.log('Navigation',checks.length,'passed',checks.filter(c=>c.result==='pass').length,'failed',checks.filter(c=>c.result==='fail').length);
  if(checks.some(c=>c.result==='fail'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
