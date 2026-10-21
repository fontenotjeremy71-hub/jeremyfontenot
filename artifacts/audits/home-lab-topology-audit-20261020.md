# Portfolio audit — Home Lab topology consistency (initial phase)
Date: 2026-10-20
Status: **INCOMPLETE — implementation and live verification not performed**

## Governance
Read `AGENTS.md`, `.github/copilot-instructions.md`, `MASTER-PORTFOLIO-REGISTRY.md`, `README.md`, `package.json`, home-lab agent profile, and repository validation workflow. `AGENTS.md` requires a dedicated branch and PR *without merging*, and one phase at a time. Thus no production deployment is authorized by this phase.

## Confirmed findings from main
- The homepage `index.html` explicitly names HVHOST01, APP01, VMM01, SYNC01 and macOS Monterey in a separately bounded "additional documented systems" group. Its labels do not assert simultaneous operation.
- `home-lab-overview.html` presents the core Proxmox four-guest grid (pfSense, DC01, WS01, Linux01); describes HVHOST01→APP01, VMM01, Windows Admin Center and Azure Arc in narrative; it **does not show SYNC01 or macOS Monterey in the topology itself**. This produces a material cross-page representation gap.
- `architecture.html` presents the same four-guest core grid and documents the nested Hyper-V subsystem and SCVMM, and SYNC01 in a separate cloud-sync section; macOS Monterey is not shown in the architecture body. VMM01 is mentioned but not represented as a distinct node.
- The architecture mentions snapshot Proxmox VE 9.2.3. Do not silently replace with a later version without source snapshot evidence.
- The authoritative page generator is `scripts/build/integrate-portfolio-preview.js`, populated by `content/site/preview/pages-*.json`; modifying final HTML alone risks generated-file drift. `content/site/preview/generated-hashes.json` records hashes.
- `package.json` exposes `npm run check` and `npm run test:browser`. Their availability is not evidence of passing tests.

## Evidence boundaries pending reconciliation
- Core Proxmox guests are represented as VM 100 pfSense, VM 200 DC01, VM 300 WS01, VM 400 Linux01, according to the displayed retained snapshot.
- HVHOST01 → APP01: documented nested Hyper-V relationship, but physical/virtual placement of HVHOST01 itself is not established by this audit.
- VMM01: SCVMM management function referenced, placement unverified here.
- SYNC01: cloud synchronization agent in an earlier project snapshot; later DC01 agent placement must remain a separate timeframe/configuration, not conflated.
- macOS Monterey: cross-platform lab component in homepage; role/placement unverified.
- Azure Arc, Entra ID, Microsoft 365: cloud or hybrid management relationships, not Proxmox guest assertions.
- A private home-lab operations repository exists and is specified as authoritative by project instructions. Its exact system relationship evidence has not yet been verified in this phase.

## Required remediation (NOT YET IMPLEMENTED)
1. Reconcile canonical topology data with approved retained inventory and operational source; preserve verified vs unresolved placement boundaries.
2. Update source page records and generator-backed pages for Home Lab overview and Architecture to match the homepage's complete component coverage without implying a false hierarchy.
3. Add scoped regression checks for HVHOST01, APP01, VMM01, SYNC01 and macOS Monterey on required architecture views.
4. Regenerate and synchronize hashes, sitemap and artifacts using the repository build.
5. Run full targeted checks including responsive browser QA at 375/768/1366/1920px.
6. Obtain independent review and merge as required by `AGENTS.md`, then validate real deployment and production pages.

## Initial route discovery
Repository sitemap fetched. Includes `/`, `/home-lab-overview.html`, `/architecture.html`, `/on-prem-home-lab.html`, `/home-lab/`, and many project/evidence routes. **This is not an exhaustive recursive crawl.**
Public web fetch attempts for `/architecture.html` and `/home-lab.html` were unsuccessful in the available web tool; the latter does not exist as a repository-root source page (the intended overview route is `/home-lab-overview.html`). These fetch failures **are not evidence of HTTP 404**.

## Validation matrix — initial coverage only
| Route | Repo HTML inspected | Technical topology | 375px | 768px | 1366px | 1920px | Live verification | Result |
|---|---|---|---|---|---|---|---|---|
| / | Yes (topology excerpts) | Partial | Not tested | Not tested | Not tested | Not tested | Not tested | BLOCKED |
| /home-lab-overview.html | Yes (topology excerpts) | Incomplete presentation | Not tested | Not tested | Not tested | Not tested | Fetch not verified | FAIL |
| /architecture.html | Yes (full repo HTML) | Incomplete presentation | Not tested | Not tested | Not tested | Not tested | Fetch not verified | FAIL |
| Other sitemap routes | No | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | BLOCKED |

No CI, automated test, browser screenshot, merge, release, or production verification is claimed.
