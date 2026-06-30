# Corrected Active-Surface Claim Remediation Plan

Audit website commit: `cb40684213481769f8f01b61b5c058c4bb01f8d6`
Audit operations commit: `6b9f043972cf955d321da6489e546369d4bcfc78`

This plan is limited to the eight active public pages. Archive pages, retired pages, generated audit files, navigation menus, footer navigation, button labels, standalone link labels, raw JSON-LD tokens, and generic positioning text were excluded before claim extraction.

## index.html

### ACT-CLAIM-007

- exact claim: Linux01 is on VLAN 30 at 10.10.30.20/24 with gateway 10.10.30.1 and DNS 10.10.20.10.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw inventory includes internal host identifiers; sanitize to network fields and provenance hash.
- direct evidence available: inventories/linux01-inventory-20260626-084312.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Does not prove all inter-VLAN policy behavior.
- recommended action: Publish sanitized network-state excerpt or adjust label to reconciliation summary.
- priority: P1

### ACT-CLAIM-009

- exact claim: DC01 evidence supports AD DS, DNS, DHCP, Group Policy, FSMO role ownership, and Windows Server 2022 administration in the lab.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw DC01 inventory includes account/object details; screenshots are supplements but not enough for every subclaim.
- direct evidence available: inventories/dc01-inventory-20260626-022543.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Lab administration only; no enterprise scale or production SLA implied.
- recommended action: Publish sanitized DC01 role/FSMO/DNS/DHCP/GPO excerpt and retitle visual-only links where needed.
- priority: P1

### ACT-CLAIM-021

- exact claim: The lab has an OpenVPN management path used for controlled management access, with DC01 DNS/RDP reachability observed from that path.
- current problem: DIRECT_SOURCE_AVAILABLE / Source reconciliation records observed reachability and timeout-only boundaries.
- direct evidence available: evidence/home-lab-source-reconciliation-20260626-012606.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SAFE
- exact link-label change: Use a precise target label that names the artifact type.
- exact classification change: Validated
- limitation: TCP reachability is not full service validation.
- recommended action: Change public link label from full evidence to reconciliation summary unless sanitized direct capture is published.
- priority: P2

### ACT-CLAIM-037

- exact claim: Microsoft 365 admin-center screenshots visually support tenant, domain, active user, group, and license states.
- current problem: DIRECT_PUBLIC_VISUAL_NOT_INSPECTED / Binary screenshots exist; this audit did not OCR/re-render image contents.
- direct evidence available: evidence-library/projects/microsoft-365-lab/evidence/entra-exports-20260605-073748/m365-admin-center-homepage-20260605.png
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Validated if visible contents match proof map
- limitation: Screenshots are visual supplements; prefer CSV/JSON where available.
- recommended action: Keep screenshots as visual evidence, not replacements for CSV/JSON exports.
- priority: P2

### ACT-CLAIM-038

- exact claim: Microsoft 365 proof inventories and hash records track public evidence artifacts.
- current problem: INDEX_ONLY_TRACEABILITY / Inventories and hash records are INDEX artifacts, not primary proof for underlying tenant-state claims.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented
- limitation: Index artifacts support traceability only.
- recommended action: Do not label inventory/hash rows as full evidence for tenant state.
- priority: P2

### ACT-CLAIM-045

- exact claim: The public DOCX is published under assets/documents and mirrored in the evidence library with provenance tracking.
- current problem: DIRECT_PUBLIC_BINARY_NOT_INSPECTED / Binary file exists; provenance is index/traceability evidence.
- direct evidence available: assets/documents/Jeremy-Fontenot-On-Premises-Home-Lab-Documentation.docx
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Documented
- limitation: File publication does not independently validate contained technical claims.
- recommended action: Keep as publication/provenance claim only.
- priority: P2

### ACT-CLAIM-054

- exact claim: The public proof methodology relies on commands, authenticated inventories, manifests, hashes, screenshot review, repository validation, source paths, and limitations rather than dates alone.
- current problem: INDEX_ONLY_TRACEABILITY / Methodology claim is supported by indexes and public text; indexes are not primary proof for individual technical claims.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented
- limitation: Each underlying claim still requires its own direct evidence.
- recommended action: Keep methodology but do not use it as substitute proof.
- priority: P2

## projects.html

### ACT-CLAIM-004

- exact claim: DC01 is VM 200 running Windows Server 2022 and serving the ad.jeremyfontenot.online/JFAD domain.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw DC01 inventory includes executing account and internal object details; publish a sanitized excerpt only.
- direct evidence available: inventories/dc01-inventory-20260626-022543.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Personal lab domain only; no employer or production administration implied.
- recommended action: Add sanitized DC01 inventory excerpt and keep screenshots as visual supplements.
- priority: P1

### ACT-CLAIM-005

- exact claim: WS01 is VM 300 running Windows 10 Pro 10.0.19045 build 19045 on the lab network.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw WS01 inventory includes account and local admin details; sanitized excerpt required for publication.
- direct evidence available: inventories/ws01-inventory-20260626-012952.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Does not establish production workstation administration.
- recommended action: Publish sanitized WS01 OS/network/domain excerpt before linking as direct public proof.
- priority: P1

### ACT-CLAIM-006

- exact claim: Linux01 is VM 400 running Ubuntu 26.04 LTS with kernel 7.0.0-22-generic.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw Linux inventory includes host identifiers and execution context; publish a narrow sanitized excerpt.
- direct evidence available: inventories/linux01-inventory-20260626-084312.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Personal lab host only.
- recommended action: Use sanitized Linux01 OS/kernel excerpt; keep screenshot as visual supplement.
- priority: P1

### ACT-CLAIM-007

- exact claim: Linux01 is on VLAN 30 at 10.10.30.20/24 with gateway 10.10.30.1 and DNS 10.10.20.10.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw inventory includes internal host identifiers; sanitize to network fields and provenance hash.
- direct evidence available: inventories/linux01-inventory-20260626-084312.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Does not prove all inter-VLAN policy behavior.
- recommended action: Publish sanitized network-state excerpt or adjust label to reconciliation summary.
- priority: P1

