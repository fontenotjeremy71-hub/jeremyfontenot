const { test, expect } = require("@playwright/test");

const mappingRoutes = [
  "/systems-skills/evidence-map.html",
  "/evidence/claim-map.html",
];

function lineCount(element) {
  const style = getComputedStyle(element);
  const fontSize = Number.parseFloat(style.fontSize) || 16;
  const parsed = Number.parseFloat(style.lineHeight);
  const lineHeight = Number.isFinite(parsed) ? parsed : fontSize * 1.2;
  const range = document.createRange();
  range.selectNodeContents(element);
  const tops = [];
  for (const rect of [...range.getClientRects()].filter((item) => item.width > 0.5 && item.height > 0.5)) {
    if (!tops.some((top) => Math.abs(top - rect.top) <= Math.max(2, lineHeight * 0.3))) tops.push(rect.top);
  }
  return Math.max(1, tops.length);
}

test.describe("Phase 4 evidence map responsive quality", () => {
  test("mapping indexes keep readable cards and bounded headings at 1024 pixels", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1024, height: 768 });

    for (const route of mappingRoutes) {
      const response = await page.goto(route, { waitUntil: "networkidle" });
      expect(response.status()).toBe(200);
      const layout = await page.locator(".mapping-grid").evaluate((grid) => {
        const countLines = (element) => {
          const style = getComputedStyle(element);
          const fontSize = Number.parseFloat(style.fontSize) || 16;
          const parsed = Number.parseFloat(style.lineHeight);
          const lineHeight = Number.isFinite(parsed) ? parsed : fontSize * 1.2;
          const range = document.createRange();
          range.selectNodeContents(element);
          const tops = [];
          for (const rect of [...range.getClientRects()].filter((item) => item.width > 0.5 && item.height > 0.5)) {
            if (!tops.some((top) => Math.abs(top - rect.top) <= Math.max(2, lineHeight * 0.3))) tops.push(rect.top);
          }
          return Math.max(1, tops.length);
        };
        const cards = [...grid.querySelectorAll(".mapping-card")].filter((card) => !card.hidden);
        const columns = getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length;
        const widths = cards.slice(0, 24).map((card) => card.getBoundingClientRect().width);
        const headingFailures = cards.flatMap((card) => {
          const heading = card.querySelector("h3");
          if (!heading) return [];
          const lines = countLines(heading);
          return lines > 6 ? [{ text: heading.textContent.trim(), lines, width: heading.getBoundingClientRect().width }] : [];
        });
        return {
          columns,
          minimumSampleCardWidth: widths.length ? Math.min(...widths) : 0,
          headingFailures,
          pageClientWidth: document.documentElement.clientWidth,
          pageScrollWidth: document.documentElement.scrollWidth,
        };
      });

      expect(layout.columns).toBeLessThanOrEqual(2);
      expect(layout.minimumSampleCardWidth).toBeGreaterThanOrEqual(320);
      expect(layout.headingFailures).toEqual([]);
      expect(layout.pageScrollWidth).toBeLessThanOrEqual(layout.pageClientWidth + 2);
    }
  });

  test("every visible evidence-map link has an accessible name at wide desktop", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    const response = await page.goto("/systems-skills/evidence-map.html", { waitUntil: "networkidle" });
    expect(response.status()).toBe(200);
    const failures = await page.locator("a[href]").evaluateAll((links) => links.flatMap((link) => {
      const style = getComputedStyle(link);
      const rect = link.getBoundingClientRect();
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0 || rect.width <= 0 || rect.height <= 0) return [];
      const labelledBy = (link.getAttribute("aria-labelledby") || "").split(/\s+/).filter(Boolean)
        .map((id) => document.getElementById(id)?.textContent || "").join(" ");
      const imageText = [...link.querySelectorAll("img")].map((image) => image.alt || "").join(" ");
      const svgText = [...link.querySelectorAll("svg title")].map((title) => title.textContent || "").join(" ");
      const name = `${link.textContent || ""} ${link.getAttribute("aria-label") || ""} ${labelledBy} ${imageText} ${svgText} ${link.getAttribute("title") || ""}`
        .trim().replace(/\s+/g, " ");
      return name ? [] : [{ href: link.getAttribute("href"), html: link.outerHTML.slice(0, 300) }];
    }));
    expect(failures).toEqual([]);
  });
});
