const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const width of [390, 360]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      deviceScaleFactor: 1
    });

    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.goto(
      "http://127.0.0.1:4173/projects.html",
      { waitUntil: "networkidle", timeout: 45000 }
    );

    const result = await page.evaluate(() => {
      const describe = (element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);

        return {
          element:
            element.tagName.toLowerCase() +
            (element.id ? `#${element.id}` : "") +
            (
              typeof element.className === "string" &&
              element.className.trim()
                ? "." + element.className.trim().replace(/\s+/g, ".")
                : ""
            ),
          clientWidth: element.clientWidth,
          offsetWidth: element.offsetWidth,
          scrollWidth: element.scrollWidth,
          rectWidth: Math.round(rect.width),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          overflowX: style.overflowX,
          minWidth: style.minWidth,
          width: style.width,
          display: style.display,
          whiteSpace: style.whiteSpace,
          text: (element.textContent || "")
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, 140)
        };
      };

      return [...document.querySelectorAll("main, main *")]
        .filter(
          (element) =>
            element.scrollWidth > element.clientWidth + 1 ||
            element.scrollWidth > window.innerWidth + 1
        )
        .map(describe)
        .sort((a, b) => b.scrollWidth - a.scrollWidth);
    });

    console.log(`\n=== ${width}px viewport ===`);
    console.log(JSON.stringify(result, null, 2));

    await page.close();
  }

  await browser.close();
})();
