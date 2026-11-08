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

    root_pages = list(ROOT.glob("*.html"))
    if len(root_pages) < 40:
        problems.append(f"Only {len(root_pages)} root HTML pages found")
    for source in root_pages:
        if not (BUILD / source.name).is_file():
            problems.append(f"Missing retained root route: {source.name}")
    if (BUILD / ".nojekyll").exists():
        problems.append("Production publication must not contain .nojekyll")
    for rel in ("assets/css/style.css", "assets/js/main.js", "favicon.ico", "CNAME"):
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
        if '<header class="site-header">' not in markup or '<footer class="site-footer">' not in markup:
            problems.append(f"Missing shared branded header/footer: {page}")
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