### ACT-CLAIM-009

- exact claim: DC01 evidence supports AD DS, DNS, DHCP, Group Policy, FSMO role ownership, and Windows Server 2022 administration in the lab.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw DC01 inventory includes account/object details; screenshots are supplements but not enough for every subclaim.
- direct evidence available: inventories/dc01-inventory-20260626-022543.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Lab administration only; no enterprise scale or production SLA implied.
- recommended action: Publish sanitized DC01 role/FSMO/DNS/DHCP/GPO excerpt and retitle visual-only links where needed.
- priority: P1

### ACT-CLAIM-021

- exact claim: The lab has an OpenVPN management path used for controlled management access, with DC01 DNS/RDP reachability observed from that path.
- current problem: DIRECT_SOURCE_AVAILABLE / Source reconciliation records observed reachability and timeout-only boundaries.
- direct evidence available: evidence/home-lab-source-reconciliation-20260626-012606.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SAFE
- exact link-label change: Use a precise target label that names the artifact type.
- exact classification change: Validated
- limitation: TCP reachability is not full service validation.
- recommended action: Change public link label from full evidence to reconciliation summary unless sanitized direct capture is published.
- priority: P2

### ACT-CLAIM-027

- exact claim: The repository structure validation script passed with pwsh -NoProfile -File .\tests\Test-RepositoryStructure.ps1.
- current problem: DIRECT_SOURCE_AVAILABLE_WITH_RECENCY_LIMITATION / Procedure artifact exists but predates the audited ops commit; use with a recency limitation.
- direct evidence available: evidence/repository-validation-20260626-010050.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SAFE
- exact link-label change: Use a precise target label that names the artifact type.
- exact classification change: Validated with limitation
- limitation: Direct result artifact is not from audited ops commit 6b9f043; rerun/capture if presenting as current.
- recommended action: Collect commit-specific validation output or downgrade to documented prior pass.
- priority: P2

### ACT-CLAIM-028

- exact claim: The HomeLab baseline framework test passed.
- current problem: SUPPORTING_ONLY_NEEDS_DOWNGRADE / Only a public operations summary row was found; no direct command output artifact matched this pass at the audited commit.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented until direct test output is collected
- limitation: Summary-only pass statement.
- recommended action: Collect direct read-only test output or downgrade from Verified/Tested.
- priority: P1

### ACT-CLAIM-029

- exact claim: The portfolio home-lab drift validation test passed.
- current problem: SUPPORTING_ONLY_NEEDS_DOWNGRADE / No direct captured output for this specific drift test was found in active public evidence or ops source evidence.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented until direct test output is collected
- limitation: Summary-only pass statement.
- recommended action: Collect direct test output or downgrade public classification.
- priority: P1

### ACT-CLAIM-030

- exact claim: JSON parsing, PowerShell parser validation, Bash syntax checks, policy-aware connectivity checks, and Git whitespace checks were included in the operations validation set.
- current problem: SUPPORTING_ONLY_NEEDS_DOWNGRADE / Summary lists validation categories, but direct per-check output was not found for every named check.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented partial validation
- limitation: Do not present as fully command-verified without direct command output for each check.
- recommended action: Collect direct outputs per check or narrow wording.
- priority: P1

### ACT-CLAIM-040

- exact claim: Repository governance/deployment quality work includes static-site validation, sitemap checks, structured data, document hash records, screenshot review, and deployment workflow records.
- current problem: SUPPORTING_ONLY / Found supporting audit reports and source workflow files, but no single direct current procedure output for all named activities in active-surface scope.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented
- limitation: Do not present as one fully validated outcome without per-check direct outputs.
- recommended action: Keep as documented work summary or split into separately evidenced checks.
- priority: P2

### ACT-CLAIM-051

- exact claim: Service desk/RCA project records emphasize symptoms, scope, troubleshooting, root cause, remediation planning, and limitations without unsupported impact metrics.
- current problem: NO_DIRECT_MATCH / Active public page describes the project, but no direct RCA artifact in active proof links was matched.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented
- limitation: Do not present as validated operational incident outcome without direct RCA artifacts.
- recommended action: Fix missing anchor or remove evidence-style anchor; collect direct RCA artifact if stronger classification is needed.
- priority: P2

## on-prem-home-lab.html

### ACT-CLAIM-004

- exact claim: DC01 is VM 200 running Windows Server 2022 and serving the ad.jeremyfontenot.online/JFAD domain.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw DC01 inventory includes executing account and internal object details; publish a sanitized excerpt only.
- direct evidence available: inventories/dc01-inventory-20260626-022543.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Personal lab domain only; no employer or production administration implied.
- recommended action: Add sanitized DC01 inventory excerpt and keep screenshots as visual supplements.
- priority: P1

### ACT-CLAIM-005

- exact claim: WS01 is VM 300 running Windows 10 Pro 10.0.19045 build 19045 on the lab network.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw WS01 inventory includes account and local admin details; sanitized excerpt required for publication.
- direct evidence available: inventories/ws01-inventory-20260626-012952.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Does not establish production workstation administration.
- recommended action: Publish sanitized WS01 OS/network/domain excerpt before linking as direct public proof.
- priority: P1

### ACT-CLAIM-006

- exact claim: Linux01 is VM 400 running Ubuntu 26.04 LTS with kernel 7.0.0-22-generic.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw Linux inventory includes host identifiers and execution context; publish a narrow sanitized excerpt.
- direct evidence available: inventories/linux01-inventory-20260626-084312.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Personal lab host only.
- recommended action: Use sanitized Linux01 OS/kernel excerpt; keep screenshot as visual supplement.
- priority: P1

### ACT-CLAIM-007

