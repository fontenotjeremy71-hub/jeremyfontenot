const { test, expect } = require("@playwright/test");

test.describe("Projects catalog watermark", () => {
  for (const viewport of [{ width: 1024, height: 768 }, { width: 1440, height: 900 }]) {
    test(`renders a complete Projects label above the flagship card at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const response = await page.goto("/projects.html", { waitUntil: "networkidle" });
      expect(response.status()).toBe(200);

      const result = await page.locator(".project-catalog").evaluate((section) => {
        const pseudo = getComputedStyle(section, "::after");
        const card = section.querySelector(".flagship-project");
        const sectionRect = section.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const fontSize = Number.parseFloat(pseudo.fontSize) || 0;
        const parsedLineHeight = Number.parseFloat(pseudo.lineHeight);
        const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : fontSize;
        const top = Number.parseFloat(pseudo.top) || 0;

        return {
          content: pseudo.content.replace(/^['"]|['"]$/g, ""),
          maxWidth: pseudo.maxWidth,
          overflow: pseudo.overflow,
          watermarkBottom: top + lineHeight,
          cardOffset: cardRect.top - sectionRect.top,
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        };
      });

      expect(result.content).toBe("Projects");
      expect(result.maxWidth).toBe("none");
      expect(result.overflow).toBe("visible");
      expect(result.watermarkBottom).toBeLessThanOrEqual(result.cardOffset + 1);
      expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth + 2);
    });
  }

  test("removes the decorative watermark on narrow screens", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto("/projects.html", { waitUntil: "networkidle" });
    expect(response.status()).toBe(200);

    const content = await page.locator(".project-catalog").evaluate((section) => getComputedStyle(section, "::after").content);
    expect(content).toBe("none");
  });
});
