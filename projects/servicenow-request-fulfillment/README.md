# ServiceNow Request Fulfillment & Procurement Workflow

## Objective

Validate a realistic ServiceNow Personal Developer Instance workflow from catalog request through approval, automatically generated fulfillment work, assignee troubleshooting, and procurement processing.

## What I Performed

- Submitted and traced a Standard Laptop catalog request through `REQ`, `RITM`, and `SCTASK` records.
- Validated approval routing and approval completion.
- Confirmed automatic creation of a Procurement catalog task after approval.
- Created a dedicated Procurement Agent lab identity and added it to the Procurement assignment group.
- Diagnosed why the fulfillment user could not initially be selected in `Assigned to`.
- Inspected the `Task [task].assigned_to` reference configuration and identified the `itil` role requirement.
- Added the required lab role instead of weakening the reference qualifier.
- Assigned the task to Procurement Agent and impersonated that identity to validate the assignee experience.
- Recorded fulfillment work notes and advanced task state.
- Opened the linked requested item and validated fulfillment controls for backorder and estimated delivery.
- Used a vendor-order lab path because no stock asset was established, avoiding an unsupported inventory claim.

## Result

The workflow demonstrated Service Catalog lifecycle knowledge, approval separation, assignment-group administration, role-based assignee qualification, Service Operations Workspace fulfillment, and configuration troubleshooting.

## Supporting Proof

[Review the detailed ServiceNow workflow evidence](../../evidence-library/projects/troubleshooting-rca/servicenow-request-fulfillment-workflow.md).

## Scope

Personal-lab validation in a ServiceNow Personal Developer Instance. This case study does not claim production ServiceNow administration or employer-owned configuration.
