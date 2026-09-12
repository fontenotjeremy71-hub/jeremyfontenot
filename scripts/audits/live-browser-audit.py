#!/usr/bin/env python3
"""Live browser audit for jeremyfontenot.online.

The audit uses Playwright/Chrome against the deployed custom domain. It:
- visits every HTML page reachable from the public sitemap and internal links;
- inventories every visible anchor/button on every visited page;
- browser-clicks each unique visible link interaction;
- checks every same-origin destination for HTTP/navigation failure;
- applies semantic checks so visible CTA wording matches the destination;
- smoke-tests non-link buttons and the mobile menu;
- writes a JSON report for CI review.

This is intentionally a live-site audit, not only a repository href checker.
"""
from __future__ import annotations

import asyncio
import json
import os
import re
import sys
from collections import deque
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin, urlparse, urldefrag

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError

BASE = os.environ.get("PORTFOLIO_BASE_URL", "https://jeremyfontenot.online").rstrip("/")
REPORT = Path(os.environ.get("PORTFOLIO_BROWSER_AUDIT_REPORT", "artifacts/live-browser-audit.json"))
MAX_HTML_PAGES = int(os.environ.get("PORTFOLIO_BROWSER_AUDIT_MAX_PAGES", "300"))
NAV_TIMEOUT = int(os.environ.get("PORTFOLIO_BROWSER_NAV_TIMEOUT_MS", "20000"))
DESKTOP_UA = os.environ.get(
    "PORTFOLIO_BROWSER_USER_AGENT",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
)

SEEDS = [
    f"{BASE}/",
    f"{BASE}/systems-administration.html",
    f"{BASE}/projects.html",
    f"{BASE}/proof.html",
    f"{BASE}/dashboard.html",
    f"{BASE}/resume.html",
    f"{BASE}/contact.html",
    f"{BASE}/windows-laps-gpo.html",
    f"{BASE}/entra-cloud-sync.html",
    f"{BASE}/on-prem-home-lab.html",
    f"{BASE}/windows-admin-center-lab.html",
    f"{BASE}/infrastructure.html",
    f"{BASE}/app01-storage-expansion.html",
    f"{BASE}/home-lab-operations-proof.html",
    f"{BASE}/evidence-library/",
    f"{BASE}/evidence/claim-map.html",
    f"{BASE}/home-lab/evidence-catalog.html",
    f"{BASE}/microsoft-365/",
    f"{BASE}/systems-skills/",
]

FILE_OK = {".txt", ".json", ".csv", ".xml", ".md", ".pdf", ".docx", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".zip"}
EVIDENCE_WORDS = {"evidence", "proof", "validation", "validated", "artifact", "claim", "manifest", "inventory", "report", "result", "output"}


@dataclass
class Finding:
    level: str
    page: str
    label: str
    target: str
    detail: str


def clean_text(value: Optional[str]) -> str:
    return re.sub(r"\s+", " ", (value or "")).strip()


def norm_url(url: str) -> str:
    url, _frag = urldefrag(url)
    if not url:
        return url
    p = urlparse(url)
    path = p.path or "/"
    if path != "/" and path.endswith("//"):
        path = path.rstrip("/") + "/"
    return p._replace(path=path, fragment="").geturl()


def same_origin(url: str) -> bool:
    return urlparse(url).netloc.lower() == urlparse(BASE).netloc.lower()


def html_candidate(url: str) -> bool:
    p = urlparse(url)
    suffix = Path(p.path).suffix.lower()
    return (suffix in {"", ".html", ".htm"}) and not p.path.lower().endswith((".json", ".txt", ".csv", ".xml"))


