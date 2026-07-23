const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { screenshotPolicy } = require("../lib/responsive-visual-policy");

const root = path.resolve(__dirname, "..", "..");
const output = path.join(root, "artifacts", "redesign", "final");
const reportPath = path.join(output, "responsive-qa.json");
const origin = "http://127.0.0.1:4174";
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const sitemapRoutes = [...sitemap.matchAll(/<loc>https:\/\/jeremyfontenot\.online([^<]*)<\/loc>/g)]
  .map((match) => match[1] || "/");
const wrapperPrefix = "/evidence-library/preserved-sharepoint/wrappers/";
const linkIntegrityRoute = "/evidence-library/preserved-sharepoint/link-integrity.html";
const coreRoutes = sitemapRoutes.filter((route) => !route.startsWith(wrapperPrefix) && route !== linkIntegrityRoute);
const wrapperRoutes = sitemapRoutes.filter((route) => route.startsWith(wrapperPrefix)).sort((left, right) => left.localeCompare(right));

if (coreRoutes.length !== 32) throw new Error(`Expected 32 established core routes, found ${coreRoutes.length}.`);
if (!sitemapRoutes.includes(linkIntegrityRoute)) throw new Error(`Missing required link-integrity route: ${linkIntegrityRoute}`);
if (wrapperRoutes.length !== 802) throw new Error(`Expected 802 generated SharePoint wrappers, found ${wrapperRoutes.length}.`);

const wrapperSampleRoutes = [
  wrapperRoutes[0],
  wrapperRoutes[Math.floor(wrapperRoutes.length / 2)],
  wrapperRoutes[wrapperRoutes.length - 1],
];
const routes = [...coreRoutes, linkIntegrityRoute, ...wrapperSampleRoutes];
const viewports = [
  [320, 800], [360, 800], [375, 812], [390, 844], [414, 896], [768, 1024],
  [1024, 768], [1100, 800], [1200, 800], [1280, 800], [1366, 768], [1440, 900],
];
const dashboardOnlyViewports = [[900, 900], [1536, 864], [1920, 1080]];
const matrix = viewports
  .flatMap(([viewportWidth, viewportHeight]) => routes.map((route) => ({ route, viewportWidth, viewportHeight })))
  .concat(dashboardOnlyViewports.map(([viewportWidth, viewportHeight]) => ({
    route: "/dashboard.html",
    viewportWidth,
    viewportHeight,
  })));

const screenshotRoutes = new Set([
  "/",
  "/systems-administration.html",
  "/systems-skills/evidence-map.html",
  wrapperSampleRoutes[1],
]);
if (screenshotRoutes.size !== 4 || [...screenshotRoutes].some((route) => !routes.includes(route))) {
  throw new Error(`Responsive screenshot route contract is invalid: ${[...screenshotRoutes].join(", ")}`);
}

const issueFields = [
  "clippedElements",
  "pathologicalHeadingWraps",
  "narrowTextContainers",
  "brokenControls",
  "failedImages",
  "consoleErrors",
  "duplicateIds",
  "emptyLinks",
  "failedInternalLinks",
  "dashboardAssertions",
];

function slugFor(route) {
  return route === "/" ? "home" : route.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

function issueCount(result) {
  return issueFields.reduce((total, field) => total + (Array.isArray(result[field]) ? result[field].length : 0), 0);
}

async function mapLimit(values, limit, worker) {
  const results = new Array(values.length);
  let nextIndex = 0;
  async function run() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= values.length) return;
      results[index] = await worker(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, run));
  return results;
}

async function validateInternalLinks(urls) {
  const failures = new Map();
  await mapLimit(urls, 16, async (url) => {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) failures.set(url, { url, status: response.status, error: "" });
    } catch (error) {
      failures.set(url, { url, status: 0, error: error.message });
    }
  });
  return failures;
}

