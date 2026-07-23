const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { screenshotPolicy } = require("../lib/responsive-visual-policy");

const root = path.resolve(__dirname, "..", "..");
const output = path.join(root, "artifacts", "redesign", "final");
const origin = "http://127.0.0.1:4174";
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const sitemapRoutes = [...sitemap.matchAll(/<loc>https:\/\/jeremyfontenot\.online([^<]*)<\/loc>/g)].map((match) => match[1] || "/");
const wrapperPrefix = "/evidence-library/preserved-sharepoint/wrappers/";
const linkIntegrityRoute = "/evidence-library/preserved-sharepoint/link-integrity.html";
const coreRoutes = sitemapRoutes.filter((route) => !route.startsWith(wrapperPrefix) && route !== linkIntegrityRoute);
const wrapperRoutes = sitemapRoutes.filter((route) => route.startsWith(wrapperPrefix)).sort((left, right) => left.localeCompare(right));

if (coreRoutes.length !== 32) {
  throw new Error(`Expected 32 established core routes, found ${coreRoutes.length}.`);
}
if (!sitemapRoutes.includes(linkIntegrityRoute)) {
  throw new Error(`Missing required link-integrity route: ${linkIntegrityRoute}`);
}
if (wrapperRoutes.length !== 802) {
  throw new Error(`Expected 802 generated SharePoint wrappers, found ${wrapperRoutes.length}.`);
}

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
const fullPageWidths = new Set([390, 768, 1024, 1100, 1200, 1280, 1366, 1440]);
const issueFields = [
  "clippedElements", "pathologicalHeadingWraps", "narrowTextContainers", "brokenControls",
  "failedImages", "consoleErrors", "duplicateIds", "emptyLinks", "failedInternalLinks", "dashboardAssertions",
];