- exact claim: Linux01 is on VLAN 30 at 10.10.30.20/24 with gateway 10.10.30.1 and DNS 10.10.20.10.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw inventory includes internal host identifiers; sanitize to network fields and provenance hash.
- direct evidence available: inventories/linux01-inventory-20260626-084312.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Does not prove all inter-VLAN policy behavior.
- recommended action: Publish sanitized network-state excerpt or adjust label to reconciliation summary.
- priority: P1

### ACT-CLAIM-009

- exact claim: DC01 evidence supports AD DS, DNS, DHCP, Group Policy, FSMO role ownership, and Windows Server 2022 administration in the lab.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw DC01 inventory includes account/object details; screenshots are supplements but not enough for every subclaim.
- direct evidence available: inventories/dc01-inventory-20260626-022543.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Lab administration only; no enterprise scale or production SLA implied.
- recommended action: Publish sanitized DC01 role/FSMO/DNS/DHCP/GPO excerpt and retitle visual-only links where needed.
- priority: P1

### ACT-CLAIM-010

- exact claim: The AD/FSMO screenshot displays DC01 AD DS role and FSMO role state.
- current problem: DIRECT_PUBLIC_VISUAL_NOT_INSPECTED / Binary screenshot path exists; this audit did not OCR/re-render the PNG contents.
- direct evidence available: evidence-library/projects/on-prem-home-lab/screenshots/figure-02-dc01-adds-fsmo-roles.png
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Validated if visual contents remain as captioned
- limitation: Screenshot is visual evidence only for visible state.
- recommended action: Pair with sanitized DC01 inventory for stronger proof.
- priority: P2

### ACT-CLAIM-011

- exact claim: The DNS screenshot displays forward and reverse DNS zone state for DC01.
- current problem: DIRECT_PUBLIC_VISUAL_NOT_INSPECTED / Binary screenshot path exists; no OCR performed.
- direct evidence available: evidence-library/projects/on-prem-home-lab/screenshots/figure-04-dc01-dns-forward-reverse-zones.png
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Validated if visible contents match caption
- limitation: Visual evidence only; does not prove all DNS records are correct.
- recommended action: Add sanitized exported DNS evidence for command-verifiable support.
- priority: P2

### ACT-CLAIM-012

- exact claim: The DHCP screenshot displays DC01 DHCP scope and option state.
- current problem: DIRECT_PUBLIC_VISUAL_NOT_INSPECTED / Binary screenshot path exists; no OCR performed.
- direct evidence available: evidence-library/projects/on-prem-home-lab/screenshots/figure-05-dc01-dhcp-scope-options.png
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Validated if visible contents match caption
- limitation: Visual evidence only; does not prove full DHCP service health.
- recommended action: Add sanitized DHCP export if making command-verified claim.
- priority: P2

### ACT-CLAIM-013

- exact claim: The GPO screenshot displays a Group Policy inventory state.
- current problem: DIRECT_PUBLIC_VISUAL_NOT_INSPECTED / Binary screenshot path exists; no OCR performed.
- direct evidence available: evidence-library/projects/on-prem-home-lab/screenshots/figure-07-dc01-gpo-inventory.png
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Validated if visible contents match caption
- limitation: Visual evidence only; does not prove policy application to every endpoint.
- recommended action: Add sanitized GPO export if broader claim remains.
- priority: P2

### ACT-CLAIM-014

- exact claim: The Linux01 screenshot displays Linux system state evidence.
- current problem: DIRECT_PUBLIC_VISUAL_NOT_INSPECTED / Binary screenshot path exists; no OCR performed.
- direct evidence available: evidence-library/projects/on-prem-home-lab/screenshots/figure-12-linux01-system-state.png
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Validated if visible contents match caption
- limitation: Pair with Linux01 inventory for direct command output.
- recommended action: Do not use screenshot alone for SSSD/Kerberos/UFW/sudo claims.
- priority: P2

### ACT-CLAIM-015

- exact claim: The evidence archive screenshot displays central evidence export/hash state.
- current problem: DIRECT_PUBLIC_VISUAL_NOT_INSPECTED / Binary screenshot path exists; no OCR performed.
- direct evidence available: evidence-library/projects/on-prem-home-lab/screenshots/figure-15-dc01-central-evidence-export-validation.png
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Validated if visible contents match caption
- limitation: Visual hash display does not replace manifest/provenance records.
- recommended action: Pair with public hash/provenance records rather than label as full evidence.
- priority: P2

### ACT-CLAIM-021

- exact claim: The lab has an OpenVPN management path used for controlled management access, with DC01 DNS/RDP reachability observed from that path.
- current problem: DIRECT_SOURCE_AVAILABLE / Source reconciliation records observed reachability and timeout-only boundaries.
- direct evidence available: evidence/home-lab-source-reconciliation-20260626-012606.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SAFE
- exact link-label change: Use a precise target label that names the artifact type.
- exact classification change: Validated
- limitation: TCP reachability is not full service validation.
- recommended action: Change public link label from full evidence to reconciliation summary unless sanitized direct capture is published.
- priority: P2

### ACT-CLAIM-023

- exact claim: Linux01 initially had SSSD responder activation conflicts involving enabled failed sockets and a rejected config_file_version=2 directive.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw remediation evidence includes root paths and identity test details; publish sanitized procedure excerpt.
- direct evidence available: evidence/linux01-sssd-remediation-20260626-110159.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Applies to Linux01 in the personal lab only.
- recommended action: Publish sanitized SSSD diagnostic excerpt or relabel current link as supporting summary.
- priority: P1

### ACT-CLAIM-024

- exact claim: Linux01 SSSD remediation removed only the rejected directive, disabled conflicting NSS/PAM/PAC sockets, restarted SSSD, and cleared failed-unit state.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw evidence includes file paths and account identity; sanitized direct procedure excerpt required.
- direct evidence available: evidence/linux01-sssd-remediation-20260626-110159.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: No broader Linux hardening assurance implied.
- recommended action: Publish sanitized remediation-step excerpt or relabel summary link.
- priority: P1

### ACT-CLAIM-025