def semantic_error(label: str, target: str, title: str, body_sample: str) -> Optional[str]:
    """Return a semantic mismatch message for high-confidence CTA wording."""
    l = label.lower()
    t = target.lower()
    hay = f"{title} {body_sample}".lower()
    path = urlparse(target).path.lower()
    suffix = Path(path).suffix.lower()

    if re.fullmatch(r"home", l) and path not in {"", "/", "/index.html"}:
        return "Home label does not land on the site home page"
    if "resume" in l and not ("resume" in path or suffix in {".pdf", ".docx"}):
        return "Resume/download-resume label does not land on a resume document/page"
    if re.fullmatch(r"contact|discuss role fit", l) and "contact" not in path and not t.startswith("mailto:"):
        return "Contact label does not land on contact/mail"
    if re.fullmatch(r"projects|view projects|review projects|review selected technical work", l) and "projects" not in path:
        return "Projects label does not land on the projects route"
    if "dashboard" in l and "dashboard" not in path:
        return "Dashboard label does not land on the dashboard"
    if "linkedin" in l and "linkedin.com" not in t:
        return "LinkedIn label does not land on linkedin.com"
    if re.fullmatch(r"github", l) and "github.com" not in t:
        return "GitHub label does not land on github.com"

    if any(word in l for word in ("evidence", "proof", "manifest", "claim map", "inventory", "validation output", "validation")):
        if suffix in FILE_OK:
            return None
        evidence_target = any(word in path for word in ("evidence", "proof", "manifest", "claim", "inventory", "validation", "catalog"))
        evidence_content = any(word in hay for word in EVIDENCE_WORDS)
        if not (evidence_target or evidence_content):
            return "Evidence/proof wording does not land on evidence/proof-oriented content"
        if path in {"/windows-laps-gpo.html", "/entra-cloud-sync.html", "/on-prem-home-lab.html"} and "case study" not in l:
            return "Evidence/proof CTA lands on a general case-study page instead of direct evidence"

    if "case study" in l and any(x in path for x in ("evidence-library", "/evidence/", "manifest", "claim-map")):
        return "Case-study CTA lands on an evidence artifact/index instead of the project narrative"
    if "manifest" in l and not ("manifest" in path or suffix == ".json" or "manifest" in hay):
        return "Manifest label does not land on manifest data"
    if "claim map" in l and not ("claim" in path or suffix == ".csv" or "claim" in hay):
        return "Claim-map label does not land on claim-map data"
    return None


async def wait_ready(page):
    try:
        await page.wait_for_load_state("domcontentloaded", timeout=NAV_TIMEOUT)
    except PlaywrightTimeoutError:
        pass
    try:
        await page.wait_for_timeout(250)
    except Exception:
        pass


async def goto_checked(page, url: str):
    try:
        response = await page.goto(url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)
        await wait_ready(page)
        status = response.status if response else None
        return status, None
    except Exception as exc:
        return None, f"{type(exc).__name__}: {exc}"


async def extract_interactions(page):
    return await page.locator("a[href], button").evaluate_all(
        """els => els.map((el, i) => ({
            index: i,
            tag: el.tagName.toLowerCase(),
            text: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').replace(/\\s+/g,' ').trim(),
            href: el.tagName.toLowerCase() === 'a' ? el.href : '',
            rawHref: el.tagName.toLowerCase() === 'a' ? (el.getAttribute('href') || '') : '',
            target: el.getAttribute('target') || '',
            visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
            disabled: !!el.disabled,
            type: el.getAttribute('type') || '',
            ariaExpanded: el.getAttribute('aria-expanded')
        }))"""
    )


