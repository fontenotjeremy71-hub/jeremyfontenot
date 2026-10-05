# MASTER PORTFOLIO REGISTRY

**Purpose:** Authoritative source-of-truth registry for Jeremy Fontenot's IT portfolio work.  
**Primary portfolio:** https://jeremyfontenot.online  
**Primary GitHub repository:** `fontenotjeremy71-hub/jeremyfontenot`  
**Registry last reconciled:** 2026-10-04  
**Status rule:** The current GitHub repository and live portfolio take precedence over older chats when they conflict. Unknown or unresolved facts are marked `NEEDS VERIFICATION`.

## Authority and Maintenance Rules

1. Use the current `main` branch of `fontenotjeremy71-hub/jeremyfontenot` as the primary documentation authority.
2. Use the live site at `https://jeremyfontenot.online` as the authority for what is publicly presented.
3. Use validated chat/project history and retained evidence as supporting sources when the repository or site does not contain the needed fact.
4. Never promote a project to `COMPLETE` solely because a major milestone is complete. The project's own current status definition controls.
5. Never expand a claim beyond the explicit lab, simulation, tenant, endpoint, or production boundary documented by the evidence.
6. When a status, completion date, evidence path, or validation date cannot be confirmed, use `NEEDS VERIFICATION`.
7. Update this file whenever a project's status, completion date, publication state, evidence package, or next milestone changes.

## Current Public Portfolio Set

The current `main` branch and deployed project routing define **13 public projects**. The repository `projects/README.md`, `assets/js/routes-projects.js`, and the non-JavaScript `projects.html` shell are synchronized on the 13-project state and use "Thirteen projects" where the count is presented.

---

## 01 — Windows LAPS & Advanced Group Policy

- **Project Name:** Windows LAPS & Advanced Group Policy
- **Current Status:** COMPLETE
- **Completion Date:** NEEDS VERIFICATION
- **GitHub Repository Path:** `projects/windows-laps-gpo/`
- **Portfolio URL:** https://jeremyfontenot.online/windows-laps-gpo.html
- **Evidence Status:** STRONG — implementation, validation, troubleshooting, sanitized evidence, and a reusable validation script are documented.
- **Evidence Location:** `projects/windows-laps-gpo/evidence/`; `projects/windows-laps-gpo/validation.md`; `projects/windows-laps-gpo/scripts/Validate-WindowsLAPS.ps1`; public proof anchor `/proof.html#laps-proof`
- **Last Validated:** NEEDS VERIFICATION for technical validation date; registry/publication state checked 2026-10-04
- **Next Milestone:** Maintenance-only unless the lab changes; revalidate after material AD/GPO/LAPS changes.
- **Notes / Claim Boundaries:** Personal Active Directory lab. Evidence supports modern Windows LAPS schema extension, OU scoping, GPO configuration, encrypted AD password storage, least-privilege retrieval, negative access testing, RSOP/event validation, and forced rotation. Actual passwords are excluded.

## 02 — Microsoft Entra Hybrid Identity & Cloud Sync

- **Project Name:** Microsoft Entra Hybrid Identity & Cloud Sync
- **Current Status:** COMPLETE
- **Completion Date:** NEEDS VERIFICATION
- **GitHub Repository Path:** `projects/entra-cloud-sync/`
- **Portfolio URL:** https://jeremyfontenot.online/entra-cloud-sync.html
- **Evidence Status:** STRONG — lifecycle validation, provisioning logs, source-anchor correlation, Password Hash Sync, group sync, troubleshooting, and a validation script are documented.
- **Evidence Location:** `projects/entra-cloud-sync/`; public proof anchor `/proof.html#entra-proof`
- **Last Validated:** NEEDS VERIFICATION for exact technical validation date; registry/publication state checked 2026-10-04
- **Next Milestone:** Maintenance-only unless Cloud Sync scope, agent placement, or tenant configuration changes.
- **Notes / Claim Boundaries:** Personal hybrid-identity lab. On-premises AD remains the source of authority for the tested synchronized objects. Scope is intentionally limited to the documented Cloud Sync OU.

