#!/usr/bin/env python3
"""Verify generated routes, assets, local links and immutable public evidence."""
from __future__ import annotations
import hashlib
import html.parser
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[2]
BUILD = ROOT / "site-jekyll"
JEKYLL = ROOT / "_jekyll-generated"
PROJECTS = ROOT / "jekyll-pilot" / "_projects"

class References(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.urls: list[str] = []
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ("href", "src", "poster") and value:
                self.urls.append(value)

def local_target(page: Path, url: str) -> Path | None:
    parsed = urlsplit(url.strip())
    if parsed.scheme and parsed.scheme not in ("http", "https"):
        return None
    if parsed.netloc and parsed.hostname not in ("jeremyfontenot.online", "www.jeremyfontenot.online"):
        return None
    if not parsed.path or parsed.path == "#":
        return None
    path = unquote(parsed.path)
    if path.startswith("//"):
        return None
    if path.startswith("/"):
        return BUILD / path.lstrip("/")
    return page.parent / path

def main() -> None:
    problems: list[str] = []
    records = sorted(PROJECTS.glob("*.md"))
    if len(records) != 15:
        problems.append(f"Expected 15 project records, found {len(records)}")
    for record in records:
        text = record.read_text(encoding="utf-8")
        study = re.search(r'^case_study_url: "([^"]+)"', text, re.M)
        evidence = re.search(r'^evidence_url: "([^"]+)"', text, re.M)
        for field, match in (("case study", study), ("evidence", evidence)):
            if not match:
                problems.append(f"{record.name}: missing {field} URL")
                continue
            target = BUILD / match.group(1).lstrip("/")
            if not target.is_file():
                problems.append(f"{record.name}: missing published {field}: {target}")
            if field == "evidence" and target.is_file():
                original = ROOT / match.group(1).lstrip("/")
                if not original.is_file() or hashlib.sha256(target.read_bytes()).digest() != hashlib.sha256(original.read_bytes()).digest():
                    problems.append(f"{record.name}: original evidence bytes changed")

    homepage = (BUILD / "index.html").read_text(encoding="utf-8")
    featured_cards = homepage.count('<article class="project-card"')
    if featured_cards != 8:
        problems.append(f"Expected eight collection-driven featured cards, found {featured_cards}")
    if 'id="project15-feature"' not in homepage:
        problems.append("Featured Project 15 is missing from the homepage")
    if "15 project case studies" not in homepage:
        problems.append("Homepage's dynamic collection count is not 15")
    directory = (BUILD / "projects.html").read_text(encoding="utf-8")
    if directory.count('<article class="panel') != 15:
        problems.append("Project directory does not contain exactly 15 case studies")
    if directory.count("panel--featured") != 1:
        problems.append("Project directory must contain exactly one featured project")
    if "Featured case study" not in directory or "Technical focus" not in directory:
        problems.append("Project 15 feature layout is incomplete")
    if 'href="/project-15.html"' not in directory:
        problems.append("Project 15 case-study link is missing")
    root_pages = list(ROOT.glob("*.html"))
    if len(root_pages) < 40:
        problems.append(f"Only {len(root_pages)} root HTML pages found")
    for source in root_pages:
        if not (BUILD / source.name).is_file():
            problems.append(f"Missing retained root route: {source.name}")
    if (BUILD / ".nojekyll").exists():
        problems.append("Production publication must not contain .nojekyll")
    for rel in ("assets/css/style.css", "assets/css/experience.css", "assets/js/main.js", "favicon.ico", "CNAME"):
        if not (BUILD / rel).is_file():
            problems.append(f"Missing public asset: {rel}")

    generated = sorted(JEKYLL.rglob("*.html"))
    if len(generated) < 50:
        problems.append(f"Only {len(generated)} Jekyll HTML pages generated")
    link_count = 0
    for generated_page in generated:
        page = BUILD / generated_page.relative_to(JEKYLL)
        if not page.is_file():
            problems.append(f"Jekyll page was not published: {page}")
            continue
        markup = page.read_text(encoding="utf-8")
        if '/assets/css/experience.css?v=signal-2' not in markup:
            problems.append(f"Visual design stylesheet missing from {page.relative_to(BUILD)}")
        if 'name="theme-color" content="#080d16"' not in markup:
            problems.append(f"Branded browser theme missing from {page.relative_to(BUILD)}")
        if '<header class="site-header">' not in markup or '<footer class="site-footer">' not in markup:
            problems.append(f"Missing shared branded header/footer: {page}")
        rel = generated_page.relative_to(JEKYLL).as_posix()
        canonical_route = "/" if rel == "index.html" else "/" + rel
        if canonical_route.endswith("/index.html"):
            canonical_route = canonical_route[:-len("index.html")]
        expected_canonical = 'href="https://jeremyfontenot.online' + canonical_route + '"'
        if expected_canonical not in markup:
            problems.append(f"Incorrect canonical SEO URL: {rel}")
        refs = References()
        refs.feed(markup)
        for url in refs.urls:
            target = local_target(page, url)
            if target is None:
                continue
            link_count += 1
            try:
                resolved = target.resolve()
                resolved.relative_to(BUILD.resolve())
            except ValueError:
                problems.append(f"Link escapes published root: {page}: {url}")
                continue
            if not target.is_file() and not (target / "index.html").is_file():
                problems.append(f"Missing local target: {page.relative_to(BUILD)} -> {url}")
    for rel in ("404.html", "dashboard.html", "evidence-browser.html"):
        page = BUILD / rel
        if page.exists():
            t = page.read_text(encoding="utf-8")
            if 'name="robots" content="noindex"' not in t:
                problems.append(f"Missing noindex on error/redirect page: {rel}")
    for rel in ("dashboard.html", "evidence-browser.html"):
        if 'http-equiv="refresh"' not in (BUILD / rel).read_text(encoding="utf-8"):
            problems.append(f"Redirect not retained: {rel}")

    print(f"Generated Jekyll pages: {len(generated)}")
    print(f"Project collection entries: {len(records)}")
    print(f"Checked local references: {link_count}")
    print(f"Problems found: {len(problems)}")
    for issue in problems[:100]:
        print("FAIL:", issue)
    if problems:
        raise SystemExit(1)
    print("PASS: All generated routes, internal references and original evidence verified.")

if __name__ == "__main__":
    main()
