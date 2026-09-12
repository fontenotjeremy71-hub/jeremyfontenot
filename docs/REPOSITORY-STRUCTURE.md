# Repository Structure

This repository is organized around two goals: a recruiter-facing static portfolio and preserved technical evidence.

## Public site

The primary recruiter path is intentionally small:

- `index.html` — portfolio entry point
- `systems-administration.html` — role-readiness summary
- `projects.html` — numbered project catalog
- `proof.html` — claim-to-artifact evidence index
- `resume.html` — browser resume
- `contact.html` — contact and role fit

Detailed case-study pages remain at stable public URLs so existing links continue to work.

## Project documentation

`projects/` contains project-specific documentation, scripts, evidence references, and sanitized outputs. Each project should use this shape where practical:

```text
projects/<project-name>/
  README.md
  architecture.md
  implementation.md
  validation.md
  troubleshooting.md
  lessons-learned.md
  scripts/
  evidence/
```

## Evidence preservation

`evidence-library/` is the preserved public evidence store. Evidence is never removed simply to make the repository look cleaner. Older material may be de-emphasized from recruiter navigation while remaining available for audit/history.

## Site assets

`assets/` contains shared logos, resume files, visuals, CSS, and JavaScript. The rebuilt site uses `assets/css/portfolio-v3.css` through the single `assets/css/site.css` entry point and a minimal `assets/js/site.js`.

## Archive

`archive/` preserves prior site generations and historical material. Archival content is not treated as the current recruiter experience.

## Automation

`.github/workflows/` contains repository validation and GitHub Pages automation. `scripts/` contains build/audit/validation utilities.

## Rules

1. Never publish passwords, tokens, private keys, recovery keys, VPN credentials, or LAPS passwords.
2. Never delete technical evidence merely for visual cleanup.
3. Keep professional employment claims separate from personal-lab claims.
4. Project status must reflect validation evidence.
5. Recruiter-facing pages should link to curated evidence, not dump raw artifacts on the reader.
