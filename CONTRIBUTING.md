# Contributing

This repository contains the source code and content for [jeremyfontenot.online](https://jeremyfontenot.online), a static IT portfolio focused on Service Desk support, systems administration, Microsoft 365, home-lab projects, automation, and technical documentation.

## Workflow

* Keep each change small and focused.
* Check the current branch and working tree before editing.
* Create a branch for content, layout, navigation, or feature changes.
* Avoid renaming or moving public files unless every reference is updated.
* Keep navigation, spacing, typography, and card layouts consistent across pages.
* Do not publish passwords, tokens, private account details, client information, or sensitive infrastructure data.
* Use clear language and avoid claims that are not supported by the project work.
* Review the changed pages before merging.

## Validation

Run these checks before committing:

```powershell
git status
git diff --check
```

For JavaScript changes:

```powershell
node --check .\path\to\file.js
```

For normal portfolio changes, run:

```powershell
.\scripts\validation\validate-html.ps1
.\scripts\validation\validate-accessibility.ps1
.\scripts\validation\validate-links.ps1
.\scripts\validation\validate-seo.ps1
```

Also confirm that:

* Modified pages open correctly.
* Internal links work.
* Navigation is consistent.
* Text does not overflow its container.
* Cards align correctly.
* Desktop and mobile layouts remain readable.
* Public URLs and filenames have not changed unexpectedly.

Evidence maintenance, hash generation, and source-manifest updates should only be performed when the evidence library itself is intentionally changed.

## Commit Standard

Use clear commit messages that describe the result of the change.

Examples:

```text
fix: align project cards
feat: add MACVM01 case study
docs: update home lab description
style: improve mobile spacing
ci: simplify portfolio validation
```

## Pull Requests

A pull request should include:

* A brief summary of the change
* The pages or files affected
* Any visible behavior that changed
* The validation completed
* Known limitations or follow-up work

Merge only after the required portfolio checks pass and the changed pages have been reviewed.