async def click_unique_link(context, source_url: str, ordinal: int, expected_href: str):
    """Actually browser-click one link occurrence and return final URL/title/body info."""
    page = await context.new_page()
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    try:
        _status, nav_err = await goto_checked(page, source_url)
        if nav_err:
            return {"error": f"source navigation failed: {nav_err}", "url": page.url, "title": "", "body": "", "errors": errors}
        items = page.locator("a[href], button")
        count = await items.count()
        if ordinal >= count:
            return {"error": "interaction index changed after reload", "url": page.url, "title": "", "body": "", "errors": errors}
        el = items.nth(ordinal)
        tag = await el.evaluate("e => e.tagName.toLowerCase()")
        if tag != "a":
            return {"error": "not an anchor", "url": page.url, "title": "", "body": "", "errors": errors}
        href = await el.get_attribute("href") or ""
        absolute = urljoin(source_url, href)
        if absolute.startswith(("mailto:", "tel:")):
            return {"error": None, "url": absolute, "title": "", "body": "", "errors": errors}
        if Path(urlparse(absolute).path).suffix.lower() in {".pdf", ".docx", ".zip"}:
            try:
                async with page.expect_download(timeout=5000) as di:
                    await el.click(timeout=5000)
                download = await di.value
                return {"error": None, "url": absolute, "title": download.suggested_filename, "body": "download", "errors": errors}
            except Exception:
                pass
        try:
            await el.click(timeout=5000)
            await wait_ready(page)
        except Exception as exc:
            return {"error": f"click failed: {type(exc).__name__}: {exc}", "url": page.url, "title": "", "body": "", "errors": errors}
        title = clean_text(await page.title())
        try:
            body = clean_text(await page.locator("body").inner_text(timeout=5000))[:5000]
        except Exception:
            body = ""
        return {"error": None, "url": page.url, "title": title, "body": body, "errors": errors}
    finally:
        await page.close()


