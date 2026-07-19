const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const REPOSITORY_ROOT = path.resolve(__dirname, "..", "..");
const SITE_ORIGIN = "https://jeremyfontenot.online";
const EVIDENCE_CONFIG_PATH = path.join(REPOSITORY_ROOT, "scripts", "config", "evidence-pages.json");
const SITEMAP_PATH = path.join(REPOSITORY_ROOT, "sitemap.xml");
const GENERATED_MARKER = "GENERATED FILE — DO NOT EDIT DIRECTLY.";

const evidencePages = JSON.parse(fs.readFileSync(EVIDENCE_CONFIG_PATH, "utf8"));
const sitemapXml = fs.readFileSync(SITEMAP_PATH, "utf8");

function decodeXmlText(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function sitemapLocations(xml) {
  return [...xml.matchAll(/<(?:[A-Za-z_][\w.-]*:)?loc\b[^>]*>([\s\S]*?)<\/(?:[A-Za-z_][\w.-]*:)?loc>/gi)]
    .map((match) => decodeXmlText(match[1].trim()));
}

function localPathForCanonical(canonical) {
  const url = new URL(canonical);
  if (url.origin !== SITE_ORIGIN) {
    throw new Error(`Sitemap URL is not on the canonical origin: ${canonical}`);
  }
  return `${url.pathname}${url.search}` || "/";
}

function repositoryPath(relativePath) {
  return path.join(REPOSITORY_ROOT, ...relativePath.split("/"));
}

function browserPath(relativePath) {
  return `/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
}

function canonicalForOutput(output) {
  return new URL(browserPath(output), SITE_ORIGIN).href;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const sitemapLocs = sitemapLocations(sitemapXml);
const sitemapLocalPaths = sitemapLocs.map(localPathForCanonical);
const evidenceBrowserPaths = evidencePages.map((entry) => browserPath(entry.output));
const mainPublicPages = [
  "/",
  "/projects.html",
  "/on-prem-home-lab.html",
  "/proof.html",
  "/dashboard.html",
  "/resume.html",
  "/contact.html",
  "/home-lab-operations-proof.html",
  "/evidence-library/index.html",
  "/evidence/public/index.html",
  "/evidence-library/projects/on-prem-home-lab/infrastructure-validation-2026-07/",
];
const allPublicBrowserPaths = [...new Set([...mainPublicPages, ...sitemapLocalPaths])];
const responsiveBrowserPaths = ["/sitemap.xml", ...evidenceBrowserPaths];
const responsiveViewports = [
  { name: "390x844", width: 390, height: 844 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "1440x900", width: 1440, height: 900 },
];

// No console errors are currently allowlisted. Add only narrowly documented,
// harmless messages here if a browser release introduces one.
const harmlessConsoleErrors = [];

function createBrowserMonitor(page, testInfo, pagePath) {
  const failures = [];
  const responses = new Map();

  function addFailure(kind, detail, resourceUrl = pagePath) {
    failures.push({ kind, detail, resourceUrl });
  }

  const onPageError = (error) => {
    addFailure("pageerror", error.message);
  };

  const onConsole = (message) => {
    if (message.type() !== "error") {
      return;
    }
    if (harmlessConsoleErrors.some((pattern) => pattern.test(message.text()))) {
      return;
    }
    addFailure("console error", message.text());
  };

  const onRequestFailed = (request) => {
    addFailure(
      "failed request",
      request.failure()?.errorText || "Unknown browser request failure",
      request.url(),
    );
  };

  const onResponse = (response) => {
    let pathname = response.url();
    try {
      pathname = new URL(response.url()).pathname;
    } catch {
      // Retain the complete resource URL when it cannot be parsed.
    }
    responses.set(pathname, response.status());
    if (response.status() >= 400) {
      addFailure("HTTP response", `HTTP ${response.status()}`, response.url());
    }
  };

  page.on("pageerror", onPageError);
  page.on("console", onConsole);
  page.on("requestfailed", onRequestFailed);
  page.on("response", onResponse);

  return {
    failures,
    responses,
    addFailure,
    dispose() {
      page.off("pageerror", onPageError);
      page.off("console", onConsole);
      page.off("requestfailed", onRequestFailed);
      page.off("response", onResponse);
    },
    async assertClean() {
      await page.waitForTimeout(50);
      if (failures.length === 0) {
        return;
      }
      const artifactPath = path.relative(REPOSITORY_ROOT, testInfo.outputDir).split(path.sep).join("/");
      const testName = testInfo.titlePath.join(" > ");
      const details = failures.map((failure) => (
        `- ${failure.kind}: page=${pagePath} resource=${failure.resourceUrl} detail=${failure.detail}`
      ));
      throw new Error([
        `Browser failure in test: ${testName}`,
        ...details,
        `Failure artifacts: ${artifactPath}`,
      ].join("\n"));
    },
  };
}

async function monitoredGoto(page, testInfo, pagePath) {
  const monitor = createBrowserMonitor(page, testInfo, pagePath);
  let response = null;
  try {
    response = await page.goto(pagePath, { waitUntil: "load" });
  } catch (error) {
    monitor.addFailure("navigation error", error.message, pagePath);
  }
  if (!response) {
    monitor.addFailure("navigation error", "Navigation returned no HTTP response", pagePath);
  }
  await monitor.assertClean();
  return { monitor, response };
}

async function metadataValue(page, label) {
  const row = page.locator(".evidence-metadata > div").filter({
    has: page.locator("dt", { hasText: label }),
  });
  await expect(row).toHaveCount(1);
  return row.locator("dd");
}

async function expectNoPageOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}

test.describe("repository-driven browser inventory", () => {
  test("configuration and sitemap inventories are complete and unique", async () => {
    expect(Array.isArray(evidencePages)).toBe(true);
    expect(evidencePages.length).toBeGreaterThan(0);

    const sitemapUrlNodeCount = (sitemapXml.match(/<(?:[A-Za-z_][\w.-]*:)?url(?:\s[^>]*)?>/gi) || []).length;
    expect(sitemapLocs).toHaveLength(sitemapUrlNodeCount);
    expect(new Set(sitemapLocs).size).toBe(sitemapLocs.length);
    expect(sitemapLocs.some((location) => /\.md(?:[?#]|$)/i.test(location))).toBe(false);
    expect(sitemapXml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');

    const configuredSources = evidencePages.map((entry) => entry.source);
    const configuredOutputs = evidencePages.map((entry) => entry.output);
    expect(new Set(configuredSources).size).toBe(configuredSources.length);
    expect(new Set(configuredOutputs).size).toBe(configuredOutputs.length);

    for (const entry of evidencePages) {
      expect(fs.existsSync(repositoryPath(entry.source))).toBe(true);
      expect(fs.existsSync(repositoryPath(entry.output))).toBe(true);
      expect(sitemapLocs).toContain(canonicalForOutput(entry.output));
    }
  });

  test("main public pages prefer generated evidence URLs", async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    const configuredSourcePaths = new Set(evidencePages.map((entry) => `/${entry.source}`));

    for (const pagePath of mainPublicPages) {
      await test.step(pagePath, async () => {
        const { monitor } = await monitoredGoto(page, testInfo, pagePath);
        const rawConfiguredLinks = await page.locator("a[href]").evaluateAll((links, sourcePaths) => (
          links
            .map((link) => ({ href: link.getAttribute("href"), text: link.textContent.trim() }))
            .filter(({ href }) => {
              try {
                return sourcePaths.includes(new URL(href, document.baseURI).pathname);
              } catch {
                return false;
              }
            })
        ), [...configuredSourcePaths]);

        expect(rawConfiguredLinks, `${pagePath} contains visitor-facing configured Markdown links`).toEqual([]);
        await monitor.assertClean();
        monitor.dispose();
      });
    }
  });
});

test.describe("static server contract", () => {
  const representativeResources = [
    ["/index.html", /^text\/html\b/i],
    ["/sitemap.xml", /^application\/xml\b/i],
    ["/assets/sitemap.xsl", /^text\/xsl\b/i],
    ["/assets/css/sitemap.css", /^text\/css\b/i],
    ["/assets/js/site.js", /^text\/javascript\b/i],
    [browserPath(evidencePages[0].source), /^text\/markdown\b/i],
    ["/scripts/config/evidence-pages.json", /^application\/json\b/i],
    ["/evidence-library/projects/on-prem-home-lab/current-validated-state/claim-map.csv", /^text\/csv\b/i],
    ["/assets/data/home-lab-evidence-catalog.json", /^application\/json\b/i],
    ["/home-lab/source-to-destination-matrix.csv", /^text\/csv\b/i],
    ["/home-lab/duplicate-groups.json", /^application\/json\b/i],
    ["/home-lab/sensitive-data-review.json", /^application\/json\b/i],
    ["/home-lab/authoritative-source-decisions.json", /^application\/json\b/i],
    ["/assets/logos/header_logo_88x88.png", /^image\/png\b/i],
  ];

  for (const [resourcePath, expectedType] of representativeResources) {
    test(`serves ${resourcePath} with its expected MIME type`, async ({ request }) => {
      const response = await request.get(resourcePath);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toMatch(expectedType);
    });
  }

  test("resolves directory requests to index.html", async ({ request }) => {
    const response = await request.get("/evidence-library/projects/on-prem-home-lab/infrastructure-validation-2026-07/");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^text\/html\b/i);
  });

  test("serves the complete bounded Home Lab catalog contract", async ({ request }) => {
    const response = await request.get("/assets/data/home-lab-evidence-catalog.json");
    expect(response.status()).toBe(200);
    const catalog = await response.json();
    expect(catalog.totals.artifacts).toBe(catalog.records.length);
    expect(new Set(catalog.records.map((record) => record.id)).size).toBe(catalog.records.length);
    expect(catalog.totals.sensitiveDataReview.highSeveritySecretFindings).toBe(0);
    expect(catalog.boundaries.join(" ")).toContain("Personal nonproduction Home Lab evidence only.");
  });

  test("returns 404 for a nonexistent file", async ({ request }) => {
    const response = await request.get("/__playwright_missing_file__.html");
    expect(response.status()).toBe(404);
  });

  test("rejects path traversal without exposing repository content", async ({ request }) => {
    const response = await request.get("/%2e%2e%5cpackage.json");
    expect([403, 404]).toContain(response.status());
    expect(await response.text()).not.toContain("jeremyfontenot-portfolio");
  });

  test("rejects unsupported HTTP methods", async ({ request }) => {
    const response = await request.post("/index.html");
    expect(response.status()).toBe(405);
    expect(response.headers().allow).toBe("GET, HEAD");
  });
});

test.describe("public page browser health", () => {
  for (const pagePath of allPublicBrowserPaths) {
    test(`loads ${pagePath} without browser failures`, async ({ page }, testInfo) => {
      const { monitor, response } = await monitoredGoto(page, testInfo, pagePath);
      expect(response.status()).toBe(200);
      await expect(page.locator("body")).toBeVisible();
      await monitor.assertClean();
    });
  }
});

test.describe("sitemap XSLT presentation", () => {
  test("renders the standards-compliant XML as the branded sitemap", async ({ page }, testInfo) => {
    const { monitor, response } = await monitoredGoto(page, testInfo, "/sitemap.xml");
    expect(response.status()).toBe(200);

    await expect(page.locator("body.sitemap-page")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Website Sitemap");
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator('nav[aria-label="Primary navigation"]')).toBeVisible();
    await expect(page.locator("footer.site-footer.compact-footer")).toBeVisible();
    const skipLink = page.locator('a.skip-link[href="#sitemap-content"]');
    await expect(skipLink).toHaveCount(1);
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    expect(await skipLink.evaluate((link) => parseFloat(getComputedStyle(link).outlineWidth))).toBeGreaterThan(0);

    const logo = page.locator('.site-header img[alt="Jeremy Fontenot logo"]');
    await expect(logo).toBeVisible();
    expect(await logo.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);

    await expect(page.locator(".sitemap-count strong")).toHaveText(String(sitemapLocs.length));
    await expect(page.locator(".sitemap-entry")).toHaveCount(sitemapLocs.length);

    const renderedLinks = await page.locator(".sitemap-entry > a").evaluateAll((links) => (
      links.map((link) => link.getAttribute("href"))
    ));
    expect(renderedLinks).toEqual(sitemapLocs);
    expect(new Set(renderedLinks).size).toBe(renderedLinks.length);
    expect(renderedLinks.some((href) => /\.md(?:[?#]|$)/i.test(href))).toBe(false);

    expect(monitor.responses.get("/assets/sitemap.xsl")).toBe(200);
    expect(monitor.responses.get("/assets/css/sitemap.css")).toBe(200);

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("This XML file does not appear to have any style information associated with it.");
    expect(bodyText).not.toMatch(/XML Parsing Error|parsererror/i);
    await expectNoPageOverflow(page);
    await monitor.assertClean();
  });
});

test.describe("generated evidence pages", () => {
  for (const entry of evidencePages) {
    test(`validates ${entry.output}`, async ({ page }, testInfo) => {
      const pagePath = browserPath(entry.output);
      const expectedCanonical = canonicalForOutput(entry.output);
      const { monitor, response } = await monitoredGoto(page, testInfo, pagePath);
      expect(response.status()).toBe(200);
      const rawHtml = await response.text();

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(entry.title);
      await expect(page).toHaveTitle(new RegExp(escapeRegex(entry.title)));

      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveCount(1);
      await expect(canonical).toHaveAttribute("href", expectedCanonical);

      const robots = await page.locator('meta[name="robots"]').getAttribute("content");
      expect(robots || "").not.toMatch(/noindex/i);

      await expect(page.locator("header.site-header")).toBeVisible();
      await expect(page.locator('nav[aria-label="Primary navigation"]')).toBeVisible();
      await expect(page.locator("footer.site-footer.compact-footer")).toBeVisible();
      await expect(page.locator('.nav-links a[aria-current="page"]')).toHaveText("Proof");

      const skipLink = page.locator('a.skip-link[href="#evidence-content"]');
      await expect(skipLink).toHaveCount(1);
      await page.keyboard.press("Tab");
      await expect(skipLink).toBeFocused();
      expect(await skipLink.evaluate((link) => parseFloat(getComputedStyle(link).outlineWidth))).toBeGreaterThan(0);

      const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
      await expect(breadcrumbs).toBeVisible();
      await expect(breadcrumbs.locator('[aria-current="page"]')).toHaveText(entry.title);
      await expect(page.locator(".evidence-introduction .eyebrow")).toHaveText(entry.category);

      await expect(await metadataValue(page, "Source record")).toHaveText("Authoritative Markdown artifact");
      await expect(await metadataValue(page, "Source format")).toHaveText("Markdown");
      await expect(await metadataValue(page, "Presentation format")).toHaveText("Generated HTML");
      await expect(page.locator(".evidence-introduction")).not.toContainText(entry.source);
      await expect(page.locator(".evidence-introduction")).not.toContainText(path.posix.basename(entry.source));

      const sourceLinks = page.getByRole("link", { name: "View source Markdown" });
      expect(await sourceLinks.count()).toBeGreaterThan(0);
      const sourceHref = await sourceLinks.first().getAttribute("href");
      expect(sourceHref).toMatch(/\.md$/i);
      const sourceUrl = new URL(sourceHref, page.url());
      expect(sourceUrl.pathname).toBe(browserPath(entry.source));
      const sourceResponse = await page.request.get(sourceUrl.href);
      expect(sourceResponse.status()).toBe(200);
      expect(sourceResponse.headers()["content-type"]).toMatch(/^text\/markdown\b/i);

      const returnLinks = page.getByRole("link", { name: entry.returnLabel });
      expect(await returnLinks.count()).toBeGreaterThan(0);
      const returnHref = await returnLinks.first().getAttribute("href");
      const returnResponse = await page.request.get(new URL(returnHref, page.url()).href);
      expect(returnResponse.status()).toBe(200);

      expect(rawHtml).toContain(GENERATED_MARKER);
      expect(rawHtml).not.toMatch(/[A-Za-z]:[\\/](?:Users|home)[\\/]/i);
      expect(rawHtml).not.toMatch(/file:\/\//i);

      await expect(page.locator("iframe, object, embed, form")).toHaveCount(0);
      await expect(page.locator('script:not([src]):not([type="application/ld+json"])')).toHaveCount(0);
      const executableScripts = await page.locator("script[src]").evaluateAll((scripts) => (
        scripts.map((script) => new URL(script.src).pathname)
      ));
      expect(executableScripts).toEqual(["/assets/js/site.js"]);

      const inlineEventAttributes = await page.locator("*").evaluateAll((elements) => elements.flatMap((element) => (
        [...element.attributes]
          .filter((attribute) => /^on/i.test(attribute.name))
          .map((attribute) => `${element.tagName.toLowerCase()}[${attribute.name}]`)
      )));
      expect(inlineEventAttributes).toEqual([]);

      const unsafeUrls = await page.locator("[href], [src], [action]").evaluateAll((elements) => elements.flatMap((element) => (
        ["href", "src", "action"]
          .map((attribute) => element.getAttribute(attribute))
          .filter(Boolean)
          .filter((value) => /^(?:javascript|vbscript|data):/i.test(value))
      )));
      expect(unsafeUrls).toEqual([]);

      const documentBody = page.locator(".evidence-document");
      await expect(documentBody).toBeVisible();
      expect((await documentBody.innerText()).trim().length).toBeGreaterThan(0);

      const ids = await page.locator("[id]").evaluateAll((elements) => elements.map((element) => element.id));
      expect(new Set(ids).size).toBe(ids.length);

      const unresolvedFragments = await page.locator('a[href^="#"]').evaluateAll((links) => links.flatMap((link) => {
        const fragment = link.getAttribute("href").slice(1);
        if (!fragment) {
          return [];
        }
        let decoded = fragment;
        try {
          decoded = decodeURIComponent(fragment);
        } catch {
          return [fragment];
        }
        return document.getElementById(decoded) ? [] : [fragment];
      }));
      expect(unresolvedFragments).toEqual([]);

      const invalidTables = await documentBody.locator("table").evaluateAll((tables) => tables.flatMap((table, index) => {
        const wrapper = table.parentElement;
        const style = wrapper ? getComputedStyle(wrapper) : null;
        const valid = table.querySelector("thead")
          && table.querySelector("tbody")
          && table.querySelector("th")
          && wrapper?.classList.contains("evidence-table-scroll")
          && ["auto", "scroll"].includes(style?.overflowX);
        return valid ? [] : [index];
      }));
      expect(invalidTables).toEqual([]);

      const invalidCodeBlocks = await documentBody.locator("pre").evaluateAll((blocks) => blocks.flatMap((block, index) => (
        ["auto", "scroll"].includes(getComputedStyle(block).overflowX) ? [] : [index]
      )));
      expect(invalidCodeBlocks).toEqual([]);

      const invalidJsonLd = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.flatMap((script, index) => {
        try {
          JSON.parse(script.textContent);
          return [];
        } catch {
          return [index];
        }
      }));
      expect(invalidJsonLd).toEqual([]);

      const rawMarkdownLinks = await page.locator("a[href]").evaluateAll((links) => links.flatMap((link) => {
        const href = link.getAttribute("href");
        const pathname = new URL(href, location.href).pathname;
        if (!/\.md$/i.test(pathname)) {
          return [];
        }
        return /(?:source|markdown|compatibility)/i.test(link.textContent) ? [] : [href];
      }));
      expect(rawMarkdownLinks).toEqual([]);

      await expectNoPageOverflow(page);
      await monitor.assertClean();
    });
  }
});

test.describe("responsive page-level overflow", () => {
  test("legacy evidence footer links remain visible at 320 pixels", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const { monitor, response } = await monitoredGoto(page, testInfo, "/evidence-library/index.html");
    expect(response.status()).toBe(200);
    await expectNoPageOverflow(page);

    const clippedFooterLinks = await page.locator("footer .footer-links a").evaluateAll((links) => links.flatMap((link) => {
      const rect = link.getBoundingClientRect();
      return rect.left < 0 || rect.right > window.innerWidth
        ? [{ text: link.textContent.trim(), left: rect.left, right: rect.right }]
        : [];
    }));
    expect(clippedFooterLinks).toEqual([]);
    await monitor.assertClean();
  });

  for (const viewport of responsiveViewports) {
    test(`all sitemap and evidence pages fit ${viewport.name}`, async ({ page }, testInfo) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      for (const pagePath of responsiveBrowserPaths) {
        await test.step(pagePath, async () => {
          const { monitor, response } = await monitoredGoto(page, testInfo, pagePath);
          expect(response.status()).toBe(200);
          await expectNoPageOverflow(page);
          await monitor.assertClean();
          monitor.dispose();
        });
      }
    });
  }

  test("all sitemap and evidence pages reflow at 200 percent text size", async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const pagePath of responsiveBrowserPaths) {
      await test.step(pagePath, async () => {
        const { monitor, response } = await monitoredGoto(page, testInfo, pagePath);
        expect(response.status()).toBe(200);
        await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
        await expect(page.locator("h1")).toBeVisible();
        await expectNoPageOverflow(page);
        await monitor.assertClean();
        monitor.dispose();
      });
    }
  });
});