function slugFor(route) {
  return route === "/" ? "home" : route.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

function issueCount(result) {
  return issueFields.reduce((total, field) => total + result[field].length, 0);
}

async function checkInternalLinks(urls, cache) {
  const failures = [];
  for (const url of urls) {
    if (!cache.has(url)) {
      try {
        const response = await fetch(url, { method: "HEAD", redirect: "follow" });
        cache.set(url, { ok: response.ok, status: response.status });
      } catch (error) {
        cache.set(url, { ok: false, status: 0, error: error.message });
      }
    }
    const result = cache.get(url);
    if (!result.ok) failures.push({ url, status: result.status, error: result.error || "" });
  }
  return failures;
}

(async () => {
  console.log(`Responsive route selection: ${coreRoutes.length} core, 1 link-integrity, ${wrapperSampleRoutes.length} SharePoint wrapper samples (${routes.length} total).`);
  console.log(`SharePoint wrapper samples: ${wrapperSampleRoutes.join(", ")}`);
  fs.mkdirSync(output, { recursive: true });
  for (const entry of fs.readdirSync(output)) {
    if (/\.(?:png|json)$/i.test(entry)) fs.rmSync(path.join(output, entry), { force: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  const results = [];
  const internalLinkCache = new Map();
  const matrix = viewports.flatMap(([width, height]) => routes.map((route) => ({ route, width, height, fullPage: fullPageWidths.has(width) })))
    .concat(dashboardOnlyViewports.map(([width, height]) => ({ route: "/dashboard.html", width, height, fullPage: true })));

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

  for (const { route, width, height, fullPage } of matrix) {
    consoleMessages = [];
    failedAssets = [];
    await page.setViewportSize({ width, height });

    const pageUrl = `${origin}${route}`;
    const response = await page.goto(pageUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    });

    const inspection = await page.evaluate(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const technicalSelector = [
        "pre", "code", ".evidence-article", ".source-code", ".command-output", ".raw-output",
        ".hash", "[data-immutable-evidence]", ".evidence-table-scroll", ".table-scroll",
      ].join(",");
      const scrollableSelector = [
        ".evidence-table-scroll", ".table-scroll", ".section-jump-nav", "[data-horizontal-scroll]",
      ].join(",");

      const isVisible = (element) => {
        if (!(element instanceof Element) || element.closest("[hidden], [aria-hidden='true'], .sr-only")) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
      };
      const isTechnical = (element) => Boolean(element.closest(technicalSelector));
      const isDesignedToScroll = (element) => {
        const scrollParent = element.closest(scrollableSelector);
        if (scrollParent) return true;
        const style = getComputedStyle(element);
        return ["auto", "scroll"].includes(style.overflowX) || ["auto", "scroll"].includes(style.overflowY);
      };
      const textOf = (element) => (element.innerText || element.textContent || "").trim().replace(/\s+/g, " ");
      const accessibleNameParts = (element) => {
        const domText = (element.textContent || "").trim().replace(/\s+/g, " ");
        const labelledByIds = (element.getAttribute("aria-labelledby") || "").split(/\s+/).filter(Boolean);
        const labelledByText = labelledByIds.map((id) => document.getElementById(id)?.textContent || "").join(" ").trim().replace(/\s+/g, " ");
        const imageText = [...element.querySelectorAll("img")].map((image) => image.alt || "").join(" ").trim().replace(/\s+/g, " ");
        const svgText = [...element.querySelectorAll("svg title")].map((title) => title.textContent || "").join(" ").trim().replace(/\s+/g, " ");
        const ariaLabel = element.getAttribute("aria-label") || "";
        const title = element.getAttribute("title") || "";
        return { domText, labelledByIds, labelledByText, imageText, svgText, ariaLabel, title };
      };
      const accessibleName = (element) => {
        const parts = accessibleNameParts(element);
        return `${parts.domText} ${parts.ariaLabel} ${parts.labelledByText} ${parts.imageText} ${parts.svgText} ${parts.title}`
          .trim().replace(/\s+/g, " ");
      };
      const selectorFor = (element) => {
        if (element.id) return `${element.tagName.toLowerCase()}#${CSS.escape(element.id)}`;
        const classes = [...element.classList].filter(Boolean).slice(0, 3).map((name) => `.${CSS.escape(name)}`).join("");
        const parent = element.parentElement;
        const siblings = parent ? [...parent.children].filter((child) => child.tagName === element.tagName) : [];
        const nth = siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(element) + 1})` : "";
        return `${element.tagName.toLowerCase()}${classes}${nth}`;
      };
      const lineMetrics = (element) => {
        const style = getComputedStyle(element);
        const fontSize = Number.parseFloat(style.fontSize) || 16;
        const parsed = Number.parseFloat(style.lineHeight);
        const lineHeight = Number.isFinite(parsed) ? parsed : fontSize * 1.2;
        const range = document.createRange();
        range.selectNodeContents(element);
        const rects = [...range.getClientRects()].filter((rect) => rect.width > 0.5 && rect.height > 0.5).sort((a, b) => a.top - b.top || a.left - b.left);
        const tops = [];
        for (const rect of rects) {
          if (!tops.some((top) => Math.abs(top - rect.top) <= Math.max(2, lineHeight * 0.3))) tops.push(rect.top);
        }
        return { lines: Math.max(1, tops.length), fontSize, lineHeight };
      };
      const describe = (element, failureDescription, extra = {}) => {
        const rect = element.getBoundingClientRect();
        const parent = element.parentElement;
        const parentRect = parent ? parent.getBoundingClientRect() : rect;
        const metrics = lineMetrics(element);
        const parentStyle = parent ? getComputedStyle(parent) : null;
        const siblingWidths = parent && ["grid", "flex"].includes(parentStyle.display)
          ? [...parent.children].filter(isVisible).map((child) => Math.round(child.getBoundingClientRect().width))
          : [];
        return {
          selector: selectorFor(element),
          visibleTextExcerpt: textOf(element).slice(0, 180),
          elementType: element.tagName.toLowerCase(),
          elementWidth: Math.round(rect.width),
          elementHeight: Math.round(rect.height),
          containerWidth: Math.round(parentRect.width),
          renderedLineCount: metrics.lines,
          computedFontSize: Number(metrics.fontSize.toFixed(2)),
          computedLineHeight: Number(metrics.lineHeight.toFixed(2)),
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          scrollHeight: element.scrollHeight,
          clientHeight: element.clientHeight,
          overflowX: getComputedStyle(element).overflowX,
          overflowY: getComputedStyle(element).overflowY,
          layoutContext: parentStyle ? { display: parentStyle.display, gridTemplateColumns: parentStyle.gridTemplateColumns, siblingWidths } : {},
          failureDescription,
          ...extra,
        };
      };
      const pageIssue = (failureDescription, extra = {}) => ({
        selector: "html", visibleTextExcerpt: "", elementType: "html", elementWidth: document.documentElement.clientWidth,
        elementHeight: document.documentElement.clientHeight, containerWidth: viewportWidth, renderedLineCount: 0,
        computedFontSize: 0, computedLineHeight: 0, scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth, scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight, overflowX: getComputedStyle(document.documentElement).overflowX,
        overflowY: getComputedStyle(document.documentElement).overflowY, layoutContext: {}, failureDescription, ...extra,
      });
      const overlaps = (left, right, tolerance = 1) => left.left < right.right - tolerance && left.right > right.left + tolerance && left.top < right.bottom - tolerance && left.bottom > right.top + tolerance;

      const clippedElements = [...document.querySelectorAll("h1, h2, h3, p, li, dd, dt, figcaption, a, button, label")]
        .filter(isVisible).filter((element) => !isTechnical(element) && !isDesignedToScroll(element))
        .filter((element) => {
          const style = getComputedStyle(element);
          const clipsX = ["hidden", "clip"].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 2;
          const clipsY = ["hidden", "clip"].includes(style.overflowY) && element.scrollHeight > element.clientHeight + 2;
          const card = element.closest("article, aside, [class*='card'], .chart-panel");
          if (!card || card === element) return clipsX || clipsY;
          const rect = element.getBoundingClientRect();
          const cardRect = card.getBoundingClientRect();
          return clipsX || clipsY || rect.left < cardRect.left - 2 || rect.right > cardRect.right + 2 || rect.bottom > cardRect.bottom + 2;
        }).map((element) => describe(element, "Visible text is clipped or extends outside its containing card."));

      const pathologicalHeadingWraps = [...document.querySelectorAll("h1, h2, h3")]
        .filter(isVisible).filter((element) => !isTechnical(element))
        .filter((element) => {
          const words = textOf(element).split(/\s+/).filter(Boolean).length;
          const { lines, fontSize } = lineMetrics(element);
          const width = element.getBoundingClientRect().width;
          const nearlyOneWordPerLine = words >= 4 && lines >= 5 && lines / words >= 0.75;
          const excessiveLines = (viewportWidth >= 1024 && lines > 6) || (viewportWidth >= 768 && viewportWidth < 1024 && lines > 7) || (viewportWidth < 768 && lines > 9);
          const pathologicallyNarrow = viewportWidth >= 768 && width < fontSize * 5.5 && lines >= 4;
          return nearlyOneWordPerLine || excessiveLines || pathologicallyNarrow;
        }).map((element) => describe(element, "Heading wraps into an excessive number of lines or nearly one word per line."));

      const narrowTextContainers = [...document.querySelectorAll("p, li, dd, figcaption")]
        .filter(isVisible).filter((element) => !isTechnical(element))
        .filter((element) => {
          const text = textOf(element);
          if (text.length < 90 || viewportWidth < 768) return false;
          const rect = element.getBoundingClientRect();
          const { lines, fontSize } = lineMetrics(element);
          const averageCharacters = text.length / Math.max(lines, 1);
          const minimumReadableWidth = Math.max(240, fontSize * 17);
          return rect.width < minimumReadableWidth && lines >= 6 && averageCharacters < 28;
        }).map((element) => describe(element, "Long-form text is compressed into an impractically narrow reading column."));

      const brokenControls = [];
      for (const element of document.querySelectorAll("button, input, select, textarea, [role='button'], .button, .filter-button, .nav-links a")) {
        if (!isVisible(element) || isTechnical(element)) continue;
        const rect = element.getBoundingClientRect();
        const lines = lineMetrics(element).lines;
        if (rect.left < -2 || rect.right > viewportWidth + 2) brokenControls.push(describe(element, "Interactive control extends outside the viewport."));
        else if (textOf(element) && lines > 2) brokenControls.push(describe(element, "Interactive control label wraps pathologically."));
        else if (element.scrollWidth > element.clientWidth + 2 && !isDesignedToScroll(element)) brokenControls.push(describe(element, "Interactive control label is clipped."));
      }
      for (const container of document.querySelectorAll(".nav, .nav-links, .project-filter-bar, .filter-toolbar, .compact-footer-links, .compact-footer-contact, .bar-chart li")) {
        if (!isVisible(container)) continue;
        const containerRect = container.getBoundingClientRect();
        const children = [...container.children].filter(isVisible);
        children.forEach((child) => {
          const rect = child.getBoundingClientRect();
          if (!isDesignedToScroll(container) && (rect.left < containerRect.left - 2 || rect.right > containerRect.right + 2 || rect.bottom > containerRect.bottom + 2)) {
            brokenControls.push(describe(child, "Control, chart label, or navigation item extends outside its container."));
          }
        });
        for (let index = 0; index < children.length; index += 1) {
          for (let other = index + 1; other < children.length; other += 1) {
            if (overlaps(children[index].getBoundingClientRect(), children[other].getBoundingClientRect(), 2)) {
              brokenControls.push(describe(children[other], "Neighboring controls, navigation items, or chart labels collide."));
            }
          }
        }
      }
      for (const card of document.querySelectorAll("article, aside, [class*='card'], .chart-panel")) {
        if (!isVisible(card) || isTechnical(card) || isDesignedToScroll(card)) continue;
        const parent = card.parentElement;
        if (!parent || !isVisible(parent)) continue;
        const parentStyle = getComputedStyle(parent);
        if (!["grid", "flex"].includes(parentStyle.display)) continue;
        const rect = card.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        if (rect.left < parentRect.left - 2 || rect.right > parentRect.right + 2) {
          brokenControls.push(describe(card, "Card extends outside its parent grid or flex container."));
        }
        const visibleChildren = [...card.children].filter(isVisible);
        if (visibleChildren.length) {
          const lastBottom = Math.max(...visibleChildren.map((child) => child.getBoundingClientRect().bottom));
          const unused = rect.bottom - lastBottom;
          if (rect.height > 520 && unused > 260 && unused > rect.height * 0.45 && getComputedStyle(card).minHeight === "0px") {
            brokenControls.push(describe(card, "Broken grid sizing creates excessive blank space inside the card."));
          }
        }
      }
      for (const hidden of document.querySelectorAll("[hidden]")) {
        if (getComputedStyle(hidden).display !== "none") brokenControls.push(describe(hidden, "Content marked hidden is visibly rendered."));
      }

      const failedImages = [...document.images].filter(isVisible).filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => describe(image, "Image failed to load."));
      const duplicateIds = [...document.querySelectorAll("[id]")].reduce((issues, element) => {
        if (document.querySelectorAll(`#${CSS.escape(element.id)}`).length > 1 && !issues.some((issue) => issue.id === element.id)) {
          issues.push({ ...describe(element, "ID is duplicated in the document."), id: element.id });
        }
        return issues;
      }, []);
      const emptyLinks = [...document.querySelectorAll("a[href]")].filter(isVisible)
        .filter((link) => accessibleName(link) === "")
        .map((link) => {
          const parts = accessibleNameParts(link);
          const before = getComputedStyle(link, "::before").content;
          const after = getComputedStyle(link, "::after").content;
          return describe(link, "Link has no visible or accessible label.", {
            href: link.getAttribute("href") || "",
            resolvedHref: link.href,
            outerHTMLExcerpt: link.outerHTML.slice(0, 600),
            normalizedTextContent: (link.textContent || "").trim().replace(/\s+/g, " "),
            normalizedInnerText: (link.innerText || "").trim().replace(/\s+/g, " "),
            ariaLabel: parts.ariaLabel,
            ariaLabelledBy: parts.labelledByIds.join(" "),
            labelledByText: parts.labelledByText,
            title: parts.title,
            descendantImageAltText: parts.imageText,
            descendantSvgTitleText: parts.svgText,
            pseudoBefore: before,
            pseudoAfter: after,
          });
        });
      const internalLinks = [...new Set([...document.querySelectorAll("a[href]")].map((link) => link.href)
        .filter((href) => href.startsWith(`${location.origin}/`)).map((href) => href.split("#")[0]))];

      const dashboardAssertions = [];
      if (document.body.classList.contains("dashboard-page")) {
        const layout = document.querySelector(".dashboard-page .split-layout");
        const chart = layout?.querySelector(".chart-panel");
        const note = layout?.querySelector(".scope-note-card");
        const heading = note?.querySelector("h2");
        const paragraph = note?.querySelector("p:not(.eyebrow)");
        const overlapTolerance = 2;
        if (!layout || !chart || !note || !heading || !paragraph) {
          dashboardAssertions.push(pageIssue("Dashboard evidence-summary structure is incomplete."));
        } else {
          const layoutRect = layout.getBoundingClientRect();
          const chartRect = chart.getBoundingClientRect();
          const noteRect = note.getBoundingClientRect();
          const headingMetrics = lineMetrics(heading);
          const paragraphMetrics = lineMetrics(paragraph);
          if (chartRect.left < layoutRect.left - overlapTolerance || chartRect.right > layoutRect.right + overlapTolerance) dashboardAssertions.push(describe(chart, "Dashboard chart extends outside the split layout."));
          if (noteRect.left < layoutRect.left - overlapTolerance || noteRect.right > layoutRect.right + overlapTolerance) dashboardAssertions.push(describe(note, "Dashboard scope note extends outside the split layout."));
          if (overlaps(chartRect, noteRect, overlapTolerance)) dashboardAssertions.push(describe(note, "Dashboard chart and scope note overlap."));
          if (headingMetrics.lines > (viewportWidth >= 1200 ? 4 : viewportWidth >= 768 ? 6 : 8)) dashboardAssertions.push(describe(heading, "Dashboard scope heading wraps into too many lines."));
          if (paragraphMetrics.lines > (viewportWidth >= 1200 ? 12 : viewportWidth >= 768 ? 18 : 24)) dashboardAssertions.push(describe(paragraph, "Dashboard scope paragraph wraps into too many lines."));
        }
      }

      return { clippedElements, pathologicalHeadingWraps, narrowTextContainers, brokenControls, failedImages, duplicateIds, emptyLinks, internalLinks, dashboardAssertions };
    });

    const failedInternalLinks = await checkInternalLinks(inspection.internalLinks, internalLinkCache);
    const result = {
      route,
      width,
      height,
      pageStatus: response?.status() || 0,
      clippedElements: inspection.clippedElements,
      pathologicalHeadingWraps: inspection.pathologicalHeadingWraps,
      narrowTextContainers: inspection.narrowTextContainers,
      brokenControls: inspection.brokenControls,
      failedImages: [...inspection.failedImages, ...failedAssets],
      consoleErrors: [...new Set(consoleMessages)],
      duplicateIds: inspection.duplicateIds,
      emptyLinks: inspection.emptyLinks,
      failedInternalLinks,
      dashboardAssertions: inspection.dashboardAssertions,
    };
    results.push(result);

    if (fullPage) {
      await page.screenshot({ path: path.join(output, `${slugFor(route)}-${width}.png`), fullPage: true });
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(output, "responsive-qa.json"), JSON.stringify(results, null, 2));

  const failures = results.filter((result) => result.pageStatus >= 400 || issueCount(result) > 0);
  const captures = results.filter((result) => fullPageWidths.has(result.width)).length;
  console.log(`Responsive review complete: ${results.length} page/viewport combinations inspected, ${captures} bounded long-page captures written.`);
  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
