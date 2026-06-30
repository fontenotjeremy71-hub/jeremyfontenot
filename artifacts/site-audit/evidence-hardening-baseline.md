# Evidence Hardening Baseline

- Baseline date: 2026-06-30
- Portfolio repository: `fontenotjeremy71-hub/jeremyfontenot`
- Portfolio branch: `main`
- Portfolio baseline commit: `faedad5631d26bdf38fd324e2bb13994624b135d`
- Operations repository: `fontenotjeremy71-hub/jeremy-homelab-ops`
- Operations source commit: `fb6c286873285778d88d6d5cfde0b9bd00b96f36`
- Public site: `https://jeremyfontenot.online`
- CNAME: `jeremyfontenot.online`
- Remediation branch: `remediation-evidence-trust-hardening`
- Remote preservation branch: `backup/evidence-hardening-baseline-20260630`

## Safety boundary

The repository was accessed through the GitHub connector rather than Jeremy's Windows working copy. A local bundle at `C:\Users\jeremy\Documents\projects\backups\jeremyfontenot-before-evidence-hardening.bundle` could not be created or verified from this environment. The exact baseline commit is preserved on the remote backup branch above. No claim is made that the requested workstation-local bundle exists.

The remediation branch was created directly from the recorded `main` commit, so unrelated local uncommitted files were neither accessed nor discarded.

## Active sitemap URLs

1. `https://jeremyfontenot.online/`
2. `https://jeremyfontenot.online/projects.html`
3. `https://jeremyfontenot.online/on-prem-home-lab.html`
4. `https://jeremyfontenot.online/proof.html`
5. `https://jeremyfontenot.online/dashboard.html`
6. `https://jeremyfontenot.online/resume.html`
7. `https://jeremyfontenot.online/contact.html`
8. `https://jeremyfontenot.online/home-lab-operations-proof.html`

## Repository HTML baseline

The values below are Git blob identifiers for the source HTML at the baseline commit. They are not presented as SHA-256 deployment hashes.

| Path | Source title | Git blob |
|---|---|---|
| `/` (`index.html`) | Jeremy Fontenot \| Service Desk and Infrastructure Operations | `3fc7a8dfc00bb2d9134190b5f6b0d0c1fa11261e` |
| `/projects.html` | Projects \| Jeremy Fontenot Evidence-Backed IT Portfolio | `c8b30d4630e04c8d23c6e080737ca1bec4789d03` |
| `/on-prem-home-lab.html` | On-Premises Home Lab \| Proxmox, pfSense, AD & Linux | `5efa46d57f75c15172ac57f07c694748a4492988` |
| `/proof.html` | Proof Index \| Jeremy Fontenot Evidence-First Portfolio | `0eec1c6f639c2300e2bc471e9fc0043d1048c981` |
| `/dashboard.html` | Dashboard \| Portfolio Evidence Status | `d1af0ca1be92eee065a75459a508dadf0c9866be` |
| `/resume.html` | Resume \| Jeremy Fontenot Service Desk and IT Support | `fe93bb6aad8776392eba03be375dbbdf1c4f99a5` |
| `/contact.html` | Contact \| Jeremy Fontenot IT Support Portfolio | `7915ca119d997fce419f4205b16425e10050c5c1` |
| `/home-lab-operations-proof.html` | Home Lab Operations Validation \| Inventory, Testing, SSSD | `7c7ba7360a72653771d9cb1203e2806d5ba838c0` |

## Initial live observations

- The live homepage title was `Jeremy Fontenot | Service Desk and Infrastructure Operations`.
- The live projects page title was `Projects | Evidence-Backed IT Portfolio`, which did not match the current repository title.
- The live home-lab page title was `Home Lab | Jeremy Fontenot Infrastructure Case Study`, which did not match the current repository title.
- The live proof page title was `Proof Index | Microsoft 365, Entra, and On-Prem Home Lab Evidence`, which did not match the current repository title.
- The live contact page title was `Contact | Jeremy Fontenot`, which did not match the current repository title.
- Live dashboard and resume fetches were inconclusive during the baseline request and are not marked as verified.
- The live pages exposed raw Microsoft 365/Entra export links, obsolete ZIP/hash links, `Sanitized export` wording, and enterprise-readiness language. These findings establish deployment/content remediation requirements; they are not evidence that the underlying raw files are safe.

## Deployment baseline

- `CNAME` points to `jeremyfontenot.online`.
- `.github/workflows/validation.yml` validates pushes and pull requests targeting `main`.
- No deployment mechanism is inferred solely from CNAME or validation configuration. Deployment source must be verified separately before completion.

## Baseline decision

Phase 0 is complete only for the remotely accessible repository state. Workstation-local cleanliness, the requested local Git bundle, and workstation-local paths remain unverified limitations and must not be represented as completed.