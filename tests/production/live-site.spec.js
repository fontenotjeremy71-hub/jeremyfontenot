const {test,expect}=require('@playwright/test');
const path=require('node:path');
test('live homepage renders portrait without covering navigation or topology',async({page},info)=>{
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  const response=await page.goto('/',{waitUntil:'domcontentloaded'});
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('header')).toBeVisible();
  const portrait=page.locator('.hero-grid .portfolio-portrait img');
  await expect(portrait).toBeVisible({timeout:20000});
  await expect.poll(()=>portrait.evaluate(el=>el.complete&&el.naturalWidth>0),{timeout:25000}).toBe(true);
  await expect(page.locator('.hero-grid .blueprint')).toHaveCount(0);
  await expect(page.locator('.portfolio-lab-overview .blueprint')).toBeVisible();
  const heroText=page.locator('.hero-grid > div:first-child');
  const portraitBounds=await portrait.boundingBox();
  const textBounds=await heroText.boundingBox();
  expect(portraitBounds&&textBounds).toBeTruthy();
  const overlapX=Math.max(0,Math.min(portraitBounds.x+portraitBounds.width,textBounds.x+textBounds.width)-Math.max(portraitBounds.x,textBounds.x));
  const overlapY=Math.max(0,Math.min(portraitBounds.y+portraitBounds.height,textBounds.y+textBounds.height)-Math.max(portraitBounds.y,textBounds.y));
  expect(overlapX*overlapY,'portrait must not overlap intro text').toBeLessThan(600);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),'no horizontal overflow').toBe(true);
  expect(errors,'no uncaught browser JS errors').toEqual([]);
  await page.screenshot({path:path.join('artifacts/production-screenshots',info.project.name+'-home.png'),fullPage:true,animations:'disabled'});
});
test('live about page loads blended portrait and working main content',async({page},info)=>{
  const response=await page.goto('/about.html',{waitUntil:'domcontentloaded'});
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toBeVisible();
  const portrait=page.locator('.page-heading .portfolio-portrait img');
  await expect(portrait).toBeVisible({timeout:20000});
  await expect.poll(()=>portrait.evaluate(el=>el.complete&&el.naturalWidth>0),{timeout:25000}).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
  await page.screenshot({path:path.join('artifacts/production-screenshots',info.project.name+'-about.png'),fullPage:true,animations:'disabled'});
});
test('public navigation destinations respond and essential assets load',async({page,request})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  for(const target of ['/projects.html','/evidence-browser.html','/resume.html','/contact.html']){
    const r=await request.get(target);
    expect(r.status(),target+' must be reachable').toBe(200);
  }
  for(const target of ['/assets/js/portfolio-preview.js','/assets/css/portfolio-preview.css','/assets/images/jeremy-fontenot-cutout.svg']){
    const r=await request.get(target);
    expect(r.status(),target+' must load').toBe(200);
  }
});
