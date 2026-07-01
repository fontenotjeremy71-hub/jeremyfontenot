const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const baseUrl = process.env.SITE_BASE_URL || "http://127.0.0.1:4173";
const runName = process.env.VISUAL_REVIEW_RUN || "current";
const outputDir = path.join(process.cwd(), "artifacts", "visual-review", runName);

const pages = [
  ["home", "/index.html"],
  ["projects", "/projects.html"],
  ["proof", "/proof.html"],
  ["dashboard", "/dashboard.html"],
  ["resume", "/resume.html"],
  ["contact", "/contact.html"],
  ["evidence-library", "/evidence-library/index.html"],
  ["evidence-public", "/evidence/public/index.html"]
];

const widths = [1920, 1440, 1280, 1024, 768, 430, 390, 360];

fs.mkdirSync(outputDir, { recursive: true });

async function inspectPage(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const links = [...document.querySelectorAll("a[href]")];
    const images = [...document.querySelectorAll("img")];
    const focusables = [...document.querySelectorAll("a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])")];
    const overflowNodes = [...document.querySelectorAll("body *")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 &&
          rect.height > 0 &&
          style.position !== "fixed" &&
          (rect.right > window.innerWidth + 1 || rect.left < -1);
      })
      .slice(0, 10)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName,
          className: String(element.className || ""),
          text: (element.textContent || "").trim().slice(0, 90),
          left: Math.round(rect.left),
          right: Math.round(rect.right)
        };
      });

    return {
      title: document.title,
      h1Count: document.querySelectorAll("h1").length,
      scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
      clientWidth: doc.clientWidth,
      overflow: Math.max(doc.scrollWidth, body.scrollWidth) > doc.clientWidth + 1,
      linkCount: links.length,
      imageCount: images.length,
      focusableCount: focusables.length,
      overflowNodes
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const [name, route] of pages) {
    for (const width of widths) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        deviceScaleFactor: 1
      });
      await page.emulateMedia({ reducedMotion: "reduce" });

      const url = `${baseUrl}${route}`;
      const response = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      const inspection = await inspectPage(page);

      await page.screenshot({
        path: path.join(outputDir, `${name}-${width}.png`),
        fullPage: true
      });

      results.push({
        page: name,
        route,
        width,
        status: response ? response.status() : null,
        ...inspection
      });

      await page.close();
    }
  }

  await browser.close();

  fs.writeFileSync(
    path.join(outputDir, "visual-review-results.json"),
    JSON.stringify(results, null, 2)
  );

  const overflowCount = results.filter((result) => result.overflow).length;
  console.log(JSON.stringify({ outputDir, pages: pages.length, widths: widths.length, captures: results.length, overflowCount }, null, 2));

  if (overflowCount > 0) {
    process.exitCode = 1;
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