- exact claim: Post-remediation validation showed sssd.service enabled/active, zero failed units, SSSD config validation passed, AD identity lookup passed, and a new AD-authenticated SSH session passed.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Direct procedure exists but raw identity/host details should be reduced before publication.
- direct evidence available: evidence/linux01-sssd-remediation-20260626-110159.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Validates Linux01 SSSD/SSH path only; not all domain-authentication scenarios.
- recommended action: Publish sanitized validation excerpt; do not use unrelated SSSD evidence for non-Linux claims.
- priority: P1

### ACT-CLAIM-052

- exact claim: Linux01 has rsyslog/logging evidence in the lab inventory.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw Linux inventory includes rsyslog listener state plus host identifiers; sanitized excerpt required.
- direct evidence available: inventories/linux01-inventory-20260626-084312.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Does not prove centralized log retention, alerting, or SIEM capability.
- recommended action: Publish sanitized rsyslog-specific excerpt or narrow public wording.
- priority: P1

## home-lab-operations-proof.html

### ACT-CLAIM-004

- exact claim: DC01 is VM 200 running Windows Server 2022 and serving the ad.jeremyfontenot.online/JFAD domain.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw DC01 inventory includes executing account and internal object details; publish a sanitized excerpt only.
- direct evidence available: inventories/dc01-inventory-20260626-022543.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Personal lab domain only; no employer or production administration implied.
- recommended action: Add sanitized DC01 inventory excerpt and keep screenshots as visual supplements.
- priority: P1

### ACT-CLAIM-005

- exact claim: WS01 is VM 300 running Windows 10 Pro 10.0.19045 build 19045 on the lab network.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw WS01 inventory includes account and local admin details; sanitized excerpt required for publication.
- direct evidence available: inventories/ws01-inventory-20260626-012952.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Does not establish production workstation administration.
- recommended action: Publish sanitized WS01 OS/network/domain excerpt before linking as direct public proof.
- priority: P1

### ACT-CLAIM-006

- exact claim: Linux01 is VM 400 running Ubuntu 26.04 LTS with kernel 7.0.0-22-generic.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw Linux inventory includes host identifiers and execution context; publish a narrow sanitized excerpt.
- direct evidence available: inventories/linux01-inventory-20260626-084312.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Personal lab host only.
- recommended action: Use sanitized Linux01 OS/kernel excerpt; keep screenshot as visual supplement.
- priority: P1

### ACT-CLAIM-007

- exact claim: Linux01 is on VLAN 30 at 10.10.30.20/24 with gateway 10.10.30.1 and DNS 10.10.20.10.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw inventory includes internal host identifiers; sanitize to network fields and provenance hash.
- direct evidence available: inventories/linux01-inventory-20260626-084312.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Does not prove all inter-VLAN policy behavior.
- recommended action: Publish sanitized network-state excerpt or adjust label to reconciliation summary.
- priority: P1

### ACT-CLAIM-023

- exact claim: Linux01 initially had SSSD responder activation conflicts involving enabled failed sockets and a rejected config_file_version=2 directive.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw remediation evidence includes root paths and identity test details; publish sanitized procedure excerpt.
- direct evidence available: evidence/linux01-sssd-remediation-20260626-110159.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Applies to Linux01 in the personal lab only.
- recommended action: Publish sanitized SSSD diagnostic excerpt or relabel current link as supporting summary.
- priority: P1

### ACT-CLAIM-024

- exact claim: Linux01 SSSD remediation removed only the rejected directive, disabled conflicting NSS/PAM/PAC sockets, restarted SSSD, and cleared failed-unit state.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw evidence includes file paths and account identity; sanitized direct procedure excerpt required.
- direct evidence available: evidence/linux01-sssd-remediation-20260626-110159.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: No broader Linux hardening assurance implied.
- recommended action: Publish sanitized remediation-step excerpt or relabel summary link.
- priority: P1

### ACT-CLAIM-025

- exact claim: Post-remediation validation showed sssd.service enabled/active, zero failed units, SSSD config validation passed, AD identity lookup passed, and a new AD-authenticated SSH session passed.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Direct procedure exists but raw identity/host details should be reduced before publication.
- direct evidence available: evidence/linux01-sssd-remediation-20260626-110159.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Validates Linux01 SSSD/SSH path only; not all domain-authentication scenarios.
- recommended action: Publish sanitized validation excerpt; do not use unrelated SSSD evidence for non-Linux claims.
- priority: P1

### ACT-CLAIM-026

- exact claim: Pre- and post-remediation SSSD hashes were recorded for provenance.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Hashes are safe but raw file includes adjacent root paths and identity validation details.
- direct evidence available: evidence/linux01-sssd-remediation-20260626-110159.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Hash traceability does not prove a broader control framework.
- recommended action: Publish hash-only/provenance excerpt rather than raw remediation record.
- priority: P1

### ACT-CLAIM-027

- exact claim: The repository structure validation script passed with pwsh -NoProfile -File .\tests\Test-RepositoryStructure.ps1.
- current problem: DIRECT_SOURCE_AVAILABLE_WITH_RECENCY_LIMITATION / Procedure artifact exists but predates the audited ops commit; use with a recency limitation.
- direct evidence available: evidence/repository-validation-20260626-010050.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SAFE
- exact link-label change: Use a precise target label that names the artifact type.
- exact classification change: Validated with limitation
- limitation: Direct result artifact is not from audited ops commit 6b9f043; rerun/capture if presenting as current.
- recommended action: Collect commit-specific validation output or downgrade to documented prior pass.
- priority: P2

### ACT-CLAIM-028

- exact claim: The HomeLab baseline framework test passed.
- current problem: SUPPORTING_ONLY_NEEDS_DOWNGRADE / Only a public operations summary row was found; no direct command output artifact matched this pass at the audited commit.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented until direct test output is collected
- limitation: Summary-only pass statement.
- recommended action: Collect direct read-only test output or downgrade from Verified/Tested.
- priority: P1

### ACT-CLAIM-029

