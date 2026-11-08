#!/usr/bin/env python3
"""Assemble a complete static publication from retained assets plus Jekyll pages.

The historical/public evidence remains byte-identical. Jekyll only replaces pages
whose HTML is generated from the managed layouts and project collection.
"""
from __future__ import annotations

import shutil
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[2]
JEKYLL_OUTPUT = ROOT / "_jekyll-generated"
PUBLIC_OUTPUT = ROOT / "site-jekyll"
BASE_URL = "https://jeremyfontenot.online"

def main() -> None:
    if not JEKYLL_OUTPUT.is_dir() or not (JEKYLL_OUTPUT / "index.html").is_file():
        raise RuntimeError("Jekyll output missing; build Jekyll before assembling publication")
    subprocess.run(
        ["node", "scripts/build/prepare-public-site.js", "--output", "site-jekyll"],
        cwd=ROOT,
        check=True,
    )
    for source in JEKYLL_OUTPUT.rglob("*"):
        if source.is_symlink():
            raise RuntimeError(f"Symlink rejected in generated Jekyll source: {source}")
        if not source.is_file():
            continue
        target = PUBLIC_OUTPUT / source.relative_to(JEKYLL_OUTPUT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
    (PUBLIC_OUTPUT / ".nojekyll").unlink(missing_ok=True)

    # Extend, rather than replace, the existing sitemap's historical canonical URLs.
    sitemap = PUBLIC_OUTPUT / "sitemap.xml"
    namespace = "http://www.sitemaps.org/schemas/sitemap/0.9"
    ns = "{" + namespace + "}"
    ET.register_namespace("", namespace)
    tree = ET.parse(sitemap)
    root = tree.getroot()
    known = {loc.text for loc in root.findall(f"{ns}url/{ns}loc")}
    new_count = 0
    for page in sorted(JEKYLL_OUTPUT.rglob("*.html")):
        relative = page.relative_to(JEKYLL_OUTPUT).as_posix()
        if relative == "404.html":
            continue
        url = BASE_URL + ("/" if relative == "index.html" else "/" + quote(relative))
        if url in known:
            continue
        row = ET.SubElement(root, ns + "url")
        ET.SubElement(row, ns + "loc").text = url
        known.add(url)
        new_count += 1
    tree.write(sitemap, encoding="utf-8", xml_declaration=True)

    required = [
        "index.html", "projects.html", "about.html", "project-15.html",
        "projects/windows-laps-gpo/index.html", "assets/css/style.css",
        "assets/js/main.js", "CNAME", "robots.txt", "sitemap.xml",
    ]
    missing = [str(f) for f in required if not (PUBLIC_OUTPUT / f).is_file()]
    if missing:
        raise RuntimeError("Incomplete static publication: " + ", ".join(missing))
    count = sum(1 for _ in PUBLIC_OUTPUT.rglob("*.html"))
    print(f"Assembled {count} HTML pages with preserved assets and evidence.")
    print(f"Automatically added {new_count} new canonical URLs to sitemap.xml")
    print("Production main and original evidence were not modified.")

if __name__ == "__main__":
    main()