## 03 — On-Premises Microsoft Home Lab

- **Project Name:** On-Premises Microsoft Home Lab
- **Current Status:** COMPLETE — validated portfolio scope; the lab itself remains an ongoing environment.
- **Completion Date:** NEEDS VERIFICATION
- **GitHub Repository Path:** `evidence-library/projects/on-prem-home-lab/` plus `on-prem-home-lab.html`
- **Portfolio URL:** https://jeremyfontenot.online/on-prem-home-lab.html
- **Evidence Status:** VERY STRONG — current-state records, dated validation folders, subsystem case studies, screenshots, restore evidence, and bounded results are preserved.
- **Evidence Location:** `evidence-library/projects/on-prem-home-lab/current-validated-state/`; `evidence-library/projects/on-prem-home-lab/validated-2026-06-21/`; `validated-2026-06-26/`; `validated-2026-06-29/`; `infrastructure-validation-2026-07/`
- **Last Validated:** Multiple dated validations exist through 2026-07; exact portfolio completion validation date NEEDS VERIFICATION. Registry/publication state checked 2026-10-04.
- **Next Milestone:** Continue operational maintenance and add new subsystem evidence only when meaningful; preserve explicit restore-result boundaries.
- **Notes / Claim Boundaries:** Personal nonproduction lab. Does not prove enterprise production ownership, HA, clustering, S2D, production DR readiness, RTO/RPO, SLA performance, or continuous availability. Restore testing contains PASS, narrow PASS, and INCONCLUSIVE results and must remain represented as such.

## 04 — Windows Admin Center Lab Management

- **Project Name:** Windows Admin Center Lab Management
- **Current Status:** COMPLETE
- **Completion Date:** NEEDS VERIFICATION
- **GitHub Repository Path:** `windows-admin-center-lab.html`; supporting home-lab evidence under `evidence-library/projects/on-prem-home-lab/`
- **Portfolio URL:** https://jeremyfontenot.online/windows-admin-center-lab.html
- **Evidence Status:** STRONG for documented centralized Windows management and connectivity/remoting validation; exact dedicated evidence directory NEEDS VERIFICATION.
- **Evidence Location:** Public case study and related home-lab evidence; public validation anchor `/windows-admin-center-lab.html#validation`
- **Last Validated:** NEEDS VERIFICATION; registry/publication state checked 2026-10-04
- **Next Milestone:** Revalidate only if the managed server inventory, gateway, authentication path, or remote-management topology materially changes.
- **Notes / Claim Boundaries:** Personal lab management. Does not imply production WAC administration or enterprise-scale fleet management.

## 05 — SCVMM 2022 Hyper-V Management

- **Project Name:** SCVMM 2022 Hyper-V Management
- **Current Status:** COMPLETE
- **Completion Date:** NEEDS VERIFICATION
- **GitHub Repository Path:** `evidence-library/projects/on-prem-home-lab/scvmm-2022/`
- **Portfolio URL:** https://jeremyfontenot.online/evidence-library/projects/on-prem-home-lab/scvmm-2022/
- **Evidence Status:** VERY STRONG — build, prerequisite remediation, host onboarding, logical networking, logical-switch conversion, VM operations, checkpoint lifecycle, remote console, and screenshots are documented.
- **Evidence Location:** `evidence-library/projects/on-prem-home-lab/scvmm-2022/`; public proof anchor `/proof.html#scvmm-proof`
- **Last Validated:** 2026-08-15 operational update is explicitly documented; any later technical validation NEEDS VERIFICATION.
- **Next Milestone:** Maintenance-only unless VMM topology changes; optional future work must not be described as already implemented.
- **Notes / Claim Boundaries:** One SCVMM management server, one nested Hyper-V host, and observed APP01 operations in a personal lab. No clustering, HA, live migration, S2D, or enterprise-scale claim.

