#!/usr/bin/env python3
"""Browser-validate every published portfolio page and visible interaction."""
from __future__ import annotations

import asyncio
import json
import os
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from urllib.parse import unquote, urldefrag, urljoin, urlparse

from playwright.async_api import TimeoutError as PlaywrightTimeoutError
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[2]
BASE = os.environ.get("PORTFOLIO_BASE_URL", "https://jeremyfontenot.online").rstrip("/")
REPORT = Path(os.environ.get("PORTFOLIO_BROWSER_AUDIT_REPORT", "artifacts/live-browser-audit.json"))
MAX_PAGES = int(os.environ.get("PORTFOLIO_BROWSER_AUDIT_MAX_PAGES", "5000"))
WORKERS = int(os.environ.get("PORTFOLIO_BROWSER_AUDIT_WORKERS", "8"))
VIEWPORT_WIDTH = int(os.environ.get("PORTFOLIO_BROWSER_VIEWPORT_WIDTH", "1440"))
NAV_TIMEOUT = int(os.environ.get("PORTFOLIO_BROWSER_NAV_TIMEOUT_MS", "25000"))
ORIGIN = urlparse(BASE).netloc.lower()
DOCUMENT_SUFFIXES = {"", ".html", ".htm"}
EVIDENCE_SUFFIXES = {".txt", ".md", ".json", ".csv", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".pdf"}


@dataclass(frozen=True)
class Finding:
    category: str
    source: str
    label: str
    target: str
    detail: str