- exact claim: The portfolio home-lab drift validation test passed.
- current problem: SUPPORTING_ONLY_NEEDS_DOWNGRADE / No direct captured output for this specific drift test was found in active public evidence or ops source evidence.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented until direct test output is collected
- limitation: Summary-only pass statement.
- recommended action: Collect direct test output or downgrade public classification.
- priority: P1

### ACT-CLAIM-030

- exact claim: JSON parsing, PowerShell parser validation, Bash syntax checks, policy-aware connectivity checks, and Git whitespace checks were included in the operations validation set.
- current problem: SUPPORTING_ONLY_NEEDS_DOWNGRADE / Summary lists validation categories, but direct per-check output was not found for every named check.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented partial validation
- limitation: Do not present as fully command-verified without direct command output for each check.
- recommended action: Collect direct outputs per check or narrow wording.
- priority: P1

### ACT-CLAIM-046

- exact claim: The public portfolio does not claim employer production administration, enterprise scale, guaranteed uptime, RTO/RPO, recurring restore assurance, or full security assurance.
- current problem: LIMITATION_INDEX_SUPPORTED / Claim-map/index can document explicit public boundary; it is not direct proof for any positive technical state.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Limitation
- limitation: Boundary statement; requires continued site-wide wording review.
- recommended action: Keep visible limitation and ensure no active page contradicts it.
- priority: P2

### ACT-CLAIM-047

- exact claim: Raw private materials were excluded from the public operations proof set.
- current problem: SUPPORTING_ONLY_LIMITATION / Redaction/supporting records document exclusion; absence of private material cannot be fully proven by summaries alone.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented limitation
- limitation: Requires manual review before any future copy/publish operation.
- recommended action: Keep as documented redaction boundary.
- priority: P2

## proof.html

### ACT-CLAIM-004

- exact claim: DC01 is VM 200 running Windows Server 2022 and serving the ad.jeremyfontenot.online/JFAD domain.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw DC01 inventory includes executing account and internal object details; publish a sanitized excerpt only.
- direct evidence available: inventories/dc01-inventory-20260626-022543.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Personal lab domain only; no employer or production administration implied.
- recommended action: Add sanitized DC01 inventory excerpt and keep screenshots as visual supplements.
- priority: P1

### ACT-CLAIM-005

- exact claim: WS01 is VM 300 running Windows 10 Pro 10.0.19045 build 19045 on the lab network.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw WS01 inventory includes account and local admin details; sanitized excerpt required for publication.
- direct evidence available: inventories/ws01-inventory-20260626-012952.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Does not establish production workstation administration.
- recommended action: Publish sanitized WS01 OS/network/domain excerpt before linking as direct public proof.
- priority: P1

### ACT-CLAIM-006

- exact claim: Linux01 is VM 400 running Ubuntu 26.04 LTS with kernel 7.0.0-22-generic.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw Linux inventory includes host identifiers and execution context; publish a narrow sanitized excerpt.
- direct evidence available: inventories/linux01-inventory-20260626-084312.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Personal lab host only.
- recommended action: Use sanitized Linux01 OS/kernel excerpt; keep screenshot as visual supplement.
- priority: P1

### ACT-CLAIM-007

- exact claim: Linux01 is on VLAN 30 at 10.10.30.20/24 with gateway 10.10.30.1 and DNS 10.10.20.10.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw inventory includes internal host identifiers; sanitize to network fields and provenance hash.
- direct evidence available: inventories/linux01-inventory-20260626-084312.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Does not prove all inter-VLAN policy behavior.
- recommended action: Publish sanitized network-state excerpt or adjust label to reconciliation summary.
- priority: P1

### ACT-CLAIM-009

- exact claim: DC01 evidence supports AD DS, DNS, DHCP, Group Policy, FSMO role ownership, and Windows Server 2022 administration in the lab.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw DC01 inventory includes account/object details; screenshots are supplements but not enough for every subclaim.
- direct evidence available: inventories/dc01-inventory-20260626-022543.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Lab administration only; no enterprise scale or production SLA implied.
- recommended action: Publish sanitized DC01 role/FSMO/DNS/DHCP/GPO excerpt and retitle visual-only links where needed.
- priority: P1

### ACT-CLAIM-010

- exact claim: The AD/FSMO screenshot displays DC01 AD DS role and FSMO role state.
- current problem: DIRECT_PUBLIC_VISUAL_NOT_INSPECTED / Binary screenshot path exists; this audit did not OCR/re-render the PNG contents.
- direct evidence available: evidence-library/projects/on-prem-home-lab/screenshots/figure-02-dc01-adds-fsmo-roles.png
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Validated if visual contents remain as captioned
- limitation: Screenshot is visual evidence only for visible state.
- recommended action: Pair with sanitized DC01 inventory for stronger proof.
- priority: P2

### ACT-CLAIM-011

- exact claim: The DNS screenshot displays forward and reverse DNS zone state for DC01.
- current problem: DIRECT_PUBLIC_VISUAL_NOT_INSPECTED / Binary screenshot path exists; no OCR performed.
- direct evidence available: evidence-library/projects/on-prem-home-lab/screenshots/figure-04-dc01-dns-forward-reverse-zones.png
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Validated if visible contents match caption
- limitation: Visual evidence only; does not prove all DNS records are correct.
- recommended action: Add sanitized exported DNS evidence for command-verifiable support.
- priority: P2

### ACT-CLAIM-012

- exact claim: The DHCP screenshot displays DC01 DHCP scope and option state.
- current problem: DIRECT_PUBLIC_VISUAL_NOT_INSPECTED / Binary screenshot path exists; no OCR performed.
- direct evidence available: evidence-library/projects/on-prem-home-lab/screenshots/figure-05-dc01-dhcp-scope-options.png
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Validated if visible contents match caption
- limitation: Visual evidence only; does not prove full DHCP service health.
- recommended action: Add sanitized DHCP export if making command-verified claim.
- priority: P2

### ACT-CLAIM-013