## 06 — Azure Arc Hybrid Windows Management

- **Project Name:** Azure Arc Hybrid Windows Management
- **Current Status:** COMPLETE
- **Completion Date:** NEEDS VERIFICATION
- **GitHub Repository Path:** `evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/`
- **Portfolio URL:** https://jeremyfontenot.online/evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/
- **Evidence Status:** VERY STRONG — portal state, Connected Machine agent validation, Windows services, SQL extension/inventory, sanitized screenshots, manifest/integrity records, and explicit limitations are documented.
- **Evidence Location:** `evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/`; public proof anchor `/proof.html#azure-arc-proof`
- **Last Validated:** 2026-08-31 is explicitly identified as the fresh evidence collection date for the published state.
- **Next Milestone:** Restore an approved VMM01 remoting path and optionally re-read local Arc/SQL services and document exact Azure RBAC if those claims are later desired.
- **Notes / Claim Boundaries:** Supports two Arc-connected Windows Server lab machines and one SQL Server 2022 Developer instance. Does not prove production Azure administration, broad RBAC ownership, HA/DR, SLA performance, or enablement of Azure services not explicitly shown.

## 07 — APP01 Hyper-V Storage Expansion

- **Project Name:** APP01 Hyper-V Storage Expansion
- **Current Status:** COMPLETE
- **Completion Date:** NEEDS VERIFICATION
- **GitHub Repository Path:** `evidence-library/projects/on-prem-home-lab/app01-storage-expansion/` plus `app01-storage-expansion.html`
- **Portfolio URL:** https://jeremyfontenot.online/app01-storage-expansion.html
- **Evidence Status:** STRONG — checkpoint/VHDX relationship handling, expansion, guest partition review, NTFS provisioning, and before/after validation are represented.
- **Evidence Location:** `evidence-library/projects/on-prem-home-lab/app01-storage-expansion/`; public validation anchor `/app01-storage-expansion.html#validation`
- **Last Validated:** NEEDS VERIFICATION; registry/publication state checked 2026-10-04
- **Next Milestone:** No active implementation milestone; revalidate if APP01 storage layout changes.
- **Notes / Claim Boundaries:** Personal nested Hyper-V lab storage administration. Claims are limited to the documented VM/disk/guest changes and validation.

## 08 — Cross-Platform Administration & Support Method

- **Project Name:** Cross-Platform Administration & Support Method
- **Current Status:** COMPLETE
- **Completion Date:** NEEDS VERIFICATION
- **GitHub Repository Path:** `home-lab-operations-proof.html`; supporting evidence across `evidence-library/projects/on-prem-home-lab/`
- **Portfolio URL:** https://jeremyfontenot.online/home-lab-operations-proof.html
- **Evidence Status:** STRONG as a supporting project; cross-platform Windows, Linux, macOS, networking, identity, and troubleshooting evidence is distributed across the home-lab case studies.
- **Evidence Location:** `home-lab-operations-proof.html` and related home-lab evidence directories; public validation anchor `/home-lab-operations-proof.html#validation`
- **Last Validated:** NEEDS VERIFICATION; registry/publication state checked 2026-10-04
- **Next Milestone:** Keep this as a supporting method/project unless a new cross-platform scenario adds distinct recruiter value.
- **Notes / Claim Boundaries:** Supporting portfolio project, not a claim of enterprise fleet ownership. Individual platform claims remain bounded by their underlying evidence.

## 09 — ServiceNow Request Fulfillment & Procurement Workflow