def clean(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def publication_paths() -> list[str]:
    manifest = json.loads((ROOT / "config/publication-manifest.json").read_text(encoding="utf-8"))
    paths: set[str] = set()
    for item in ROOT.iterdir():
        if item.is_file() and item.suffix.lower() in manifest["rootExtensions"]:
            paths.add(item.relative_to(ROOT).as_posix())
    for directory in manifest["directories"]:
        base = ROOT / directory
        if base.exists():
            paths.update(item.relative_to(ROOT).as_posix() for item in base.rglob("*.html") if item.is_file())
    return sorted(paths)


def public_route(relative: str) -> str:
    if relative == "index.html":
        return "/"
    if relative.endswith("/index.html"):
        return "/" + relative[: -len("index.html")]
    return "/" + relative


def canonical_page_path(url: str) -> str:
    path = unquote(urlparse(url).path or "/")
    if path.endswith("/index.html"):
        return path[: -len("index.html")]
    return path


def is_internal(url: str) -> bool:
    parsed = urlparse(url)
    return not parsed.netloc or parsed.netloc.lower() == ORIGIN


def is_document_url(url: str) -> bool:
    return Path(urlparse(url).path).suffix.lower() in DOCUMENT_SUFFIXES


def semantic_error(label: str, target: str, title: str, heading: str, sample: str) -> str | None:
    label_l = label.lower()
    path_l = urlparse(target).path.lower()
    target_l = target.lower()
    content = f"{title} {heading} {sample}".lower()
    suffix = Path(path_l).suffix.lower()
    if re.fullmatch(r"(?:view|open|download|review)?\s*(?:resume|résumé)", label_l):
        if "resume" not in path_l and suffix not in {".pdf", ".docx"}:
            return "Resume wording does not land on the resume page or document"
    if re.fullmatch(r"contact|contact me|get in touch|discuss role fit", label_l):
        if "contact" not in path_l and not target_l.startswith("mailto:") and "contact" not in content:
            return "Contact wording does not land on a contact page, section, or method"
    evidence_promise = bool(re.fullmatch(r"(?:(?:view|open|review|inspect|browse|supporting|validation)\s+)?evidence(?:\s+(?:catalog|library|record|records|index))?|(?:view|open)\s+(?:validation|supporting)\s+evidence", label_l))
    if evidence_promise:
        evidence_path = any(term in path_l for term in ("evidence", "validation", "catalog", "claim-map", "proof")) or suffix in EVIDENCE_SUFFIXES
        evidence_content = any(term in content for term in ("evidence", "validation", "artifact", "manifest", "inventory", "proof"))
        if not evidence_path and not evidence_content:
            return "Evidence wording does not land on evidence-oriented content"
        if re.search(r"/(?:windows-laps-gpo|entra-cloud-sync|on-prem-home-lab)\.html$", path_l):
            return "Evidence wording lands on a narrative project page instead of direct evidence"
    if re.fullmatch(r"(?:view|read|open|review)\s+(?:the\s+)?(?:case study|project|project details)|case study", label_l):
        if any(term in path_l for term in ("evidence-library", "/evidence/", "evidence-catalog", "claim-map")):
            return "Case-study wording lands on an evidence record instead of the project narrative"
    if re.fullmatch(r"(?:view|open|review|inspect)?\s*(?:proof|proof summary|proof index|supporting proof)", label_l):
        if "proof" not in path_l and "claim map" not in content:
            return "Proof wording does not land on a recruiter-facing proof summary"
    if "linkedin" == label_l and "linkedin.com" not in target_l:
        return "LinkedIn label does not land on LinkedIn"
    if "github" == label_l and "github.com" not in target_l:
        return "GitHub label does not land on GitHub"
    return None


async def goto(page, url: str):
    try:
        response = await page.goto(url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)
        await page.wait_for_timeout(150)
        return response.status if response else None, None
    except Exception as exc:  # Playwright includes the failed URL in its message.
        return None, f"{type(exc).__name__}: {exc}"


async def inspect_page(context, route: str, semaphore: asyncio.Semaphore):
    url = BASE + route
    async with semaphore:
        page = await context.new_page()
        page_errors: list[str] = []
        page.on("pageerror", lambda exc: page_errors.append(str(exc)))
        try:
            status, error = await goto(page, url)
            if error or (status is not None and status >= 400):
                return {"route": route, "url": url, "status": status, "error": error, "title": "", "heading": "", "sample": "", "ids": [], "interactions": [], "overflow": False, "pageErrors": page_errors}
            button_errors = []
            menu = page.locator('.nav-toggle').first
            if await menu.count() and await menu.is_visible():
                await menu.click()
                if await menu.get_attribute('aria-expanded') != 'true':
                    button_errors.append('Menu did not open')
                await page.keyboard.press('Escape')
                if await menu.get_attribute('aria-expanded') != 'false':
                    button_errors.append('Escape did not close Menu')
            mapping = page.locator('[data-mapping-root]')
            if await mapping.count():
                await page.locator('[data-mapping-page-size]').select_option('96')
            inspection_script = (
                """() => {
                  const clean = value => (value || '').replace(/\\s+/g, ' ').trim();
                  const css = prop => getComputedStyle(prop);
                  const hoverSelectors = [];
                  const collect = rules => {
                    for (const rule of rules || []) {
                      if (rule.selectorText && rule.selectorText.includes(':hover')) hoverSelectors.push(...rule.selectorText.split(',').map(x => x.trim()));
                      if (rule.cssRules) collect(rule.cssRules);
                    }
                  };
                  for (const sheet of document.styleSheets) { try { collect(sheet.cssRules); } catch {} }
                  const hoverCovered = el => hoverSelectors.some(selector => {
                    try { return el.matches(selector.replace(/:hover/g, '').replace(/:focus-visible/g, '').replace(/:focus/g, '')); } catch { return false; }
                  });
                  const interactions = [...document.querySelectorAll('a[href], button')].filter(el => !el.disabled && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)).map((el, index) => {
                    const before = css(el);
                    const baseline = {outline: before.outline, boxShadow: before.boxShadow, borderColor: before.borderColor, backgroundColor: before.backgroundColor, color: before.color};
                    try { el.focus({preventScroll: true}); } catch {}
                    const after = css(el);
                    const focusVisible = el.matches(':focus-visible');
                    const focusChanged = baseline.outline !== after.outline || baseline.boxShadow !== after.boxShadow || baseline.borderColor !== after.borderColor || baseline.backgroundColor !== after.backgroundColor || baseline.color !== after.color;
                    return {
                      index, tag: el.tagName.toLowerCase(), label: clean(el.innerText) || clean(el.getAttribute('aria-label')) || clean(el.getAttribute('title')) || clean(el.querySelector('img')?.alt),
                      href: el.tagName === 'A' ? el.href : '', rawHref: el.tagName === 'A' ? (el.getAttribute('href') || '') : '',
                      target: el.getAttribute('target') || '', rel: el.getAttribute('rel') || '', type: el.getAttribute('type') || '',
                      hoverCovered: hoverCovered(el), focusVisible, focusChanged,
                      context: el.closest('header') ? 'header' : el.closest('footer') ? 'footer' : el.closest('nav') ? 'nav' : 'main', generatedMap: !!el.closest('[data-mapping-grid]')
                    };
                  });
                  return {
                    title: clean(document.title), heading: clean(document.querySelector('h1')?.innerText), sample: clean(document.body?.innerText).slice(0, 4000),
                    ids: [...document.querySelectorAll('[id]')].filter(el => el.id === 'main' || !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)).map(el => el.id), interactions,
                    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
                  };
                }"""
            )
            result = await page.evaluate(inspection_script)
            if await mapping.count():
                next_buttons = page.locator('[data-mapping-next]')
                previous_buttons = page.locator('[data-mapping-previous]')
                for index in range(await next_buttons.count()):
                    await next_buttons.nth(index).click()
                    if 'Page 2 of' not in await page.locator('[data-mapping-page]').first.inner_text():
                        button_errors.append(f'Next button {index} did not advance')
                    await previous_buttons.nth(index).click()
                    if 'Page 1 of' not in await page.locator('[data-mapping-page]').first.inner_text():
                        button_errors.append(f'Previous button {index} did not return')
                await page.locator('[data-mapping-reset]').click()
                if await page.locator('[data-mapping-page-size]').input_value() != '24':
                    button_errors.append('Reset filters did not restore defaults')
                await page.locator('[data-mapping-page-size]').select_option('96')
                for _ in range(100):
                    if await next_buttons.first.is_disabled():
                        break
                    await next_buttons.first.click()
                    state = await page.evaluate(inspection_script)
                    result['interactions'].extend(item for item in state['interactions'] if item.get('generatedMap'))
                else:
                    button_errors.append('Evidence map exceeded 100 pages')
            return {"route": route, "url": page.url, "status": status, "error": None, "pageErrors": page_errors, "buttonErrors": button_errors, **result}
        finally:
            await page.close()


async def audit() -> int:
    routes = [public_route(path) for path in publication_paths()]
    if len(routes) > MAX_PAGES:
        print(f"Publication inventory contains {len(routes)} pages, exceeding the configured cap of {MAX_PAGES}.", file=sys.stderr)
        return 1
    findings: list[Finding] = []
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
        context = await browser.new_context(viewport={"width": VIEWPORT_WIDTH, "height": 1000}, locale="en-US", timezone_id="America/Chicago")
        semaphore = asyncio.Semaphore(WORKERS)
        pages = await asyncio.gather(*(inspect_page(context, route, semaphore) for route in routes))
        by_path = {canonical_page_path(page["url"]): page for page in pages if not page["error"]}

        interactions: list[dict] = []
        unique_assets: set[str] = set()
        unique_external: set[str] = set()
        for page in pages:
            if page["error"] or (page["status"] is not None and page["status"] >= 400):
                findings.append(Finding("page-load", page["route"], "PAGE", page["url"], page["error"] or f"HTTP {page['status']}"))
                continue
            if page["pageErrors"]:
                findings.append(Finding("javascript", page["route"], "PAGE", page["url"], " | ".join(page["pageErrors"][:3])))
            for error in page.get('buttonErrors', []):
                findings.append(Finding('button-behavior', page['route'], 'BUTTON', page['url'], error))
            if page["overflow"]:
                findings.append(Finding("layout", page["route"], "PAGE", page["url"], f"Horizontal overflow at {VIEWPORT_WIDTH}px"))
            for item in page["interactions"]:
                item = {**item, "source": page["route"]}
                interactions.append(item)
                label = item["label"] or "(unlabeled)"
                if not item["label"]:
                    findings.append(Finding("accessibility", page["route"], label, item["href"], "Visible interactive element has no accessible label"))
                if not item["hoverCovered"]:
                    findings.append(Finding("hover", page["route"], label, item["href"], "No matching :hover rule found"))
                if not item["focusVisible"] or not item["focusChanged"]:
                    findings.append(Finding("focus", page["route"], label, item["href"], "No changed :focus-visible presentation detected"))
                if item["tag"] == "button":
                    if not item["type"]:
                        findings.append(Finding("accessibility", page["route"], label, "", "Button has no explicit type"))
                    continue
                target = item["href"]
                if target.startswith(("mailto:", "tel:")):
                    if target.startswith("mailto:") and "@" not in target:
                        findings.append(Finding("target", page["route"], label, target, "Malformed email destination"))
                    continue
                if is_internal(target):
                    if item["target"].lower() == "_blank":
                        findings.append(Finding("opening-behavior", page["route"], label, target, "Internal destination opens a new tab"))
                    target_url, fragment = urldefrag(target)
                    target_path = canonical_page_path(target_url)
                    if is_document_url(target_url):
                        destination = by_path.get(target_path)
                        if not destination:
                            findings.append(Finding("target", page["route"], label, target, "Internal HTML destination was not browser-visited from the publication inventory"))
                        else:
                            if fragment and unquote(fragment) not in destination["ids"]:
                                findings.append(Finding("fragment", page["route"], label, target, f"Fragment #{unquote(fragment)} is absent from the rendered destination"))
                            mismatch = semantic_error(label, target, destination["title"], destination["heading"], destination["sample"])
                            if mismatch:
                                findings.append(Finding("semantics", page["route"], label, target, mismatch))
                    else:
                        unique_assets.add(target_url)
                else:
                    unique_external.add(target)
                    if item["target"].lower() == "_blank" and "noopener" not in item["rel"].lower():
                        findings.append(Finding("opening-behavior", page["route"], label, target, "New external tab lacks rel=noopener"))

        asset_results = {}
        async def inspect_asset(target):
            async with semaphore:
                try:
                    response = await context.request.get(target, timeout=NAV_TIMEOUT)
                    asset_results[target] = response.status
                    if response.status >= 400:
                        findings.append(Finding("target", "publication", "ASSET", target, f"HTTP {response.status}"))
                except Exception as exc:
                    asset_results[target] = None
                    findings.append(Finding("target", "publication", "ASSET", target, f"{type(exc).__name__}: {exc}"))
        await asyncio.gather(*(inspect_asset(target) for target in sorted(unique_assets)))

        external_results = {}
        for target in sorted(unique_external):
            page = await context.new_page()
            status, error = await goto(page, target)
            title = ""
            if not error:
                try:
                    await page.wait_for_timeout(400)
                    title = clean(await asyncio.wait_for(page.title(), timeout=5))
                except Exception:
                    title = "Navigation continued after the initial response"
            external_results[target] = {"status": status, "error": error, "title": title, "finalUrl": page.url}
            expected_auth_wall = status == 999 and "linkedin.com" in urlparse(target).netloc.lower()
            if error or (status is not None and status >= 400 and not expected_auth_wall):
                findings.append(Finding("external", "publication", "EXTERNAL", target, error or f"HTTP {status}"))
            await asyncio.wait_for(page.close(), timeout=10)

        await context.close()
        await browser.close()

    unique_findings = sorted(set(findings), key=lambda item: (item.category, item.source, item.label, item.target, item.detail))
    report = {
        "baseUrl": BASE,
        "viewportWidth": VIEWPORT_WIDTH,
        "validationMethod": "Every manifest-listed HTML page and each unique destination were loaded in Chromium; visible interactions were inspected in the rendered DOM.",
        "totals": {
            "pagesInInventory": len(routes), "pagesVisited": len(pages), "visibleInteractions": len(interactions),
            "visibleLinks": sum(1 for item in interactions if item["tag"] == "a"), "visibleButtons": sum(1 for item in interactions if item["tag"] == "button"),
            "uniqueInternalAssets": len(unique_assets), "uniqueExternalDestinations": len(unique_external), "findings": len(unique_findings)
        },
        "findings": [asdict(item) for item in unique_findings], "assetResults": asset_results, "externalResults": external_results, "pages": pages
    }
    REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Live browser audit visited {len(pages)} of {len(routes)} published HTML pages and inspected {len(interactions)} visible interactions.")
    if unique_findings:
        print(f"Live browser audit FAILED with {len(unique_findings)} issue(s):")
        for item in unique_findings[:100]:
            print(f"- [{item.category}] {item.source} :: {item.label!r} -> {item.target or '(button)'} :: {item.detail}")
        if len(unique_findings) > 100:
            print(f"... {len(unique_findings) - 100} additional findings are recorded in {REPORT}")
        return 1
    print("Live browser audit PASSED: no automated load, target, fragment, semantic-contract, focus, hover-rule, or layout failures were found.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(asyncio.run(audit()))
    except PlaywrightTimeoutError as exc:
        print(f"Live browser audit timed out: {exc}", file=sys.stderr)
        sys.exit(1)
