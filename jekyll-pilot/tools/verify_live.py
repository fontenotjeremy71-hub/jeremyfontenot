#!/usr/bin/env python3
"""Read-only production smoke check for Jekyll pages and immutable evidence."""
from __future__ import annotations
import argparse
import hashlib
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
PROJECTS = ROOT / "jekyll-pilot/_projects"

def download(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": "JF-Portfolio-Release-Verification/2.0"})
    with urlopen(request, timeout=25) as response:
        if response.status != 200:
            raise RuntimeError(f"HTTP {response.status}: {url}")
        return response.read()

def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--base-url", default="https://jeremyfontenot.online")
    p.add_argument("--attempts", type=int, default=1)
    args = p.parse_args()
    base = args.base_url.rstrip("/")
    records = sorted(PROJECTS.glob("*.md"))
    if len(records) != 15:
        raise RuntimeError(f"Expected 15 project records, got {len(records)}")
    route_map = {
        "/": "15 project case studies",
        "/about.html": "A support foundation",
        "/projects.html": "15 projects shown",
        "/project-15.html": "JF Automation",
    }
    evidence_urls = []
    for item in records:
        raw = item.read_text(encoding="utf-8")
        case_study = re.search(r'^case_study_url: "([^"]+)"', raw, re.M).group(1)
        evidence = re.search(r'^evidence_url: "([^"]+)"', raw, re.M).group(1)
        route_map[case_study] = "site-footer"
        evidence_urls.append(evidence)
    # Check all eight original dashboard and PASS screenshots in production.
    original_source = (PROJECTS / "15-project-15.md").read_text(encoding="utf-8")
    project15_pngs = set(re.findall(r'evidence/project-15/[^"\s<>]+\.png', original_source))
    if len(project15_pngs) != 8:
        raise RuntimeError(f"Project 15 source must contain 8 PNGs; found {len(project15_pngs)}")
    evidence_urls = sorted(set(evidence_urls) | {"/" + name for name in project15_pngs})
    failures: list[str] = []
    for attempt in range(max(args.attempts, 1)):
        failures.clear()
        try:
            pages = {route: download(base + route).decode("utf-8", errors="replace") for route in route_map}
            for path, expected in route_map.items():
                body = pages[path]
                for marker in (expected, 'name="generator" content="Jekyll"', "site-header", "site-footer"):
                    if marker not in body:
                        failures.append(f"{path}: missing {marker!r}")
            project15_page = pages["/project-15.html"]
            for marker in (
                '/assets/css/project15.css?v=p15-1',
                'class="project15-highlights"',
                'class="grid project15-gallery project15-gallery--interfaces"',
                'class="grid project15-gallery project15-gallery--validation"',
                'class="grid project15-resources"',
                'Current portfolio publication',
            ):
                if marker not in project15_page:
                    failures.append(f"Live Project 15 page missing {marker!r}")
            sitemap = download(base + "/sitemap.xml").decode("utf-8", errors="replace")
            for case_study in route_map:
                if case_study.startswith("/projects/"):
                    canonical = case_study[:-len("index.html")] if case_study.endswith("/index.html") else case_study
                    if base + canonical not in sitemap:
                        failures.append(f"sitemap missing {canonical}")
            with ThreadPoolExecutor(max_workers=6) as pool:
                futures = {pool.submit(download, base + evidence): evidence for evidence in evidence_urls}
                for future in as_completed(futures):
                    evidence = futures[future]
                    live = future.result()
                    local = (ROOT / evidence.lstrip("/")).read_bytes()
                    if hashlib.sha256(live).digest() != hashlib.sha256(local).digest():
                        failures.append(f"Original evidence byte mismatch: {evidence}")
        except (HTTPError, URLError, OSError, RuntimeError, ValueError) as exc:
            failures.append(str(exc))
        if not failures:
            print(f"PASS: {len(route_map)} live Jekyll pages, {len(evidence_urls)} original evidence files, sitemap and shared layout.")
            return
        if attempt + 1 < args.attempts:
            print(f"Attempt {attempt+1}/{args.attempts}: {len(failures)} checks failing; waiting for site propagation.", flush=True)
            time.sleep(15)
    for failure in failures:
        print("FAIL:", failure)
    raise SystemExit(1)

if __name__ == "__main__":
    main()