- exact claim: The GPO screenshot displays a Group Policy inventory state.
- current problem: DIRECT_PUBLIC_VISUAL_NOT_INSPECTED / Binary screenshot path exists; no OCR performed.
- direct evidence available: evidence-library/projects/on-prem-home-lab/screenshots/figure-07-dc01-gpo-inventory.png
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Validated if visible contents match caption
- limitation: Visual evidence only; does not prove policy application to every endpoint.
- recommended action: Add sanitized GPO export if broader claim remains.
- priority: P2

### ACT-CLAIM-014

- exact claim: The Linux01 screenshot displays Linux system state evidence.
- current problem: DIRECT_PUBLIC_VISUAL_NOT_INSPECTED / Binary screenshot path exists; no OCR performed.
- direct evidence available: evidence-library/projects/on-prem-home-lab/screenshots/figure-12-linux01-system-state.png
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Validated if visible contents match caption
- limitation: Pair with Linux01 inventory for direct command output.
- recommended action: Do not use screenshot alone for SSSD/Kerberos/UFW/sudo claims.
- priority: P2

### ACT-CLAIM-021

- exact claim: The lab has an OpenVPN management path used for controlled management access, with DC01 DNS/RDP reachability observed from that path.
- current problem: DIRECT_SOURCE_AVAILABLE / Source reconciliation records observed reachability and timeout-only boundaries.
- direct evidence available: evidence/home-lab-source-reconciliation-20260626-012606.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SAFE
- exact link-label change: Use a precise target label that names the artifact type.
- exact classification change: Validated
- limitation: TCP reachability is not full service validation.
- recommended action: Change public link label from full evidence to reconciliation summary unless sanitized direct capture is published.
- priority: P2

### ACT-CLAIM-023

- exact claim: Linux01 initially had SSSD responder activation conflicts involving enabled failed sockets and a rejected config_file_version=2 directive.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw remediation evidence includes root paths and identity test details; publish sanitized procedure excerpt.
- direct evidence available: evidence/linux01-sssd-remediation-20260626-110159.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Applies to Linux01 in the personal lab only.
- recommended action: Publish sanitized SSSD diagnostic excerpt or relabel current link as supporting summary.
- priority: P1

### ACT-CLAIM-024

- exact claim: Linux01 SSSD remediation removed only the rejected directive, disabled conflicting NSS/PAM/PAC sockets, restarted SSSD, and cleared failed-unit state.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw evidence includes file paths and account identity; sanitized direct procedure excerpt required.
- direct evidence available: evidence/linux01-sssd-remediation-20260626-110159.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: No broader Linux hardening assurance implied.
- recommended action: Publish sanitized remediation-step excerpt or relabel summary link.
- priority: P1

### ACT-CLAIM-025

- exact claim: Post-remediation validation showed sssd.service enabled/active, zero failed units, SSSD config validation passed, AD identity lookup passed, and a new AD-authenticated SSH session passed.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Direct procedure exists but raw identity/host details should be reduced before publication.
- direct evidence available: evidence/linux01-sssd-remediation-20260626-110159.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Validates Linux01 SSSD/SSH path only; not all domain-authentication scenarios.
- recommended action: Publish sanitized validation excerpt; do not use unrelated SSSD evidence for non-Linux claims.
- priority: P1

### ACT-CLAIM-026

- exact claim: Pre- and post-remediation SSSD hashes were recorded for provenance.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Hashes are safe but raw file includes adjacent root paths and identity validation details.
- direct evidence available: evidence/linux01-sssd-remediation-20260626-110159.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Hash traceability does not prove a broader control framework.
- recommended action: Publish hash-only/provenance excerpt rather than raw remediation record.
- priority: P1

### ACT-CLAIM-027

- exact claim: The repository structure validation script passed with pwsh -NoProfile -File .\tests\Test-RepositoryStructure.ps1.
- current problem: DIRECT_SOURCE_AVAILABLE_WITH_RECENCY_LIMITATION / Procedure artifact exists but predates the audited ops commit; use with a recency limitation.
- direct evidence available: evidence/repository-validation-20260626-010050.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SAFE
- exact link-label change: Use a precise target label that names the artifact type.
- exact classification change: Validated with limitation
- limitation: Direct result artifact is not from audited ops commit 6b9f043; rerun/capture if presenting as current.
- recommended action: Collect commit-specific validation output or downgrade to documented prior pass.
- priority: P2

### ACT-CLAIM-028

- exact claim: The HomeLab baseline framework test passed.
- current problem: SUPPORTING_ONLY_NEEDS_DOWNGRADE / Only a public operations summary row was found; no direct command output artifact matched this pass at the audited commit.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented until direct test output is collected
- limitation: Summary-only pass statement.
- recommended action: Collect direct read-only test output or downgrade from Verified/Tested.
- priority: P1

### ACT-CLAIM-029

- exact claim: The portfolio home-lab drift validation test passed.
- current problem: SUPPORTING_ONLY_NEEDS_DOWNGRADE / No direct captured output for this specific drift test was found in active public evidence or ops source evidence.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented until direct test output is collected
- limitation: Summary-only pass statement.
- recommended action: Collect direct test output or downgrade public classification.
- priority: P1

### ACT-CLAIM-030

- exact claim: JSON parsing, PowerShell parser validation, Bash syntax checks, policy-aware connectivity checks, and Git whitespace checks were included in the operations validation set.
- current problem: SUPPORTING_ONLY_NEEDS_DOWNGRADE / Summary lists validation categories, but direct per-check output was not found for every named check.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented partial validation
- limitation: Do not present as fully command-verified without direct command output for each check.
- recommended action: Collect direct outputs per check or narrow wording.
- priority: P1

### ACT-CLAIM-037

