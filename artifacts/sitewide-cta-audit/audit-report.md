# Sitewide navigation audit — release record

## Scope and baseline

Phase 5 QA and navigation remediation, based on GitHub main revision `625bd783dd755ace12c19e7bad430a0d1fd9b666`. The redesigned GitHub HTML and interaction system are retained. No source repository was modified, and no evidence was deleted, moved, deduplicated, or fabricated.

The initial Chromium inventory visited 1,653 public HTML routes and recorded 12,946 visible interactions, 1,871 unique internal destinations, and six external HTTP destinations. Its raw defect candidates included 1,664 failed targets/fragments, 51 semantic candidates, 13 circular candidates, 94 opening-behavior candidates, and 100 layout/console candidates. These are candidate counts, not a claim that every automated classification was a genuine defect. Current-page navigation, meaningful local anchors, and intentional raw evidence links require separate interpretation.

The repository/publication inventory now contains 1,655 HTML pages, including the previously omitted Windows LAPS evidence directory. Browser validation loads each rendered page and its internal HTML destinations, checks rendered fragments and content summaries, inspects visible focus and hover-rule coverage, traverses evidence-map pagination, and checks external destinations. Supplemental artifact links are requested directly; clearly labeled raw evidence remains intentional.

## Corrections

| Source | Original label/destination | Correction and reason |
| --- | --- | --- |
| Microsoft 365 proof-map evidence page | Back to Project → `/proof.html#m365-proof` | Back to Microsoft 365 Evidence Catalog → `/microsoft-365/evidence-catalog.html`; the old fragment did not exist and the label described the wrong content. |
| RCA evidence page | Back to Project → `/projects.html#service` | Back to Projects → `/projects.html`; nonexistent fragment removed. |
| Infrastructure validation evidence | Source repository/commit/tree/PR links to a privately accessible operations repository | Public provenance section and manifest, with explicit original-source access limitation; private source is not presented as publicly inspectable evidence. |
| Home Lab case-study links | `/on-prem-home-lab.html#restore-validation` without a meaningful rendered target | Meaningful restore content now supports both `#restore` and the established `#restore-validation` heading. |
| Project/proof/readiness routes | Fragments resolved only to hidden placeholder spans | Visible SCVMM/project and bounded proof cards, readiness sections, and meaningful Home Lab headings replace placeholder targets. |
| Case-study side navigation | Evidence → narrative validation-links section | Validation links; distinguishes a list of supporting links from the actual evidence destination. |
| Claim map and interactive skill map | Inspect proof / Inspect supporting proof → direct artifact | Inspect evidence / Inspect supporting evidence; recruiter proof summaries remain separate. |
| Preserved SharePoint public derivatives | Missing export paths, placeholder `#` links, and unavailable dependencies | Explicit unavailable-source labels and exact integrity-record fragments; shared accessible styling and asset-availability disclosure. Original source attestations remain separate. |
| Build generators | Older templates overwrote redesigned GitHub landing/narrative routes | Preserve the current route-renderer shells and hash them; legacy template generation cannot silently replace the current design. |
| Public integrity inventory | Corrected presentation bytes compared to old presentation hashes; removed duplicate document path | Retain prior inventory hashes, synchronize current presentation hashes, and reference the already-existing byte-identical public document. Source hashes remain independently attested. |
| Interaction styling | Incomplete styles on older evidence layouts and inline interactions | Add cyan/magenta hover and focus baseline, contrast-safe primary text, responsive evidence cards, readable wrapping, and reduced-motion support without replacing the GitHub design. |

## Local validation

- `npm ci`: succeeded, no reported dependency vulnerabilities.
- `npm run build`: succeeded after source/generator corrections. Transient Windows file-open errors on earlier attempts are not counted as successful builds.
- `npm run check`: succeeded; 21 semantic regression tests, 802 normalized export checks, 1,655 public HTML targets, 1,253 runtime/data references, 18,794 internal target checks, and 2,595 fragments.
- `node scripts/build/sync-public-presentation-integrity.js --check`: succeeded.
- `node scripts/build/generate-dashboard-data.js --check`: succeeded; 1,057 inventory hashes verified, zero failed.
- `node scripts/build/generate-home-lab-evidence-organization.js --check`: succeeded.
- `node scripts/build/generate-site-foundation.js --check`: succeeded.
- `git diff --check`: succeeded.
- Python browser/export script compilation: succeeded.
- Visual browser review: Proof hover treatment, LAPS evidence destination, keyboard skip-link focus, narrow LAPS/Home Lab/integrity layouts, LAPS Menu/Escape, and both sets of evidence-map Next/Previous controls plus Reset filters reviewed.

The AGENTS baseline names several PowerShell validators and `npm run test:browser` that do not exist in the current authoritative GitHub checkout. Those unavailable checks are not reported as passing. Current CI uses the repository's build plus the expanded target/semantic suite and full production Chromium audit, with obsolete-run cancellation.

## Release gates

Do not treat this source report alone as deployment proof. Final release evidence must identify the merged Git SHA, successful Repository Validation and matching Pages run, and the postdeployment production Chromium report. The production audit report is uploaded by Live Site Browser Audit with the exact revision in its artifact name. LinkedIn may present an authentication/automation wall; its destination identity is distinct from authentication availability.

Full row-level CSVs can be generated with `scripts/audits/export-navigation-audit.py` from the initial inventory and a completed final browser report. It retains source, visible label, expected content, actual destination/title/heading, status, fragment result, semantic contract, repetition/circular candidates, recruiter use, hover coverage, keyboard focus, and opening behavior. Automated semantic classifications are intentionally not described as manual review of every evidence claim.
