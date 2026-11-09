# Jekyll portfolio source

This directory is the managed source for the public Jeremy Fontenot portfolio. The original HTML, historical artifacts, and evidence remain in the repository for traceability and rollback. GitHub Pages receives **only** the validated, assembled static publication.

## Edit a project

The 15 case studies now live entirely in `_projects/`. Each Markdown record contains both its metadata and its complete existing HTML case study, separated by YAML front matter. To add another project, copy a record and update:

- `number` — unique integer, used for sorting and counts.
- `title`, `category`, `summary` and `tags` — drive the project directory.
- `case_study_url` and matching `permalink` — preserve project page URLs.
- `evidence_url` — direct public evidence path; the file must already exist in the original repository.
- `layout: case-study` — all 15 projects share the same project breadcrumb, direct evidence action, and previous/next navigation, while retaining source content.
- HTML below the closing `---` — the complete original case-study narrative, rendered inside the shared layout.

The projects page automatically sorts and counts collection entries. The homepage metrics also use `site.projects.size`. The homepage’s curated selected-work cards come from `_data/featured.json`; edit this file to feature or reorder projects without touching page HTML.

## Edit the global visual design

- `_layouts/default.html` — the shared branded HTML shell, navigation, footers, canonical URLs and SEO metadata.
- `_layouts/case-study.html` — the 15-project design layer with metadata, contextual actions, evidence entry point, and adjacent-project navigation. Projects 01–12 use a technical briefing sidebar and two-column implementation/control stages; projects 13–15 keep their existing signature heroes and galleries.
- `../assets/css/style.css` — the preserved legacy visual foundation, intentionally unchanged.
- `../assets/css/experience.css` — the additive Signal & Structure refinement layer for managed Jekyll pages, controlling typography, project-card hierarchy, responsive layout and modern navigation. Prefer edits here instead of modifying the historical CSS.
- `../assets/js/main.js` — interactive navigation, project filters and back-to-top behavior.

The technical content and original evidence remain unchanged; workflow-stage wrappers in the first twelve projects only group the already documented implementation and troubleshooting text for easier reading. Evidence cards expand to the full desktop width; mobile readers get a single-column layout. Update the shared case-study layout and scoped CSS to redesign all future projects without duplicating page chrome.

The shared layout also retains page-specific body and main CSS classes (e.g. the Graph administration, Skills and Evidence templates) through Jekyll front matter, so existing specialty styling is preserved.

The remaining top-level legacy page *content* is wrapped automatically from its existing HTML source by `tools/prepare_pages.py`. This avoids editing dozens of duplicate headers. Changes to these pages' main sections will appear in the Jekyll site, while their outer headers/footers are replaced by the common layout.

## Build and validate locally

Prerequisites: Ruby 3.3 with Bundler, Python 3.12 and Node.js 22.

From the repository root:

```powershell
python jekyll-pilot/tools/prepare_pages.py
Push-Location jekyll-pilot
bundle install
bundle exec jekyll build --destination ../_jekyll-generated
Pop-Location
python jekyll-pilot/tools/assemble_site.py
python jekyll-pilot/tools/verify_site.py
```

Generated pages, original public assets and byte-identical evidence are assembled in `site-jekyll/`. Do not hand-edit this generated output.

## Deployment and rollback

The Jekyll Migration Preview workflow builds and verifies the complete site, including mobile/tablet/desktop Chrome checks, before any production deployment.

After review, merge the migration and select **Settings → Pages → Build and deployment → Source → GitHub Actions**. The Jekyll Portfolio Deployment workflow then publishes the assembled site from `main`, followed by live case-study, evidence-integrity and sitemap checks. Existing custom-domain settings must remain in place. This Pages source change is a GitHub repository setting, not a file change.

For rollback, the unchanged original root HTML and evidence remain in Git history. The prior Pages branch-source configuration and the original deployment commit can be restored if needed. Do not delete the retained historical source or evidence when adding projects.