- **Project Name:** ServiceNow Request Fulfillment & Procurement Workflow
- **Current Status:** IN PROGRESS — current request-fulfillment milestone is complete and validated.
- **Completion Date:** N/A — project remains in progress.
- **GitHub Repository Path:** `projects/servicenow-request-fulfillment/`
- **Portfolio URL:** https://jeremyfontenot.online/servicenow-request-fulfillment.html
- **Evidence Status:** STRONG for the completed workflow milestone.
- **Evidence Location:** `projects/servicenow-request-fulfillment/README.md`; public proof anchor `/proof.html#servicenow-proof`
- **Last Validated:** NEEDS VERIFICATION for exact milestone validation date; registry/publication state checked 2026-10-04
- **Next Milestone:** Define the remaining scope required to move the overall project from `IN PROGRESS` to `COMPLETE`, or deliberately retain it as an ongoing learning project.
- **Notes / Claim Boundaries:** Personal ServiceNow PDI. Physical laptop procurement, vendor delivery, software installation, and user handoff were simulated. The project demonstrates ServiceNow workflow understanding and hands-on lab administration, not employer production ownership.

## 10 — Microsoft 365 Messaging & Security Administration

- **Project Name:** Microsoft 365 Messaging & Security Administration
- **Current Status:** COMPLETE — based on current public routing, current `projects/README.md`, and the live portfolio.
- **Completion Date:** NEEDS VERIFICATION
- **GitHub Repository Path:** `evidence-library/projects/m365-messaging-security/` plus `m365-messaging-security.html`
- **Portfolio URL:** https://jeremyfontenot.online/m365-messaging-security.html
- **Evidence Status:** STRONG — Exchange Online, Defender, Conditional Access, sign-in validation, and Developer E5 licensing evidence are documented.
- **Evidence Location:** `evidence-library/projects/m365-messaging-security/`; public proof anchor `/proof.html#m365-messaging-security-proof`
- **Last Validated:** NEEDS VERIFICATION for exact final technical validation date; registry/publication state checked 2026-10-04
- **Next Milestone:** Maintenance-only unless the Microsoft 365 tenant configuration materially changes; preserve the documented Microsoft Graph licensing-metadata discrepancy rather than hiding or overstating it.
- **Notes / Claim Boundaries:** Personal Microsoft 365 Developer tenant. The evidence README is synchronized with the current COMPLETE project status. Group-license UI evidence and Graph metadata were not fully reconciled; the discrepancy remains part of the claim boundary and is not represented as resolved.

## 11 — Windows Autopilot & Intune MDM Provisioning

- **Project Name:** Windows Autopilot & Intune MDM Provisioning
- **Current Status:** COMPLETE
- **Completion Date:** 2026-09-22
- **GitHub Repository Path:** `projects/windows-autopilot-intune/`
- **Portfolio URL:** https://jeremyfontenot.online/windows-autopilot-intune.html
- **Evidence Status:** VERY STRONG — physical-device Autopilot, Entra join, Intune enrollment, branded OOBE, ESP, Microsoft 365 Apps, compliance, BitLocker, Defender, Firewall, VBS, Secure Boot remediation, and post-enrollment management are documented.
- **Evidence Location:** `projects/windows-autopilot-intune/evidence/`; `projects/windows-autopilot-intune/validation.md`; public proof anchor `/proof.html#autopilot-intune-proof`
- **Last Validated:** 2026-09-22 for project completion; registry/publication state checked 2026-10-04
- **Next Milestone:** Project is complete. Preserve the completed Autopilot evidence independently of later endpoint reuse or transition back to the on-premises AD lab.
- **Notes / Claim Boundaries:** Live physical-device personal-lab validation. Secrets and unique hardware/directory identifiers are excluded or redacted. Later reconfiguration of the endpoint does not invalidate the documented completed Autopilot project.

## 12 — macOS ABM to Intune Enterprise Runbook

