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
  const header = document.querySelector('header.site-header');
  const footer = document.querySelector('footer.site-footer');
  const logo = document.querySelector('header.site-header img');
  return {
    title: document.title,
    header: !!header,
    footer: !!footer,
    main: !!document.querySelector('main#main'),
    css,
    logo: !!logo && logo.complete && logo.naturalWidth > 0,
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
    routes = ["/", "/projects.html", "/about.html", "/project-15.html"]
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
                        issues = [name for name in ("header", "footer", "main", "css", "logo") if not state.get(name)]
                        if state.get("overflow", 0) > 6:
                            issues.append(f"horizontal overflow {state['overflow']}px")
                        if browser.events:
                            issues.append("browser JavaScript exception")
                        if issues:
                            failures.append(f"{width}px {route}: {', '.join(issues)}")
                        results.append({"width": width, "route": route, "status": state, "issues": issues})
                        if route in ("/", "/projects.html", "/project-15.html", "/projects/grafana-entra-sso/index.html"):
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
