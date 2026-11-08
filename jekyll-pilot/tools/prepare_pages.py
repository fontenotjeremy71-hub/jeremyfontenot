#!/usr/bin/env python3
"""Generate Jekyll wrappers from retained root HTML without modifying the originals.

The originals stay available for historical comparison and rollback. All new pages
share the Jekyll layout; pages without a <main> remain literal static redirects.
"""
from __future__ import annotations

import html
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "jekyll-pilot"
GENERATED = SOURCE / "generated-pages"
MAIN = re.compile(r"<main\b[^>]*>(.*?)</main\s*>", re.I | re.S)
TITLE = re.compile(r"<title\b[^>]*>(.*?)</title\s*>", re.I | re.S)
DESCRIPTION = re.compile(
    r'<meta\b(?=[^>]*\bname=["\']description["\'])[^>]*\bcontent=["\']([^"\']*)["\']',
    re.I | re.S,
)

def clean(text: str) -> str:
    return html.unescape(re.sub(r"\s+", " ", text)).strip()

def main() -> None:
    if GENERATED.exists():
        if GENERATED.is_symlink():
            raise RuntimeError("Refusing to remove symlinked generated-pages directory")
        shutil.rmtree(GENERATED)
    GENERATED.mkdir(parents=True, exist_ok=True)
    rendered = []
    skipped = []
    for source in sorted(ROOT.glob("*.html")):
        if (SOURCE / source.name).exists():
            continue
        original = source.read_text(encoding="utf-8-sig")
        match = MAIN.search(original)
        if not match:
            skipped.append(source.name)
            continue
        title_match = TITLE.search(original)
        # Meta attributes may appear in either order (content before name or vice versa).
        meta_tags = re.findall(r"<meta\b[^>]*>", original, re.I | re.S)
        desc_tag = next((tag for tag in meta_tags if re.search(r'\bname=["\\\']description["\\\']', tag, re.I)), "")
        desc_match = re.search(r'\bcontent=(["\\\'])(.*?)\1', desc_tag, re.I | re.S)
        title = clean(title_match.group(1)) if title_match else source.stem.replace("-", " ").title()
        description = clean(desc_match.group(2)) if desc_match else "Jeremy Fontenot technical portfolio"
        content = match.group(1)
        # Preserve original HTTP refresh redirects and 404 noindex behavior.
        head = re.search(r"<head\b[^>]*>(.*?)</head\s*>", original, re.I | re.S)
        head_html = head.group(1) if head else ""
        redirect = re.search(
            r'<meta\b(?=[^>]*\bhttp-equiv=["\\\']refresh["\\\'])[^>]*\bcontent=["\\\'][^"\\\']*?url=([^"\\\']+)',
            head_html, re.I | re.S,
        )
        noindex = bool(re.search(r'<meta\b(?=[^>]*\bname=["\\\']robots["\\\'])[^>]*noindex', head_html, re.I | re.S))
        if source.name == "index.html":
            content = content.replace(
                "<strong>15 project case studies</strong>",
                "<strong>{{ site.projects.size }} project case studies</strong>"
            )
            content = content.replace(
                "15 documented projects", "{{ site.projects.size }} documented projects"
            )
        if source.name == "index.html":
            # Replace the eight hand-maintained homepage cards with collection-driven
            # cards using the owner's existing curated text and preserved evidence.
            featured = """\n
{% for feature in site.data.featured %}
{% assign project = site.projects | where: "number", feature.number | first %}
{% if project %}
<article class="project-card"{% if project.number == 15 %} id="project15-feature"{% endif %}>
<p class="number">{{ project.number | prepend: '0' | slice: -2, 2 }} / {{ feature.featured_category | escape }}</p>
<h3><a href="{{ project.case_study_url | relative_url }}">{{ project.title | escape }}</a></h3>
<p>{{ feature.summary | escape }}</p>
<div class="tags">{% for tag in feature.tags %}<span class="tag">{{ tag | escape }}</span>{% endfor %}</div>
<a class="text-link" href="{{ feature.evidence_url | relative_url }}">{{ feature.evidence_label | escape }}</a>
{% if feature.secondary_url %}<p class="note"><a href="{{ feature.secondary_url | relative_url }}">{{ feature.secondary_label | escape }}</a></p>{% endif %}
</article>
{% endif %}
{% endfor %}
"""
            selected = content.index('<p class="eyebrow">Selected work</p>')
            start = content.index('<div class="grid">', selected) + len('<div class="grid">')
            end = content.index('</div></section>', start)
            content = content[:start] + featured + content[end:]
        front = (
            "---\nlayout: default\ntitle: " + json.dumps(title, ensure_ascii=False) +
            "\ndescription: " + json.dumps(description, ensure_ascii=False) +
            "\npermalink: /" + source.name + "\n---\n"
        )
        if redirect:
            front = front[:-4] + "redirect_to: " + json.dumps("/" + redirect.group(1).lstrip("/")) + "\nnoindex: true\n---\n"
        elif noindex:
            front = front[:-4] + "noindex: true\n---\n"
        (GENERATED / source.name).write_text(front + content + "\n", encoding="utf-8")
        rendered.append(source.name)
    print(f"Generated {len(rendered)} shared-layout root pages: {', '.join(rendered)}")
    print(f"Preserved {len(skipped)} literal HTML routes (no main element): {', '.join(skipped)}")
    if "index.html" not in rendered:
        raise RuntimeError("Homepage was not generated")
    if len(rendered) < 30:
        raise RuntimeError(f"Expected at least 30 migrated root pages, got {len(rendered)}")

if __name__ == "__main__":
    main()
