const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..");
const output = path.join(root, "artifacts", "redesign", "final");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const routes = [...sitemap.matchAll(/<loc>https:\/\/jeremyfontenot\.online([^<]*)<\/loc>/g)].map((match) => match[1] || "/");
const viewports = [[320, 800], [360, 800], [375, 812], [390, 844], [414, 896], [768, 1024], [1024, 768], [1280, 800], [1440, 900]];
const fullPageWidths = new Set([390, 1024, 1440]);

function issueCount(result) {
  return result.crampedHeadings.length + result.crampedBody.length + result.clippedText.length;
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const [width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });

    for (const route of routes) {
      await page.goto(`http://127.0.0.1:4174${route}`, { waitUntil: "networkidle" });
      const slug = route === "/" ? "home" : route.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      await page.screenshot({
        path: path.join(output, `${slug}-${width}x${height}.png`),
        fullPage: fullPageWidths.has(width)
      });

      const inspection = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const inspectedSelector = "h1, h2, h3, p, li, dd, a, button";

        const isVisible = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
        };

        const lineCount = (element) => {
          const style = getComputedStyle(element);
          const parsedLineHeight = Number.parseFloat(style.lineHeight);
          const parsedFontSize = Number.parseFloat(style.fontSize);
          const effectiveLineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : parsedFontSize * 1.2;
          return Math.max(1, Math.round(element.getBoundingClientRect().height / effectiveLineHeight));
        };

        const describe = (element) => ({
          selector: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.classList.length ? `.${[...element.classList].join(".")}` : ""}`,
          text: element.textContent.trim().replace(/\s+/g, " ").slice(0, 180),
          width: Math.round(element.getBoundingClientRect().width),
          height: Math.round(element.getBoundingClientRect().height),
          lines: lineCount(element)
        });

        const headingLineLimit = viewportWidth >= 1024 ? 4 : viewportWidth >= 768 ? 6 : 9;
        const crampedHeadings = [...document.querySelectorAll("h1, h2, h3")]
          .filter(isVisible)
          .filter((element) => element.textContent.trim().length >= 22)
          .filter((element) => lineCount(element) > headingLineLimit)
          .map(describe);

        const crampedBody = [...document.querySelectorAll("p, li, dd")]
          .filter(isVisible)
          .filter((element) => element.textContent.trim().length >= 80)
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            if (viewportWidth >= 1024) return rect.width < 190 && lineCount(element) >= 9;
            if (viewportWidth >= 768) return rect.width < 170 && lineCount(element) >= 12;
            return false;
          })
          .map(describe);

        const clippedText = [...document.querySelectorAll(inspectedSelector)]
          .filter(isVisible)
          .filter((element) => {
            const style = getComputedStyle(element);
            const clipsX = style.overflowX === "hidden" || style.overflowX === "clip";
            const clipsY = style.overflowY === "hidden" || style.overflowY === "clip";
            return (clipsX && element.scrollWidth > element.clientWidth + 1) || (clipsY && element.scrollHeight > element.clientHeight + 1);
          })
          .map(describe);

        return {
          h1: document.querySelectorAll("h1").length,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          crampedHeadings,
          crampedBody,
          clippedText
        };
      });

      results.push({ route, width, height, ...inspection });
    }

    await page.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(output, "responsive-qa.json"), `${JSON.stringify(results, null, 2)}\n`);

  const failures = results.filter((result) => result.h1 !== 1 || result.overflow || issueCount(result) > 0);
  console.log(`Captured ${results.length} page/viewport combinations; ${failures.length} structural or readability failures.`);

  failures.forEach((failure) => {
    console.error(JSON.stringify({
      route: failure.route,
      viewport: `${failure.width}x${failure.height}`,
      h1: failure.h1,
      overflow: failure.overflow,
      crampedHeadings: failure.crampedHeadings,
      crampedBody: failure.crampedBody,
      clippedText: failure.clippedText
    }));
  });

  if (failures.length) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
