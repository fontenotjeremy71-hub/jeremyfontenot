# ServiceNow Request Fulfillment & Procurement Workflow

## Objective

Validate a realistic ServiceNow Personal Developer Instance workflow from catalog request through approval, procurement fulfillment, deployment, and automatic request completion.

## Technical Areas Demonstrated

- ServiceNow Service Catalog request handling.
- Request (`REQ`), Requested Item (`RITM`), and Catalog Task (`SCTASK`) relationships.
- Approval routing and separation of duties.
- Assignment groups, users, and fulfillment ownership.
- Role-qualified assignee troubleshooting.
- Service Operations Workspace task handling.
- Work notes and customer-visible comments.
- Backorder and estimated-delivery tracking.
- Automatic workflow stage transitions and closure.

## Validated Workflow

A Standard Laptop request for Jeremy Fontenot generated `REQ0010001` and `RITM0010001`. The requested item entered approval and was approved by David Loo. ServiceNow then automatically created Procurement task `SCTASK0010001`.

The Procurement group initially had no usable fulfillment member. A dedicated lab identity, `procurement.agent`, was created and added to Procurement. Group membership alone did not make the user selectable in `Assigned to`; inspection of the `Task [task].assigned_to` dictionary configuration showed a reference qualifier requiring the `itil` role. Adding the required lab role resolved the invalid-reference condition without weakening the platform qualifier.

Procurement Agent was impersonated to validate the assignee experience. The task was moved to Work in Progress and fulfillment notes were recorded. Because no stock asset was established in the lab, the request was intentionally modeled as a vendor order rather than falsely claiming physical inventory fulfillment. `RITM0010001` was marked Backordered with an estimated delivery date, and a customer-visible status update was recorded.

Vendor delivery was then simulated. Backorder status was cleared, procurement completion was documented, and `SCTASK0010001` was closed complete. ServiceNow automatically advanced `RITM0010001` from Order Fulfillment to Deployment and created Field Services task `SCTASK0010002`.

A separate `field.services.agent` lab identity was created, granted the required `itil` role, and added to Field Services. The deployment task was assigned to that identity and validated through impersonation. Deployment notes were explicitly labeled `LAB SIMULATION`. The Configuration item field was intentionally left blank because no legitimate CI or physical asset was created.

After `SCTASK0010002` was closed complete, ServiceNow automatically changed `RITM0010001` to `Closed Complete` with Stage `Completed`. The parent `REQ0010001` then automatically changed from Open to `Closed Complete`.

The Request activity recorded:

> Request Automatically Closed as all Line Items were complete

Neither the RITM nor the parent REQ was manually forced closed.

## Workflow Path

```text
Requester
   |
   v
REQ0010001 / RITM0010001
   |
   v
Approval — David Loo
   |
   v
SCTASK0010001 — Procurement
   |
   +--> Vendor/backorder lab path
   |
   v
Procurement Closed Complete
   |
   v
Automatic RITM transition to Deployment
   |
   v
SCTASK0010002 — Field Services
   |
   v
LAB SIMULATION: endpoint deployment
   |
   v
Field Services Closed Complete
   |
   v
RITM automatically Closed Complete / Completed
   |
   v
REQ automatically Closed Complete
```

## Troubleshooting Finding

The most significant administrative issue was the inability to select the new Procurement fulfillment user in `Assigned to`. The root cause was not group membership. The `Task [task].assigned_to` reference qualifier required `itil`. Granting that role made the user a valid assignee while preserving the existing platform control.

## Result

The lab validated the complete relationship between Service Catalog request records, approval, automatically generated fulfillment tasks, assignment groups, role-qualified assignee selection, impersonated fulfillment, vendor/backorder tracking, sequential deployment work, automatic stage progression, and automatic request closure.

## Claim Boundary

This is personal-lab work performed in a ServiceNow Personal Developer Instance. Physical laptop procurement, vendor delivery, software installation, and user handoff were simulated. The project demonstrates platform workflow understanding and hands-on administration but does not claim production ServiceNow administration or employer-owned configuration.
