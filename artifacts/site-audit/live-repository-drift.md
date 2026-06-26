# Live Repository Drift

## Commits

- Local website commit before edits: `a95259d90717695acebf8840d740fde178adda8a`
- Remote website commit before edits: `a95259d90717695acebf8840d740fde178adda8a`
- Deployed commit: not directly exposed by GitHub Pages HTML; deployment source is workflow-backed `main` for `jeremyfontenot.online`.
- Home-lab source commit: `3d42a4808a6a0607d78f4f4e7fd1e71783729a6b`

## Drift Observed

- Live and local source were aligned at commit `a95259d90717695acebf8840d740fde178adda8a` before editing.
- Public pages contained retired date-forward proof labels and retired document wording.
- The source of truth for current home-lab state is the operations repository plus sanitized public evidence copied into the website repository.

## Actions Taken

- Rebuilt primary public pages around stable evidence classifications.
- Published a stable current-state evidence folder.
- Created a new professional home-lab DOCX and linked it from primary CTAs.
- Preserved historical evidence paths for compatibility while removing retired public-facing wording from active navigation and page copy.
