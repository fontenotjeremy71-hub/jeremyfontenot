const { test, expect } = require("@playwright/test");

const routes = [
  "/",
  "/systems-administration.html",
  "/projects.html",
  "/proof.html",
  "/dashboard.html",
  "/resume.html",
  "/contact.html",
  "/systems-skills/evidence-map.html",
  "/evidence/claim-map.html",
];

const viewports = [
  { width: 390, height: 844, minimumInset: 7 },
  { width: 1440, height: 900, minimumInset: 14 },
];

test.describe("site-wide text alignment rail", () => {
  for (const viewport of viewports) {
    test(`primary and generated pages keep hero text inset at ${viewport.width}px`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.setViewportSize(viewport);

      for (const route of routes) {
        const response = await page.goto(route, { waitUntil: "networkidle" });
        expect(response.status(), route).toBe(200);

        const layout = await page.evaluate(() => {
          const heading = document.querySelector("main h1");
          if (!heading) return { missingHeading: true };

          const stage = heading.closest(".hero, .page-hero, .page, .section");
          if (!stage) return { missingStage: true };

          const range = document.createRange();
          range.selectNodeContents(heading);
          const textRects = [...range.getClientRects()].filter((rect) => rect.width > 0.5 && rect.height > 0.5);
          const textLeft = textRects.length ? Math.min(...textRects.map((rect) => rect.left)) : heading.getBoundingClientRect().left;
          const stageRect = stage.getBoundingClientRect();
          const stageStyle = getComputedStyle(stage);
          const stageContentEdge = stageRect.left + (Number.parseFloat(stageStyle.paddingLeft) || 0);

          return {
            inset: textLeft - stageContentEdge,
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
          };
        });

        expect(layout.missingHeading, `${route} is missing a main heading`).not.toBe(true);
        expect(layout.missingStage, `${route} is missing a hero/page container`).not.toBe(true);
        expect(layout.inset, `${route} heading text touches the outer content edge`).toBeGreaterThanOrEqual(viewport.minimumInset);
        expect(layout.scrollWidth, `${route} has horizontal overflow`).toBeLessThanOrEqual(layout.clientWidth + 2);
      }
    });
  }

  test("generated evidence heroes align every direct copy element", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    for (const route of ["/systems-skills/evidence-map.html", "/evidence/claim-map.html"]) {
      const response = await page.goto(route, { waitUntil: "networkidle" });
      expect(response.status(), route).toBe(200);

      const insets = await page.locator(".page-hero").evaluate((hero) => {
        const heroRect = hero.getBoundingClientRect();
        const heroStyle = getComputedStyle(hero);
        const contentEdge = heroRect.left + (Number.parseFloat(heroStyle.paddingLeft) || 0);

        const contentLeft = (element) => {
          if (element.matches(".actions")) {
            const firstAction = element.querySelector("a, button");
            return firstAction ? firstAction.getBoundingClientRect().left : element.getBoundingClientRect().left;
          }
          const range = document.createRange();
          range.selectNodeContents(element);
          const rects = [...range.getClientRects()].filter((rect) => rect.width > 0.5 && rect.height > 0.5);
          return rects.length ? Math.min(...rects.map((rect) => rect.left)) : element.getBoundingClientRect().left;
        };

        return [...hero.querySelectorAll(":scope > .eyebrow, :scope > h1, :scope > .lead, :scope > .actions")]
          .map((element) => ({
            element: element.tagName.toLowerCase(),
            className: element.className,
            inset: contentLeft(element) - contentEdge,
          }));
      });

      expect(insets.length, route).toBeGreaterThanOrEqual(4);
      for (const item of insets) {
        expect(item.inset, `${route} ${item.element}.${item.className} touches the panel edge`).toBeGreaterThanOrEqual(14);
      }
    }
  });
});
