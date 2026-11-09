#!/usr/bin/env python3
"""Chrome smoke test: rendered Jekyll routes at mobile, tablet and desktop widths."""
from __future__ import annotations
import argparse
import functools
import json
import re
import shutil
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts/validation"))
from browser_cdp import Browser  # noqa: E402

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

CHECKS = r"""(() => {
  const css = [...document.styleSheets].some(x => x.href && x.href.includes('assets/css/style.css'));
  const experience = [...document.styleSheets].some(x => x.href && x.href.includes('assets/css/experience.css'));
  const header = document.querySelector('header.site-header');
  const footer = document.querySelector('footer.site-footer');
  const logo = document.querySelector('header.site-header img');
  const heroHeading = document.querySelector('.hero h1');
  const portrait = document.querySelector('.hero .portrait-orbit');
  const portraitImage = portrait?.querySelector('img');
  const heroHeadingLines = heroHeading ?
    Math.round(heroHeading.getBoundingClientRect().height / parseFloat(getComputedStyle(heroHeading).lineHeight)) : null;
  return {
    title: document.title,
    header: !!header,
    footer: !!footer,
    main: !!document.querySelector('main#main'),
    css,
    experience,
    bodyFontPx: parseFloat(getComputedStyle(document.body).fontSize),
    cards: document.querySelectorAll('.project-card').length,
    directoryCards: document.querySelectorAll('.project-directory .panel').length,
    bodyClass: document.body.className,
    mainClass: document.querySelector('main#main')?.className || '',
    logo: !!logo && logo.complete && logo.naturalWidth > 0,
    heroHeadingLines,
    portraitWidth: portrait ? Math.round(portrait.getBoundingClientRect().width) : null,
    portraitReady: !!portraitImage && portraitImage.complete && portraitImage.naturalWidth > 0,
    overflow: document.documentElement.scrollWidth - innerWidth
  };
})()"""

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="jekyll-browser-review")
    parser.add_argument("--base-url", default="")
    args = parser.parse_args()
    chrome = next((shutil.which(x) for x in ("google-chrome", "chromium", "chromium-browser") if shutil.which(x)), None)
    if chrome is None:
        raise RuntimeError("Chrome is required for browser verification")
    output = ROOT / args.output
    output.mkdir(parents=True, exist_ok=True)
    server = None
    if args.base_url:
        base = args.base_url.rstrip("/")
    else:
        root = ROOT / "site-jekyll"
        if not root.is_dir():
            raise RuntimeError("Assembled static output is missing")
        server = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(root)))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        base = f"http://127.0.0.1:{server.server_port}"
    records = sorted((ROOT / "jekyll-pilot/_projects").glob("*.md"))
    routes = [
        "/", "/projects.html", "/about.html", "/skills.html", "/evidence.html",
        "/resume.html", "/contact.html", "/experience.html", "/certifications.html",
        "/home-lab.html", "/documentation.html", "/proof.html", "/project-15.html",
    ]
    for record in records:
        matched = re.search(r'^case_study_url: "([^"]+)"', record.read_text(encoding="utf-8"), re.M)
        if matched and matched.group(1) not in routes:
            routes.append(matched.group(1))
    failures = []
    results = []
    try:
        for width in (360, 768, 1440):
            browser = Browser(chrome)
            browser.viewport(width)
            try:
                for route in routes:
                    try:
                        browser.events = []
                        browser.navigate(base + route)
                        state = browser.evaluate(CHECKS)
                        issues = [name for name in ("header", "footer", "main", "css", "experience", "logo") if not state.get(name)]
                        if state.get("bodyFontPx", 0) < 16:
                            issues.append(f"body font too small ({state.get('bodyFontPx')}px)")
                        if route == "/" and state.get("cards") != 8:
                            issues.append(f"featured cards {state.get('cards')} != 8")
                        if route == "/":
                            if not state.get("portraitReady"):
                                issues.append("hero portrait failed to load")
                            if width == 1440 and (state.get("portraitWidth") or 0) < 370:
                                issues.append(f"portrait too small on desktop ({state.get('portraitWidth')}px)")
                            if width == 1440 and (state.get("heroHeadingLines") or 999) > 3:
                                issues.append(f"headline wraps too much on desktop ({state.get('heroHeadingLines')} lines)")
                            print(f"Hero {width}px: {state.get('heroHeadingLines')} heading lines, {state.get('portraitWidth')}px portrait", flush=True)
                        if route == "/projects.html" and state.get("directoryCards") != 15:
                            issues.append(f"directory cards {state.get('directoryCards')} != 15")
                        if route == "/projects/m365-graph-administration-lab/index.html" and "graph-case-study" not in state.get("bodyClass", ""):
                            issues.append("Project 13 signature layout class missing")
                        if route == "/skills.html" and "skills-page" not in state.get("mainClass", ""):
                            issues.append("skills page styling hook missing")
                        if route == "/evidence.html" and "evidence-page" not in state.get("mainClass", ""):
                            issues.append("evidence page styling hook missing")
                        if state.get("overflow", 0) > 6:
                            issues.append(f"horizontal overflow {state['overflow']}px")
                        if browser.events:
                            issues.append("browser JavaScript exception")
                        if issues:
                            failures.append(f"{width}px {route}: {', '.join(issues)}")
                        results.append({"width": width, "route": route, "status": state, "issues": issues})
                        if route in ("/", "/projects.html", "/project-15.html", "/projects/grafana-entra-sso/index.html", "/projects/m365-graph-administration-lab/index.html", "/skills.html", "/evidence.html"):
                            label = "home" if route == "/" else route.strip("/").replace("/", "--").replace(".html", "")
                            browser.screenshot(output / f"{label}-{width}.png")
                    except Exception as exc:
                        failures.append(f"{width}px {route}: {exc}")
            finally:
                browser.close()
    finally:
        if server:
            server.shutdown()
    (output / "checks.json").write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
    print(f"Rendered {len(results)} route/viewport combinations; {len(failures)} failures.")
    for issue in failures[:50]:
        print("FAIL", issue, flush=True)
    if failures:
        raise SystemExit(1)
    print("PASS: Navigation, shared styling, logo, responsive widths and JavaScript.")

if __name__ == "__main__":
    main()
