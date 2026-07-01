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
      const metrics = () => ({
        windowInnerWidth: window.innerWidth,
        documentClientWidth: document.documentElement.clientWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        bodyClientWidth: document.body.clientWidth,
        bodyOffsetWidth: document.body.offsetWidth,
        bodyScrollWidth: document.body.scrollWidth,
        bodyRect: (() => {
          const rect = document.body.getBoundingClientRect();
          return {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width)
          };
        })()
      });

      const bodyStyle = getComputedStyle(document.body);

      const pseudoDetails = (element, pseudo) => {
        const style = getComputedStyle(element, pseudo);

        return {
          pseudo,
          content: style.content,
          display: style.display,
          position: style.position,
          width: style.width,
          minWidth: style.minWidth,
          left: style.left,
          right: style.right,
          marginLeft: style.marginLeft,
          marginRight: style.marginRight,
          transform: style.transform
        };
      };

      const initial = metrics();

      const topLevel = [...document.body.children].map((element) => {
        const rect = element.getBoundingClientRect();

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
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        };
      });

      const pseudoCandidates = [];

      for (const element of [
        document.documentElement,
        document.body,
        ...document.querySelectorAll("body *")
      ]) {
        for (const pseudo of ["::before", "::after"]) {
          const style = getComputedStyle(element, pseudo);

          if (
            style.display !== "none" &&
            style.content !== "none" &&
            style.content !== "normal"
          ) {
            pseudoCandidates.push({
              element:
                element.tagName.toLowerCase() +
                (element.id ? `#${element.id}` : "") +
                (
                  typeof element.className === "string" &&
                  element.className.trim()
                    ? "." + element.className.trim().replace(/\s+/g, ".")
                    : ""
                ),
              ...pseudoDetails(element, pseudo)
            });
          }
        }
      }

      const style = document.createElement("style");
      style.id = "overflow-pseudo-test";
      style.textContent = `
        html::before,
        html::after,
        body::before,
        body::after {
          content: none !important;
          display: none !important;
        }
      `;
      document.head.appendChild(style);

      const withoutHtmlBodyPseudos = metrics();

      style.textContent = `
        *::before,
        *::after {
          content: none !important;
          display: none !important;
        }
      `;

      const withoutAllPseudos = metrics();
      style.remove();

      return {
        initial,
        bodyComputedStyle: {
          width: bodyStyle.width,
          minWidth: bodyStyle.minWidth,
          maxWidth: bodyStyle.maxWidth,
          marginLeft: bodyStyle.marginLeft,
          marginRight: bodyStyle.marginRight,
          paddingLeft: bodyStyle.paddingLeft,
          paddingRight: bodyStyle.paddingRight,
          overflowX: bodyStyle.overflowX,
          boxSizing: bodyStyle.boxSizing
        },
        htmlBefore: pseudoDetails(document.documentElement, "::before"),
        htmlAfter: pseudoDetails(document.documentElement, "::after"),
        bodyBefore: pseudoDetails(document.body, "::before"),
        bodyAfter: pseudoDetails(document.body, "::after"),
        withoutHtmlBodyPseudos,
        withoutAllPseudos,
        topLevel,
        pseudoCandidates: pseudoCandidates.slice(0, 40)
      };
    });

    console.log(`\n=== ${width}px viewport ===`);
    console.log(JSON.stringify(result, null, 2));

    await page.close();
  }

  await browser.close();
})();