- exact claim: Microsoft 365 admin-center screenshots visually support tenant, domain, active user, group, and license states.
- current problem: DIRECT_PUBLIC_VISUAL_NOT_INSPECTED / Binary screenshots exist; this audit did not OCR/re-render image contents.
- direct evidence available: evidence-library/projects/microsoft-365-lab/evidence/entra-exports-20260605-073748/m365-admin-center-homepage-20260605.png
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Validated if visible contents match proof map
- limitation: Screenshots are visual supplements; prefer CSV/JSON where available.
- recommended action: Keep screenshots as visual evidence, not replacements for CSV/JSON exports.
- priority: P2

### ACT-CLAIM-038

- exact claim: Microsoft 365 proof inventories and hash records track public evidence artifacts.
- current problem: INDEX_ONLY_TRACEABILITY / Inventories and hash records are INDEX artifacts, not primary proof for underlying tenant-state claims.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented
- limitation: Index artifacts support traceability only.
- recommended action: Do not label inventory/hash rows as full evidence for tenant state.
- priority: P2

### ACT-CLAIM-046

- exact claim: The public portfolio does not claim employer production administration, enterprise scale, guaranteed uptime, RTO/RPO, recurring restore assurance, or full security assurance.
- current problem: LIMITATION_INDEX_SUPPORTED / Claim-map/index can document explicit public boundary; it is not direct proof for any positive technical state.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Limitation
- limitation: Boundary statement; requires continued site-wide wording review.
- recommended action: Keep visible limitation and ensure no active page contradicts it.
- priority: P2

### ACT-CLAIM-047

- exact claim: Raw private materials were excluded from the public operations proof set.
- current problem: SUPPORTING_ONLY_LIMITATION / Redaction/supporting records document exclusion; absence of private material cannot be fully proven by summaries alone.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented limitation
- limitation: Requires manual review before any future copy/publish operation.
- recommended action: Keep as documented redaction boundary.
- priority: P2

### ACT-CLAIM-050

- exact claim: Portfolio evidence represents personal lab and repository work unless explicitly labeled as employment experience.
- current problem: LIMITATION_PUBLIC_TEXT / Public boundary is stated on active pages; not a primary technical proof artifact.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Limitation
- limitation: Boundary must be maintained if future employment claims are added.
- recommended action: Keep wording and avoid overextending lab evidence to employer production work.
- priority: P2

### ACT-CLAIM-054

- exact claim: The public proof methodology relies on commands, authenticated inventories, manifests, hashes, screenshot review, repository validation, source paths, and limitations rather than dates alone.
- current problem: INDEX_ONLY_TRACEABILITY / Methodology claim is supported by indexes and public text; indexes are not primary proof for individual technical claims.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented
- limitation: Each underlying claim still requires its own direct evidence.
- recommended action: Keep methodology but do not use it as substitute proof.
- priority: P2

## dashboard.html

### ACT-CLAIM-040

- exact claim: Repository governance/deployment quality work includes static-site validation, sitemap checks, structured data, document hash records, screenshot review, and deployment workflow records.
- current problem: SUPPORTING_ONLY / Found supporting audit reports and source workflow files, but no single direct current procedure output for all named activities in active-surface scope.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented
- limitation: Do not present as one fully validated outcome without per-check direct outputs.
- recommended action: Keep as documented work summary or split into separately evidenced checks.
- priority: P2

### ACT-CLAIM-042

- exact claim: The dashboard reports six current-state manifest records.
- current problem: INDEX_ONLY_NEEDS_DOWNGRADE / Manifest is an INDEX artifact; it supports its own record count but is not primary proof for technical state.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented
- limitation: Index record count only.
- recommended action: Avoid treating this metric as direct system proof.
- priority: P1

### ACT-CLAIM-043

- exact claim: The dashboard reports nine public home-lab screenshots.
- current problem: INDEX_ONLY_NEEDS_DOWNGRADE / Screenshot manifest is an INDEX artifact; it supports count/listing, not each underlying technical claim.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented
- limitation: Count of screenshot artifacts only.
- recommended action: Keep as evidence-library inventory metric, not validated state proof.
- priority: P1

### ACT-CLAIM-044

- exact claim: The dashboard reports DOCX SHA-256 prefix d7e81a06dcfb for the public home-lab documentation.
- current problem: DIRECT_PUBLIC_BINARY_NOT_INSPECTED / Binary exists and can be hashed; this audit did not inspect DOCX contents.
- direct evidence available: assets/documents/Jeremy-Fontenot-On-Premises-Home-Lab-Documentation.docx
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Validated for file hash only
- limitation: Hash proves file identity only, not documentation accuracy.
- recommended action: Keep hash-specific wording; do not use the DOCX hash as proof of skill.
- priority: P2

### ACT-CLAIM-045

- exact claim: The public DOCX is published under assets/documents and mirrored in the evidence library with provenance tracking.
- current problem: DIRECT_PUBLIC_BINARY_NOT_INSPECTED / Binary file exists; provenance is index/traceability evidence.
- direct evidence available: assets/documents/Jeremy-Fontenot-On-Premises-Home-Lab-Documentation.docx
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: NOT_INSPECTED_BINARY
- exact link-label change: Keep visual/binary label precise; do not call it command-verified evidence.
- exact classification change: Documented
- limitation: File publication does not independently validate contained technical claims.
- recommended action: Keep as publication/provenance claim only.
- priority: P2

### ACT-CLAIM-046

- exact claim: The public portfolio does not claim employer production administration, enterprise scale, guaranteed uptime, RTO/RPO, recurring restore assurance, or full security assurance.
- current problem: LIMITATION_INDEX_SUPPORTED / Claim-map/index can document explicit public boundary; it is not direct proof for any positive technical state.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Limitation
- limitation: Boundary statement; requires continued site-wide wording review.
- recommended action: Keep visible limitation and ensure no active page contradicts it.
- priority: P2

### ACT-CLAIM-054

- exact claim: The public proof methodology relies on commands, authenticated inventories, manifests, hashes, screenshot review, repository validation, source paths, and limitations rather than dates alone.
- current problem: INDEX_ONLY_TRACEABILITY / Methodology claim is supported by indexes and public text; indexes are not primary proof for individual technical claims.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented
- limitation: Each underlying claim still requires its own direct evidence.
- recommended action: Keep methodology but do not use it as substitute proof.
- priority: P2