- **Project Name:** macOS ABM to Intune Enterprise Runbook
- **Current Status:** COMPLETE — with explicit real-vs-simulated boundaries.
- **Completion Date:** NEEDS VERIFICATION
- **GitHub Repository Path:** `projects/macos-abm-intune-runbook/`
- **Portfolio URL:** https://jeremyfontenot.online/macos-abm-intune-runbook.html
- **Evidence Status:** STRONG for Microsoft/Apple-side configuration actually performed; appropriately documentary for simulated portions.
- **Evidence Location:** `projects/macos-abm-intune-runbook/evidence/`; `validation.md`; `architecture.md`; `simulated-deployment-scenario.md`; public proof anchor `/proof.html#macos-abm-intune-proof`
- **Last Validated:** APNs relationship was documented active with renewal due 2027-09-26; exact project completion date NEEDS VERIFICATION. Registry/publication state checked 2026-10-04.
- **Next Milestone:** Maintain/renew the APNs certificate before 2027-09-26 and preserve the simulated boundary unless a legitimate ABM/ADE/managed-Mac environment becomes available.
- **Notes / Claim Boundaries:** Real configuration includes APNs, macOS compliance, FileVault Settings Catalog, enrollment restriction review, and capability review. ABM organization, ADE assignment/enrollment, managed-Mac Platform SSO, live PKI/SCEP issuance, RADIUS auth, FileVault escrow from a managed Mac, managed-Mac compliance evaluation, app installation, and destructive lifecycle actions were not performed and must not be claimed as implemented.

## 13 — Microsoft 365 Graph Administration Lab

- **Project Name:** Microsoft 365 Graph Administration Lab
- **Current Status:** IN PROGRESS — seven read-only administration/reporting scripts validated.
- **Completion Date:** N/A — project remains in progress.
- **GitHub Repository Path:** `projects/m365-graph-administration-lab/`
- **Portfolio URL:** https://jeremyfontenot.online/m365-graph-administration-lab.html
- **Evidence Status:** STRONG for the seven validated scripts and documented Graph authentication/permission/troubleshooting behavior.
- **Evidence Location:** `projects/m365-graph-administration-lab/scripts/`; `projects/m365-graph-administration-lab/docs/`; public proof anchor `/proof.html#m365-graph-admin-proof`
- **Last Validated:** Current repository/public route checked 2026-10-04; exact last execution date for every script NEEDS VERIFICATION.
- **Next Milestone:** Define and complete the remaining Graph, Intune, Autopilot, governance, and security scope required before changing the project to COMPLETE.
- **Notes / Claim Boundaries:** Read-only delegated administration/reporting is currently proven. Live CSV exports are intentionally not public because they may contain UPNs, object IDs, device identifiers, and tenant-specific data. Do not imply write automation or broader Graph coverage that has not been validated.

---

# Active / Unpublished Portfolio Work

## 14 — ServiceNow Administration & ITSM Lab

- **Project Name:** ServiceNow Administration & ITSM Lab
- **Current Status:** IN PROGRESS — Phases 1–4 completed and validated; Phases 5–10 not started per current repository checkpoint.
- **Completion Date:** N/A — project remains in progress.
- **GitHub Repository Path:** `projects/servicenow-administration-itsm-lab/`
- **Portfolio URL:** NEEDS VERIFICATION — no dedicated public case-study route is currently present in the authoritative public project set.
- **Evidence Status:** MODERATE-TO-STRONG for Phases 1–4; final evidence consolidation intentionally pending.
- **Evidence Location:** `projects/servicenow-administration-itsm-lab/README.md`; retained Project chat screenshots and validation history; final evidence map is planned for Phase 10.
- **Last Validated:** Phases 1–4 were documented complete before 2026-10-04; exact per-phase completion dates NEEDS VERIFICATION.
- **Next Milestone:** Complete Phase 05 — Flow Designer Automation, then Phases 06–09, followed by Phase 10 final validation/evidence consolidation/publication.
- **Notes / Claim Boundaries:** Personal ServiceNow PDI. This project is intentionally distinct from the earlier Request Fulfillment project: it demonstrates platform administration, incident routing, SLA administration, notifications/escalation, Flow Designer, UI policies/business rules, knowledge, catalog administration, and reporting. It does not represent employer-owned production ServiceNow administration.

## 15 — Cloudflare Free-Plan Site Hardening

