const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..");
const output = path.join(root, "artifacts", "redesign", "final");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const routes = [...sitemap.matchAll(/<loc>https:\/\/jeremyfontenot\.online([^<]*)<\/loc>/g)].map((match) => match[1] || "/");
const viewports = [[320, 800], [360, 800], [375, 812], [390, 844], [414, 896], [768, 1024], [1024, 768], [1280, 800], [1440, 900]];

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const [width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
    for (const route of routes) {
      await page.goto(`http://127.0.0.1:4174${route}`, { waitUntil: "networkidle" });
      const slug = route === "/" ? "home" : route.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      await page.screenshot({ path: path.join(output, `${slug}-${width}x${height}.png`) });
      results.push({ route, width, height, h1: await page.locator("h1").count(), overflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) });
    }
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(output, "responsive-qa.json"), `${JSON.stringify(results, null, 2)}\n`);
  const failures = results.filter((result) => result.h1 !== 1 || result.overflow);
  console.log(`Captured ${results.length} page/viewport combinations; ${failures.length} structural failures.`);
  if (failures.length) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
