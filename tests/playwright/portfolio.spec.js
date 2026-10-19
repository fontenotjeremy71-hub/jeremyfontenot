const {test,expect} = require('@playwright/test');
const manifest = require('../../content/site/preview/generated-hashes.json');
const pages = Object.entries(manifest.routes).filter(([key]) => (!key.includes('/') && key !== 'review-report') || key.startsWith('projects/'));
for (const [key,route] of pages) test(`presentation: ${key}`, async ({page}) => {
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const response=await page.goto('/'+route);
  expect(response.status()).toBe(200);
  await expect(page.locator('main h1:visible')).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.locator('title')).not.toBeEmpty();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',/\S/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',/^https:\/\/jeremyfontenot\.online\//);
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
  const missingAlt=await page.locator('img:not([alt])').count();
  expect(missingAlt).toBe(0);
  expect(errors).toEqual([]);
});
test('project search returns the matching case study',async({page})=>{
  await page.goto('/projects.html');
  await expect(page.locator('[data-project]:visible')).toHaveCount(13);
  for (const card of await page.locator('[data-project]').all()) {
    const headingTarget=await card.locator('h3 a').getAttribute('href');
    const caseStudyTarget=await card.locator('.card-footer a').first().getAttribute('href');
    expect(headingTarget).toBe(caseStudyTarget);
  }
  await page.locator('#project-search').fill('Windows LAPS');
  await expect(page.locator('[data-project]:visible')).toHaveCount(1);
  await expect(page.locator('[data-project]:visible')).toContainText('Windows LAPS');
  await page.locator('#project-search').fill('no-matching-project-zzzz');
  await expect(page.locator('[data-project]:visible')).toHaveCount(0);
  await expect(page.locator('#project-empty')).toBeVisible();
});
test('evidence filtering handles matching and empty results',async({page})=>{
  await page.goto('/evidence-browser.html');
  await expect(page.locator('#evidence-count')).toContainText('1,268');
  await page.locator('#evidence-search').fill('Windows LAPS');
  await expect(page.locator('#evidence-results .evidence-row').first()).toBeVisible();
  await page.locator('#evidence-search').fill('no-matching-evidence-zzzz');
  await expect(page.locator('#evidence-count')).toHaveText('0 source references');
  await expect(page.locator('#evidence-results')).toContainText('No evidence matches');
});
test('menu and gallery work with keyboard dismissal',async({page})=>{
  await page.goto('/');
  const toggle=page.locator('.nav-toggle');
  if(await toggle.isVisible()){
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded','true');
    await toggle.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded','false');
  }
  await page.goto('/gallery.html');
  const opener=page.locator('[data-image]').first();
  await opener.click();
  await expect(page.locator('dialog')).toBeVisible();
  await expect.poll(()=>page.locator('#dialog-image').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  await page.locator('#close-image').click();
  await expect(page.locator('dialog')).not.toBeVisible();
  await expect(opener).toBeFocused();
});
test('hiring reviewer can reach projects, resume, contact, and direct proof',async({page})=>{
  await page.goto('/');
  await expect(page.locator('main')).toContainText('Service Desk');
  await expect(page.locator('main')).toContainText(/personal|nonproduction/i);
  for(const href of ['/projects.html','/resume.html','/contact.html']) expect(await page.locator(`a[href="${href}"]`).count()).toBeGreaterThan(0);
  const proof=page.locator('a[href$="/projects/windows-laps-gpo/evidence/"]').first();
  await expect(proof).toBeVisible();
  // Production absolute URLs and relative URLs resolve to the same published
  // artifact. Visit its pathname on this isolated local test server.
  const target=new URL(await proof.getAttribute('href'),'https://jeremyfontenot.online/');
  expect(target.origin).toBe('https://jeremyfontenot.online');
  await page.goto(target.pathname);
  await expect(page.locator('main')).toContainText(/LAPS/);
  await page.goto('/projects.html');
  await expect(page.locator('[data-project]')).toHaveCount(13);
});
test('hiring reviewer sees bounded Graph and restore claims',async({page})=>{
  await page.goto('/m365-graph-administration-lab.html');
  await expect(page.locator('main')).toContainText(/read.only/i);
  await expect(page.locator('main')).toContainText(/delegated/i);
  expect(await page.locator('main a[href*="github.com/"]').count()).toBeGreaterThan(0);
  await page.goto('/on-prem-home-lab.html');
  await expect(page.locator('main')).toContainText(/inconclusive/i);
  await expect(page.locator('main')).toContainText(/RTO/);
  await expect(page.locator('main')).toContainText(/personal|nonproduction/i);
});