- **Project Name:** Cloudflare Free-Plan Site Hardening
- **Current Status:** SUBSTANTIALLY COMPLETE OPERATIONAL WORK — not currently a dedicated public portfolio project.
- **Completion Date:** NEEDS VERIFICATION
- **GitHub Repository Path:** NEEDS VERIFICATION
- **Portfolio URL:** Operationally applies to https://jeremyfontenot.online; no dedicated case-study URL confirmed.
- **Evidence Status:** MODERATE — configuration history indicates DDoS protection, managed WAF rules, Browser Integrity Check, AI Labyrinth, custom rules, rate limiting, HTTPS/HSTS, DNSSEC, caching/Brotli, and robots/sitemap work, but a single authoritative evidence package has not been confirmed.
- **Evidence Location:** Project chat history and live Cloudflare/site state; dedicated repository evidence location NEEDS VERIFICATION.
- **Last Validated:** Configuration work was performed through late September 2026; exact final validation timestamp NEEDS VERIFICATION.
- **Next Milestone:** Package the site's hosting/security architecture and strongest validation evidence, then decide whether it should become a standalone case study or remain an infrastructure/security operations section.
- **Notes / Claim Boundaries:** Cloudflare Free plan only. Do not imply controls or enterprise features that were not available/configured. The portfolio should distinguish observed configuration from comprehensive security assurance.

---

# Tracked Technical Work Not Currently Designated as Standalone Portfolio Projects

The following work is useful supporting evidence but is **not** currently treated as a separate portfolio project unless deliberately promoted later:

- Windows laptop domain join, OpenVPN, DNS, AD secure-channel, OU placement, and Group Policy integration work.
- HP laptop freeze/AMD display-driver troubleshooting and post-update stability testing.
- Individual Proxmox hardware/recovery incidents already represented as supporting home-lab operations where appropriate.
- Endpoint transition work performed after the completed Autopilot project.
- Routine portfolio maintenance, link/content audits, GitHub workflow checks, and site publishing operations.

These items should not increase the public project count unless a deliberate portfolio decision creates a new case study with a defined objective, validation record, evidence package, and claim boundary.

---

# Registry-Level Discrepancies / NEEDS VERIFICATION

1. **RESOLVED — Public project count shell mismatch:** `projects.html`, `assets/js/routes-projects.js`, and `projects/README.md` are synchronized on the authoritative 13-project state.
2. **RESOLVED — Microsoft 365 Messaging & Security status mismatch:** `evidence-library/projects/m365-messaging-security/README.md`, current routing, and `projects/README.md` now consistently represent the project as COMPLETE. Existing evidence limitations and the Microsoft Graph licensing-metadata discrepancy remain explicitly documented.
3. **Completion dates:** Exact completion dates are missing or unconfirmed for most completed projects. Do not infer them from file modification dates without explicit validation.
4. **Last-validated dates:** Several completed projects lack a single explicit final technical validation date. Repository/publication review on 2026-10-04 does not substitute for a technical validation date.
5. **ServiceNow Request Fulfillment:** The major workflow milestone is complete, but the broader project remains IN PROGRESS. The remaining completion criteria need to be defined.
6. **ServiceNow Administration & ITSM Lab:** Phases 1–4 are validated, but the project is not yet part of the authoritative 13-project public set.
7. **Cloudflare hardening:** Operationally meaningful, but no confirmed dedicated case-study/evidence package exists yet.

# Immediate Registry Priorities

1. Finish ServiceNow Administration & ITSM Lab Phases 5–10 and publish it only after the Phase 10 evidence audit.
2. Define Microsoft 365 Graph Administration Lab completion criteria and continue the planned scope.
3. Decide the final completion criteria for ServiceNow Request Fulfillment.
4. Fill exact completion dates and technical validation dates only from authoritative evidence.
5. Package Cloudflare hardening evidence and decide whether it becomes a standalone case study.
6. Update this registry immediately whenever any project status, publication state, evidence package, completion date, or next milestone changes.