function failureShape(failureDescription, extra = {}) {
  return {
    selector: "a[href]",
    visibleTextExcerpt: "",
    elementType: "a",
    elementWidth: 0,
    elementHeight: 0,
    containerWidth: 0,
    renderedLineCount: 0,
    computedFontSize: 0,
    computedLineHeight: 0,
    scrollWidth: 0,
    clientWidth: 0,
    scrollHeight: 0,
    clientHeight: 0,
    overflowX: "visible",
    overflowY: "visible",
    layoutContext: {},
    failureDescription,
    ...extra,
  };
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  for (const entry of fs.readdirSync(output)) {
    if (/\.(?:png|json)$/i.test(entry)) fs.rmSync(path.join(output, entry), { force: true });
  }

  console.log(`Responsive route selection: ${coreRoutes.length} core, 1 link-integrity, ${wrapperSampleRoutes.length} SharePoint wrapper samples (${routes.length} total).`);
  console.log(`Inspecting ${matrix.length} page/viewport combinations and writing ${screenshotRoutes.size * viewports.length} representative screenshots.`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(15000);
  page.setDefaultTimeout(10000);

  const results = [];
  const allInternalLinks = new Set();
  let consoleMessages = [];
  let failedAssets = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleMessages.push(message.text());
  });
  page.on("pageerror", (error) => consoleMessages.push(error.message));
  page.on("response", (response) => {
    const resourceType = response.request().resourceType();
    if (response.status() >= 400 && ["document", "stylesheet", "script", "image", "font"].includes(resourceType)) {
      failedAssets.push({ url: response.url(), status: response.status(), resourceType });
    }
  });

  try {
    for (let index = 0; index < matrix.length; index += 1) {
      const { route, viewportWidth, viewportHeight } = matrix[index];
      consoleMessages = [];
      failedAssets = [];
      await page.setViewportSize({ width: viewportWidth, height: viewportHeight });

      const pageUrl = `${origin}${route}`;
      let response = null;
      let navigationError = "";
      try {
        response = await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.evaluate(async () => {
          document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
          if (document.fonts?.ready) {
            await Promise.race([
              document.fonts.ready,
              new Promise((resolve) => setTimeout(resolve, 1200)),
            ]);
          }
        });
      } catch (error) {
        navigationError = error.message;
      }

      const inspection = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const technicalSelector = [
          "pre", "code", ".evidence-article", ".source-code", ".command-output", ".raw-output",
          ".hash", "[data-immutable-evidence]", ".evidence-table-scroll", ".table-scroll",
        ].join(",");
        const scrollableSelector = [
          ".evidence-table-scroll", ".table-scroll", ".section-jump-nav", "[data-horizontal-scroll]",
        ].join(",");

        const normalized = (value) => String(value || "").trim().replace(/\s+/g, " ");
        const isVisible = (element) => {
          if (!(element instanceof Element) || element.closest("[hidden], [aria-hidden='true'], .sr-only")) return false;
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
        };
        const isTechnical = (element) => Boolean(element.closest(technicalSelector));
        const isDesignedToScroll = (element) => {
          if (element.closest(scrollableSelector)) return true;
          const style = getComputedStyle(element);
          return ["auto", "scroll"].includes(style.overflowX) || ["auto", "scroll"].includes(style.overflowY);
        };
        const selectorFor = (element) => {
          if (element.id) return `${element.tagName.toLowerCase()}#${CSS.escape(element.id)}`;
          const classes = [...element.classList].filter(Boolean).slice(0, 3).map((name) => `.${CSS.escape(name)}`).join("");
          return `${element.tagName.toLowerCase()}${classes}`;
        };
        const lineCount = (element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          const tops = [];
          for (const rect of range.getClientRects()) {
            if (rect.width <= 0.5 || rect.height <= 0.5) continue;
            if (!tops.some((top) => Math.abs(top - rect.top) <= 3)) tops.push(rect.top);
          }
          return Math.max(1, tops.length);
        };
        const describe = (element, failureDescription, extra = {}) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          const parentRect = element.parentElement?.getBoundingClientRect() || rect;
          return {
            selector: selectorFor(element),
            visibleTextExcerpt: normalized(element.innerText || element.textContent).slice(0, 180),
            elementType: element.tagName.toLowerCase(),
            elementWidth: Math.round(rect.width),
            elementHeight: Math.round(rect.height),
            containerWidth: Math.round(parentRect.width),
            renderedLineCount: lineCount(element),
            computedFontSize: Number.parseFloat(style.fontSize) || 0,
            computedLineHeight: Number.parseFloat(style.lineHeight) || 0,
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight,
            overflowX: style.overflowX,
            overflowY: style.overflowY,
            layoutContext: {},
            failureDescription,
            ...extra,
          };
        };
        const accessibleParts = (element) => {
          const labelledByIds = normalized(element.getAttribute("aria-labelledby")).split(" ").filter(Boolean);
          return {
            normalizedTextContent: normalized(element.textContent),
            normalizedInnerText: normalized(element.innerText),
            ariaLabel: normalized(element.getAttribute("aria-label")),
            ariaLabelledBy: labelledByIds.join(" "),
            labelledByText: normalized(labelledByIds.map((id) => document.getElementById(id)?.textContent || "").join(" ")),
            title: normalized(element.getAttribute("title")),
            descendantImageAltText: normalized([...element.querySelectorAll("img")].map((image) => image.alt || "").join(" ")),
            descendantSvgTitleText: normalized([...element.querySelectorAll("svg title")].map((title) => title.textContent || "").join(" ")),
          };
        };
        const accessibleName = (element) => {
          const parts = accessibleParts(element);
          return normalized([
            parts.normalizedTextContent,
            parts.ariaLabel,
            parts.labelledByText,
            parts.title,
            parts.descendantImageAltText,
            parts.descendantSvgTitleText,
          ].join(" "));
        };

        const textElements = [...document.querySelectorAll("h1, h2, h3, p, li, dd, dt, figcaption, a, button, label")]
          .filter(isVisible)
          .filter((element) => !isTechnical(element));

        const clippedElements = textElements
          .filter((element) => {
            if (isDesignedToScroll(element)) return false;
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return rect.left < -2
              || rect.right > viewportWidth + 2
              || (["hidden", "clip"].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 2)
              || (["hidden", "clip"].includes(style.overflowY) && element.scrollHeight > element.clientHeight + 2);
          })
          .slice(0, 50)
          .map((element) => describe(element, "Visible text is clipped or extends outside the viewport or containing region."));

        const pathologicalHeadingWraps = [...document.querySelectorAll("h1, h2, h3")]
          .filter(isVisible)
          .filter((element) => {
            const words = normalized(element.innerText || element.textContent).split(" ").filter(Boolean).length;
            const lines = lineCount(element);
            return words >= 4 && ((lines >= 5 && lines / words >= 0.75) || (viewportWidth >= 1024 && lines > 6));
          })
          .slice(0, 25)
          .map((element) => describe(element, "Heading wraps into an excessive number of lines or nearly one word per line."));

        const narrowTextContainers = [...document.querySelectorAll("p, li, dd, figcaption")]
          .filter(isVisible)
          .filter((element) => viewportWidth >= 768 && normalized(element.innerText || element.textContent).length >= 90
            && element.getBoundingClientRect().width < 240 && lineCount(element) >= 6)
          .slice(0, 25)
          .map((element) => describe(element, "Long-form text is compressed into an impractically narrow reading column."));

        const brokenControls = [...document.querySelectorAll("button, input, select, textarea, [role='button'], .button, .filter-button, .nav-links a")]
          .filter(isVisible)
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left < -2 || rect.right > viewportWidth + 2 || (!isDesignedToScroll(element) && element.scrollWidth > element.clientWidth + 2);
          })
          .slice(0, 50)
          .map((element) => describe(element, "Interactive control extends outside the viewport or clips its label."));

        const failedImages = [...document.images]
          .filter(isVisible)
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => describe(image, "Image failed to load."));

        const seenIds = new Set();
        const duplicateIds = [];
        for (const element of document.querySelectorAll("[id]")) {
          if (seenIds.has(element.id)) duplicateIds.push({ ...describe(element, "ID is duplicated in the document."), id: element.id });
          seenIds.add(element.id);
        }

        const emptyLinks = [...document.querySelectorAll("a[href]")]
          .filter(isVisible)
          .filter((link) => accessibleName(link) === "")
          .map((link) => {
            const parts = accessibleParts(link);
            return describe(link, "Link has no visible or accessible label.", {
              href: link.getAttribute("href") || "",
              resolvedHref: link.href,
              outerHTMLExcerpt: link.outerHTML.slice(0, 600),
              ...parts,
              pseudoBefore: getComputedStyle(link, "::before").content,
              pseudoAfter: getComputedStyle(link, "::after").content,
            });
          });

        const dashboardAssertions = [];
        if (document.body.classList.contains("dashboard-page")) {
          const layout = document.querySelector(".dashboard-page .split-layout");
          const chart = layout?.querySelector(".chart-panel");
          const note = layout?.querySelector(".scope-note-card");
          if (!layout || !chart || !note) {
            dashboardAssertions.push({ failureDescription: "Dashboard evidence-summary structure is incomplete." });
          } else {
            const chartRect = chart.getBoundingClientRect();
            const noteRect = note.getBoundingClientRect();
            if (viewportWidth > 980 && Math.abs(chartRect.top - noteRect.top) > 4) {
              dashboardAssertions.push(describe(note, "Dashboard chart and explanation columns are not top aligned."));
            }
            if (viewportWidth <= 980 && noteRect.top < chartRect.bottom - 2) {
              dashboardAssertions.push(describe(note, "Dashboard panels do not stack cleanly."));
            }
          }
        }

        const internalLinks = [...new Set([...document.querySelectorAll("a[href]")]
          .map((link) => link.href)
          .filter((href) => href.startsWith(`${location.origin}/`))
          .map((href) => href.split("#")[0]))];

        return {
          h1Count: document.querySelectorAll("h1").length,
          pageOverflowState: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
          pageScrollWidth: document.documentElement.scrollWidth,
          pageClientWidth: document.documentElement.clientWidth,
          documentHeight: document.documentElement.scrollHeight,
          clippedElements,
          pathologicalHeadingWraps,
          narrowTextContainers,
          brokenControls,
          failedImages,
          duplicateIds,
          emptyLinks,
          dashboardAssertions,
          internalLinks,
        };
      });

      for (const url of inspection.internalLinks) allInternalLinks.add(url);
      const shouldCapture = screenshotRoutes.has(route) && viewports.some(([width, height]) => width === viewportWidth && height === viewportHeight);
      let screenshotMode = "none";
      let screenshotReason = "not-selected";
      if (shouldCapture) {
        const capture = screenshotPolicy({
          route,
          requestedFullPage: true,
          documentHeight: inspection.documentHeight,
          viewportHeight,
        });
        screenshotMode = capture.mode;
        screenshotReason = capture.reason;
        await page.screenshot({
          path: path.join(output, `${slugFor(route)}-${viewportWidth}x${viewportHeight}.png`),
          fullPage: capture.fullPage,
          timeout: 15000,
        });
      }

      results.push({
        route,
        viewportWidth,
        viewportHeight,
        responseStatus: response ? response.status() : 0,
        navigationError,
        screenshotMode,
        screenshotReason,
        h1Count: inspection.h1Count,
        pageOverflowState: inspection.pageOverflowState,
        pageScrollWidth: inspection.pageScrollWidth,
        pageClientWidth: inspection.pageClientWidth,
        documentHeight: inspection.documentHeight,
        clippedElements: inspection.clippedElements,
        pathologicalHeadingWraps: inspection.pathologicalHeadingWraps,
        narrowTextContainers: inspection.narrowTextContainers,
        brokenControls: inspection.brokenControls,
        failedImages: [
          ...inspection.failedImages,
          ...failedAssets.map((asset) => failureShape(`Required ${asset.resourceType} asset returned HTTP ${asset.status}.`, asset)),
        ],
        consoleErrors: [...new Set(consoleMessages)].map((message) => failureShape("Browser console or page error occurred.", { selector: "window", error: message })),
        duplicateIds: inspection.duplicateIds,
        emptyLinks: inspection.emptyLinks,
        failedInternalLinks: [],
        dashboardAssertions: inspection.dashboardAssertions,
        internalLinks: inspection.internalLinks,
      });

      if ((index + 1) % 25 === 0 || index + 1 === matrix.length) {
        console.log(`Responsive review progress: ${index + 1}/${matrix.length} combinations inspected.`);
      }
    }

    console.log(`Validating ${allInternalLinks.size} unique internal destinations with bounded concurrency.`);
    const internalFailures = await validateInternalLinks([...allInternalLinks]);
    for (const result of results) {
      result.failedInternalLinks = result.internalLinks
        .filter((url) => internalFailures.has(url))
        .map((url) => {
          const failure = internalFailures.get(url);
          return failureShape(`Internal destination returned HTTP ${failure.status || "error"}.`, failure);
        });
      delete result.internalLinks;
    }

    fs.writeFileSync(reportPath, `${JSON.stringify(results, null, 2)}\n`, "utf8");
    const failures = results.filter((result) => result.responseStatus >= 400
      || result.navigationError
      || result.h1Count !== 1
      || result.pageOverflowState
      || issueCount(result) > 0);
    const boundedCaptures = results.filter((result) => result.screenshotReason.startsWith("bounded-")).length;
    const writtenCaptures = results.filter((result) => result.screenshotMode !== "none").length;
    console.log(`Responsive review complete: ${results.length} combinations, ${writtenCaptures} screenshots, ${boundedCaptures} bounded screenshots, ${failures.length} failures.`);

    for (const failure of failures) {
      console.error(JSON.stringify({
        route: failure.route,
        viewport: `${failure.viewportWidth}x${failure.viewportHeight}`,
        responseStatus: failure.responseStatus,
        navigationError: failure.navigationError,
        h1Count: failure.h1Count,
        pageOverflowState: failure.pageOverflowState,
        issues: Object.fromEntries(issueFields.map((field) => [field, failure[field]]).filter(([, issues]) => issues.length)),
      }));
    }
    if (failures.length) process.exitCode = 1;
  } catch (error) {
    fs.writeFileSync(reportPath, `${JSON.stringify({ fatalError: error.stack || error.message, partialResults: results }, null, 2)}\n`, "utf8");
    throw error;
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