async def audit():
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    findings: list[Finding] = []
    pages_report = []
    clicked_keys = set()
    seen_pages = set()
    queue = deque(norm_url(u) for u in SEEDS)

    async with async_playwright() as p:
        # Use installed stable Chrome plus a normal desktop context. This avoids
        # treating a valid public site as broken merely because a CDN rejects a
        # default HeadlessChrome fingerprint.
        browser = await p.chromium.launch(
            channel="chrome",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"],
        )
        context = await browser.new_context(
            viewport={"width": 1440, "height": 1000},
            user_agent=DESKTOP_UA,
            locale="en-US",
            timezone_id="America/Chicago",
            extra_http_headers={
                "Accept-Language": "en-US,en;q=0.9",
                "Upgrade-Insecure-Requests": "1",
            },
        )
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        crawl_page = await context.new_page()
        js_errors = []
        crawl_page.on("pageerror", lambda exc: js_errors.append(str(exc)))

        while queue and len(seen_pages) < MAX_HTML_PAGES:
            url = norm_url(queue.popleft())
            if not url or url in seen_pages or not same_origin(url):
                continue
            seen_pages.add(url)
            status, err = await goto_checked(crawl_page, url)
            if err or (status is not None and status >= 400):
                findings.append(Finding("error", url, "PAGE", url, err or f"HTTP {status}"))
                pages_report.append({"url": url, "status": status, "error": err, "interactions": []})
                continue

            title = clean_text(await crawl_page.title())
            try:
                body_sample = clean_text(await crawl_page.locator("body").inner_text())[:5000]
            except Exception:
                body_sample = ""
            interactions = await extract_interactions(crawl_page)
            page_entry = {"url": url, "status": status, "title": title, "interactions": []}

            for item in interactions:
                label = clean_text(item.get("text")) or "(unlabeled)"
                if not item.get("visible") or item.get("disabled"):
                    continue
                if item["tag"] == "a":
                    raw = item.get("rawHref") or ""
                    target = item.get("href") or urljoin(url, raw)
                    if raw.startswith("#"):
                        target = f"{url}{raw}"
                    page_entry["interactions"].append({"kind": "link", "label": label, "target": target})

                    plain = norm_url(target)
                    if same_origin(plain) and html_candidate(plain) and plain not in seen_pages:
                        queue.append(plain)

                    key = (label.lower(), target)
                    if key not in clicked_keys:
                        clicked_keys.add(key)
                        result = await click_unique_link(context, url, item["index"], target)
                        if result["error"]:
                            findings.append(Finding("error", url, label, target, result["error"]))
                            continue
                        if result["errors"]:
                            findings.append(Finding("error", url, label, target, "JavaScript error after click: " + " | ".join(result["errors"][:3])))
                        final_url = result["url"] or target
                        if same_origin(target) and not target.startswith(("mailto:", "tel:")):
                            exp_path = urlparse(target).path.rstrip("/") or "/"
                            got_path = urlparse(final_url).path.rstrip("/") or "/"
                            if exp_path != got_path:
                                findings.append(Finding("error", url, label, target, f"Click landed on unexpected path {final_url}"))
                        sem = semantic_error(label, final_url or target, result["title"], result["body"])
                        if sem:
                            findings.append(Finding("error", url, label, target, sem))
                else:
                    page_entry["interactions"].append({"kind": "button", "label": label, "target": ""})

            pages_report.append(page_entry)

        for url in list(seen_pages):
            page = await context.new_page()
            local_errors = []
            page.on("pageerror", lambda exc: local_errors.append(str(exc)))
            status, err = await goto_checked(page, url)
            if err or (status and status >= 400):
                await page.close()
                continue
            buttons = page.locator("button:visible")
            count = await buttons.count()
            for i in range(count):
                b = buttons.nth(i)
                label = clean_text(await b.inner_text()) or clean_text(await b.get_attribute("aria-label")) or "(unlabeled button)"
                try:
                    await b.click(timeout=3000)
                    await page.wait_for_timeout(100)
                except Exception as exc:
                    findings.append(Finding("error", url, label, "", f"Button click failed: {type(exc).__name__}: {exc}"))
                if local_errors:
                    findings.append(Finding("error", url, label, "", "JavaScript error after button click: " + " | ".join(local_errors[:3])))
                    local_errors.clear()
            await page.close()

        mobile_context = await browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent=DESKTOP_UA,
            locale="en-US",
            timezone_id="America/Chicago",
            extra_http_headers={"Accept-Language": "en-US,en;q=0.9"},
        )
        await mobile_context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        mobile = await mobile_context.new_page()
        status, err = await goto_checked(mobile, f"{BASE}/")
        if not err and (status is None or status < 400):
            menu = mobile.get_by_role("button", name=re.compile("menu", re.I))
            if await menu.count():
                try:
                    before = await menu.first.get_attribute("aria-expanded")
                    await menu.first.click(timeout=3000)
                    after = await menu.first.get_attribute("aria-expanded")
                    if before == after == "false":
                        findings.append(Finding("error", f"{BASE}/", "Menu", "", "Mobile menu button did not expand navigation"))
                except Exception as exc:
                    findings.append(Finding("error", f"{BASE}/", "Menu", "", f"Mobile menu click failed: {exc}"))
        await mobile.close()
        await mobile_context.close()
        await crawl_page.close()
        await context.close()
        await browser.close()

    uniq = []
    seen_findings = set()
    for f in findings:
        key = (f.level, f.page, f.label, f.target, f.detail)
        if key not in seen_findings:
            seen_findings.add(key)
            uniq.append(f)

    report = {
        "baseUrl": BASE,
        "pagesVisited": len(seen_pages),
        "uniqueInteractionsClicked": len(clicked_keys),
        "findings": [asdict(f) for f in uniq],
        "pages": pages_report,
    }
    REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(f"Live browser audit visited {len(seen_pages)} HTML pages and browser-clicked {len(clicked_keys)} unique visible link interactions.")
    if uniq:
        print(f"Live browser audit FAILED with {len(uniq)} issue(s):")
        for f in uniq[:100]:
            print(f"- [{f.level}] {f.page} :: {f.label!r} -> {f.target or '(button)'} :: {f.detail}")
        if len(uniq) > 100:
            print(f"... {len(uniq)-100} additional findings are in {REPORT}")
        return 1
    print("Live browser audit PASSED: visible navigation/CTA interactions resolve and high-confidence labels match their destinations.")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(audit()))
