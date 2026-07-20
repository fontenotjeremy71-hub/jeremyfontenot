const { test, expect } = require("@playwright/test");

const mappingRoutes = [
  "/systems-skills/evidence-map.html",
  "/evidence/claim-map.html",
];

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

  test("skill summary descriptions retain readable width at 1024 pixels", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1024, height: 768 });
    const response = await page.goto("/systems-skills/evidence-map.html", { waitUntil: "networkidle" });
    expect(response.status()).toBe(200);
    const result = await page.locator(".skill-summary-grid").evaluate((grid) => {
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
      const columns = getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length;
      const descriptions = [...grid.querySelectorAll("dd")];
      const narrow = descriptions.flatMap((item) => {
        const rect = item.getBoundingClientRect();
        const lines = countLines(item);
        return rect.width < 320 && lines >= 6 ? [{ text: item.textContent.trim(), width: rect.width, lines }] : [];
      });
      return { columns, narrow };
    });
    expect(result.columns).toBe(1);
    expect(result.narrow).toEqual([]);
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

  test("evidence-map cards and links retain readable contrast on mobile and desktop", async ({ page }) => {
    test.setTimeout(180_000);

    for (const viewport of [{ width: 320, height: 800 }, { width: 1440, height: 900 }]) {
      await page.setViewportSize(viewport);
      for (const route of mappingRoutes) {
        const response = await page.goto(route, { waitUntil: "networkidle" });
        expect(response.status()).toBe(200);
        const result = await page.evaluate(() => {
          const parseColor = (value) => {
            const match = String(value).match(/rgba?\(([^)]+)\)/i);
            if (!match) return null;
            const parts = match[1].split(/[,/\s]+/).filter(Boolean).map(Number);
            return { r: parts[0], g: parts[1], b: parts[2], a: Number.isFinite(parts[3]) ? parts[3] : 1 };
          };
          const effectiveBackground = (element) => {
            let current = element;
            while (current) {
              const color = parseColor(getComputedStyle(current).backgroundColor);
              if (color && color.a > 0.99) return color;
              current = current.parentElement;
            }
            return { r: 255, g: 255, b: 255, a: 1 };
          };
          const channel = (value) => {
            const normalized = value / 255;
            return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
          };
          const luminance = (color) => 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
          const ratio = (foreground, background) => {
            const light = Math.max(luminance(foreground), luminance(background));
            const dark = Math.min(luminance(foreground), luminance(background));
            return (light + 0.05) / (dark + 0.05);
          };
          const visible = (element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
          };
          const selectors = [
            ".mapping-summary > *",
            ".skill-summary-card",
            ".mapping-card",
            ".mapping-filters",
          ];
          const containers = selectors.flatMap((selector) => [...document.querySelectorAll(selector)]).filter(visible).slice(0, 40);
          const containerFailures = containers.flatMap((element) => {
            const foreground = parseColor(getComputedStyle(element).color);
            const background = effectiveBackground(element);
            const contrast = foreground ? ratio(foreground, background) : 0;
            return contrast >= 4.5 ? [] : [{
              selector: element.matches(".mapping-card") ? ".mapping-card" : element.className,
              foreground: getComputedStyle(element).color,
              background: getComputedStyle(element).backgroundColor,
              contrast,
              text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 100),
            }];
          });
          const links = [...document.querySelectorAll(".mapping-card a, .skill-summary-card a, .mapping-filters a")].filter(visible).slice(0, 40);
          const linkFailures = links.flatMap((link) => {
            const foreground = parseColor(getComputedStyle(link).color);
            const background = effectiveBackground(link);
            const contrast = foreground ? ratio(foreground, background) : 0;
            return contrast >= 4.5 ? [] : [{ href: link.getAttribute("href"), foreground: getComputedStyle(link).color, contrast }];
          });
          return { sampledContainers: containers.length, containerFailures, linkFailures };
        });
        expect(result.sampledContainers).toBeGreaterThan(0);
        expect(result.containerFailures).toEqual([]);
        expect(result.linkFailures).toEqual([]);
      }
    }
  });
});