## resume.html

### ACT-CLAIM-004

- exact claim: DC01 is VM 200 running Windows Server 2022 and serving the ad.jeremyfontenot.online/JFAD domain.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw DC01 inventory includes executing account and internal object details; publish a sanitized excerpt only.
- direct evidence available: inventories/dc01-inventory-20260626-022543.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Personal lab domain only; no employer or production administration implied.
- recommended action: Add sanitized DC01 inventory excerpt and keep screenshots as visual supplements.
- priority: P1

### ACT-CLAIM-006

- exact claim: Linux01 is VM 400 running Ubuntu 26.04 LTS with kernel 7.0.0-22-generic.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw Linux inventory includes host identifiers and execution context; publish a narrow sanitized excerpt.
- direct evidence available: inventories/linux01-inventory-20260626-084312.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Personal lab host only.
- recommended action: Use sanitized Linux01 OS/kernel excerpt; keep screenshot as visual supplement.
- priority: P1

### ACT-CLAIM-009

- exact claim: DC01 evidence supports AD DS, DNS, DHCP, Group Policy, FSMO role ownership, and Windows Server 2022 administration in the lab.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw DC01 inventory includes account/object details; screenshots are supplements but not enough for every subclaim.
- direct evidence available: inventories/dc01-inventory-20260626-022543.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Lab administration only; no enterprise scale or production SLA implied.
- recommended action: Publish sanitized DC01 role/FSMO/DNS/DHCP/GPO excerpt and retitle visual-only links where needed.
- priority: P1

### ACT-CLAIM-021

- exact claim: The lab has an OpenVPN management path used for controlled management access, with DC01 DNS/RDP reachability observed from that path.
- current problem: DIRECT_SOURCE_AVAILABLE / Source reconciliation records observed reachability and timeout-only boundaries.
- direct evidence available: evidence/home-lab-source-reconciliation-20260626-012606.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SAFE
- exact link-label change: Use a precise target label that names the artifact type.
- exact classification change: Validated
- limitation: TCP reachability is not full service validation.
- recommended action: Change public link label from full evidence to reconciliation summary unless sanitized direct capture is published.
- priority: P2

### ACT-CLAIM-025

- exact claim: Post-remediation validation showed sssd.service enabled/active, zero failed units, SSSD config validation passed, AD identity lookup passed, and a new AD-authenticated SSH session passed.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Direct procedure exists but raw identity/host details should be reduced before publication.
- direct evidence available: evidence/linux01-sssd-remediation-20260626-110159.md
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Validates Linux01 SSSD/SSH path only; not all domain-authentication scenarios.
- recommended action: Publish sanitized validation excerpt; do not use unrelated SSSD evidence for non-Linux claims.
- priority: P1

### ACT-CLAIM-046

- exact claim: The public portfolio does not claim employer production administration, enterprise scale, guaranteed uptime, RTO/RPO, recurring restore assurance, or full security assurance.
- current problem: LIMITATION_INDEX_SUPPORTED / Claim-map/index can document explicit public boundary; it is not direct proof for any positive technical state.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Limitation
- limitation: Boundary statement; requires continued site-wide wording review.
- recommended action: Keep visible limitation and ensure no active page contradicts it.
- priority: P2

### ACT-CLAIM-050

- exact claim: Portfolio evidence represents personal lab and repository work unless explicitly labeled as employment experience.
- current problem: LIMITATION_PUBLIC_TEXT / Public boundary is stated on active pages; not a primary technical proof artifact.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Limitation
- limitation: Boundary must be maintained if future employment claims are added.
- recommended action: Keep wording and avoid overextending lab evidence to employer production work.
- priority: P2

### ACT-CLAIM-051

- exact claim: Service desk/RCA project records emphasize symptoms, scope, troubleshooting, root cause, remediation planning, and limitations without unsupported impact metrics.
- current problem: NO_DIRECT_MATCH / Active public page describes the project, but no direct RCA artifact in active proof links was matched.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented
- limitation: Do not present as validated operational incident outcome without direct RCA artifacts.
- recommended action: Fix missing anchor or remove evidence-style anchor; collect direct RCA artifact if stronger classification is needed.
- priority: P2

### ACT-CLAIM-052

- exact claim: Linux01 has rsyslog/logging evidence in the lab inventory.
- current problem: DIRECT_SOURCE_AVAILABLE_SANITIZE / Raw Linux inventory includes rsyslog listener state plus host identifiers; sanitized excerpt required.
- direct evidence available: inventories/linux01-inventory-20260626-084312.json
- direct evidence missing: None for the narrow claim; public copy may still need sanitization or relabeling.
- public-safety decision: SANITIZE
- exact link-label change: If linked target remains a summary/index, change 'Open full evidence' to 'Open supporting summary' or publish sanitized direct evidence first.
- exact classification change: Keep Validated only after sanitized direct evidence is public; otherwise use Documented/Validated source available.
- limitation: Does not prove centralized log retention, alerting, or SIEM capability.
- recommended action: Publish sanitized rsyslog-specific excerpt or narrow public wording.
- priority: P1

## contact.html

### ACT-CLAIM-040

- exact claim: Repository governance/deployment quality work includes static-site validation, sitemap checks, structured data, document hash records, screenshot review, and deployment workflow records.
- current problem: SUPPORTING_ONLY / Found supporting audit reports and source workflow files, but no single direct current procedure output for all named activities in active-surface scope.
- direct evidence available: NO_MATCH
- direct evidence missing: No PRIMARY/PROCEDURE/VISUAL direct artifact matched.
- public-safety decision: SAFE
- exact link-label change: Do not use 'Open full evidence'; use 'Open summary', 'Open manifest', or remove proof-style link.
- exact classification change: Documented
- limitation: Do not present as one fully validated outcome without per-check direct outputs.
- recommended action: Keep as documented work summary or split into separately evidenced checks.
- priority: P2
