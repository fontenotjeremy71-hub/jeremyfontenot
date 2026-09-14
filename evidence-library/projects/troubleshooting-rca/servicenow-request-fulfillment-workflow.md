# ServiceNow Request Fulfillment Workflow

Status: Validated personal-lab evidence
Scope: ServiceNow Personal Developer Instance catalog request, approval, assignment, and procurement fulfillment workflow
Evidence type: Workflow case study

## Objective

Demonstrate a realistic ServiceNow service-request lifecycle from end-user catalog submission through approval and procurement fulfillment while keeping requester, approver, and fulfillment responsibilities separated.

## Technical Areas Demonstrated

- ServiceNow Service Catalog request handling.
- Request (`REQ`), Requested Item (`RITM`), and Catalog Task (`SCTASK`) relationships.
- Approval routing and role separation.
- Assignment groups and fulfillment ownership.
- User, group, and role administration required to make task assignment operational.
- Reference qualifier troubleshooting.
- Service Operations Workspace task handling.
- Work notes, task state progression, backorder handling, and estimated-delivery tracking.

## Validated Lab Workflow

The lab used a Standard Laptop catalog request submitted for Jeremy Fontenot. The request generated `REQ0010001` and `RITM0010001`. The requested item entered an approval stage and was assigned to approver David Loo. After approval, ServiceNow automatically created procurement catalog task `SCTASK0010001` with the instruction to pull the item from stock or order it from a vendor when required.

The task was automatically assigned to the Procurement assignment group, but the group initially had no usable fulfillment member. A dedicated lab user, `procurement.agent`, was created and added to the Procurement group so fulfillment could be performed under a separate operational identity rather than the requester or approver account.

## Assignment Troubleshooting

Adding the fulfillment user to the Procurement group alone did not make the user selectable in the Catalog Task `Assigned to` field. The field returned an invalid-reference condition.

Inspection of the `Task [task].assigned_to` dictionary configuration showed that the user reference was constrained by a role-based reference qualifier requiring the `itil` role. The lab user was granted `itil`, after which ServiceNow resolved the user as a valid assignee. This preserved the existing platform qualifier rather than weakening the dictionary configuration to bypass the problem.

## Fulfillment Validation

After the role and group requirements were satisfied:

- `SCTASK0010001` was assigned to Procurement Agent.
- Procurement Agent was impersonated to validate the fulfillment experience from the assignee perspective.
- The task was opened successfully in Service Operations Workspace.
- A fulfillment-start work note was recorded.
- The task state was advanced from Open to work in progress.
- The linked `RITM0010001` was accessible to the fulfillment user.
- The requested item exposed fulfillment fields including `Backordered` and `Estimated delivery`.
- Because no stock asset was established in the lab, the workflow was intentionally modeled as vendor ordered rather than falsely claiming that physical inventory had been issued.

## Service Desk Escalation and Fulfillment Path

```text
User / Requester
       |
       v
Tier 1 Service Desk / Request Intake
       |
       v
Approval
       |
       v
Procurement Fulfillment
       |
       +----> Tier 2 / Platform Administration
       |          (assignment or access issue)
       |
       +----> Tier 3 / Engineering
       |          (platform defect or advanced configuration)
       |
       v
Resolution / Request Completion
       |
       v
Knowledge Base / Runbook Update
```

This diagram represents the support and escalation model demonstrated by the lab. The Tier 2/Tier 3 branches are escalation paths, not claims that this specific request required every tier.

## Result

The lab validated the relationship between Service Catalog request records, approval, automatically generated fulfillment tasks, assignment-group membership, role-qualified assignee selection, and fulfillment work in Service Operations Workspace. It also demonstrated troubleshooting a platform configuration dependency without modifying the protected reference qualifier.

## Claim Boundary

This is personal-lab work performed in a ServiceNow Personal Developer Instance. It demonstrates platform workflow understanding and hands-on administration but is not presented as production ServiceNow administration or employer-owned configuration.
