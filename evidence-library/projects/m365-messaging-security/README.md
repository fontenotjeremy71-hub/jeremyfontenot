# Project 3 Evidence Set

## Microsoft 365 Messaging & Security Administration

**Status:** IN PROGRESS / validated components documented below

This evidence package consolidates the configuration and validation work completed for Project 3. It is designed for portfolio use and avoids exposing passwords, recovery keys, tokens, private keys, or other authentication secrets.

## Validated areas

- Exchange Online shared mailbox configuration and delegation
- Exchange Online distribution group creation and membership
- Exchange Online external-sender transport rule
- Exchange message trace validation
- Microsoft Defender Explorer message visibility
- Microsoft Defender baseline mail protection review
- Microsoft Entra Conditional Access troubleshooting and remediation
- Conditional Access audit-log validation
- Successful post-remediation sign-in validation
- Microsoft 365 Developer E5 effective licensing validation
- Group-license assignment UI validation and documented Graph metadata discrepancy

## Important status note

Microsoft 365 Admin Center shows `Project 3 E5 Licensing` as a group assignment for the Developer E5 SKU, and the test user has an active effective E5 license. However, Microsoft Graph continued to return an empty `assignedLicenses` collection for the group and `assignedByGroup: null` for the user. This discrepancy is documented rather than hidden or represented as fully reconciled.

See `validation.md` and `evidence-index.md` for the evidence-to-claim mapping.
