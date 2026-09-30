# ServiceNow Administration & ITSM Lab

**Status:** In progress — Phases 1–4 completed and validated  
**Environment:** ServiceNow Personal Developer Instance (PDI)  
**Scope:** Administrative configuration and ITSM operations lab. This is not production or employer-owned ServiceNow administration.

## Project objective

Build and validate a realistic small internal IT support model while demonstrating ServiceNow administration beyond catalog request fulfillment.

The project follows this operating model:

```text
Requirement
→ Intended Configuration
→ Implementation
→ Validation
→ Result
```

Configuration is added only when it solves a realistic operational problem. Native declarative platform features are preferred over unnecessary scripting.

## Current checkpoint

| Phase | Area | Status |
|---|---|---|
| 01 | Administration Foundation & Incident Routing | Complete / validated |
| 02 | Incident Experience Configuration | Complete / validated |
| 03 | SLA Administration | Complete / validated |
| 04 | Notifications & Escalation | Complete / validated |
| 05 | Flow Designer Automation | Not started |
| 06 | UI Policies & Business Rules | Not started |
| 07 | Knowledge Management Administration | Not started |
| 08 | Service Catalog Administration | Not started |
| 09 | Reports & Dashboards | Not started |
| 10 | Final Validation & Portfolio Publication | Not started |

## Phase 01 — Administration Foundation & Incident Routing

### Requirement

Provide centralized Service Desk intake with least-privilege technician access and manual escalation to specialist support groups.

### Configuration

Dedicated lab support groups:

- `Lab Service Desk`
- `Lab Endpoint Support`
- `Lab Network Support`

Access is provided through group-derived `itil` role membership rather than broad direct administrator access.

Separate requester and technician identities are used for impersonation-based validation.

### Validation

Primary routing test record:

```text
INC0010010
```

Validated routing path:

```text
Lab Requester
→ new Incident
→ auto-assigned to Lab Service Desk
→ triaged
→ reassigned to Lab Network Support
→ visible/workable by Network Technician
```

### Result

The lab demonstrates centralized Tier 1 intake, manual Service Desk triage, specialist escalation, and role-qualified technician access without allowing requesters to route their own incidents directly to specialist teams.

## Phase 02 — Incident Experience Configuration

### Requirement

Make the Incident workspace useful for Service Desk triage without adding configuration merely to demonstrate platform features.

### Configuration

The existing Incident form was evaluated before making changes. The form already provided useful grouping for:

- classification
- impact and urgency
- calculated priority
- ownership
- activity

Priority remained platform-calculated/read-only rather than manually controlled.

The Incident list was adjusted for operational visibility so technicians can review classification and ownership information without opening every record.

The existing Phase 1 routing incident was reused instead of creating unnecessary duplicate test records.

### Validation

The final Incident experience was reviewed against the Service Desk operating model rather than against a checklist of available features.

### Result

The phase retained useful native behavior, improved technician visibility where needed, and avoided unnecessary UI Policies or other configuration reserved for later phases.

## Phase 03 — SLA Administration

### Requirement

Apply meaningful SLA administration to the Incident process and validate actual Task SLA behavior rather than merely creating SLA definitions.

### Result

SLA administration has been completed and validated in the PDI. Detailed SLA configuration, final test evidence, and any troubleshooting findings will be consolidated during Phase 10 so the repository does not publish unverified intermediate notes.

## Phase 04 — Notifications & Escalation

### Requirement

Use notifications for operationally useful Incident communication and escalation rather than generic email testing.

### Result

Notification and escalation administration has been completed and validated in the PDI. Detailed final notification conditions, recipients, evidence, and troubleshooting findings will be consolidated during Phase 10 after the remaining project phases are complete.

## Previous ServiceNow project boundary

A separate earlier project already demonstrates:

- Service Catalog fulfillment
- REQ → RITM → SCTASK relationships
- approvals
- Procurement and Field Services fulfillment
- users and groups
- `itil` role-qualified assignment
- reference-qualifier troubleshooting
- impersonation
- work notes and comments
- vendor/backorder handling
- automatic progression and closure

This administration lab intentionally does not rebuild those items simply for feature coverage.

See the prior project:

```text
projects/servicenow-request-fulfillment/
```

## Evidence policy

Evidence is retained when it proves a meaningful final administrative outcome. Routine intermediate clicks are not treated as portfolio evidence.

The final Phase 10 audit will reconcile screenshots with:

- configuration demonstrated
- observed behavior
- troubleshooting findings
- evidence identifiers
- final vs supporting evidence

No feature will be claimed as proven unless it was actually configured and validated.

## Claim boundary

All work in this project is performed in a ServiceNow Personal Developer Instance for hands-on administration practice. It demonstrates lab-based ServiceNow administration capability and ITSM understanding; it does not represent production or employer-owned configuration.
