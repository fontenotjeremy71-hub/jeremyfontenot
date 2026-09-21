# Validation Record

## Exchange Online

### Shared mailbox

**Status: COMPLETE**

Validated object:

- Display name: `IT Support Shared`
- Primary SMTP address: `shared-it@dev.jeremyfontenot.online`
- Recipient type: `SharedMailbox`

Delegation validated:

- Full Access: `jeremy.admin@1x76s5767.onmicrosoft.com`
- Send As: `jeremy.admin@1x76s5767.onmicrosoft.com`
- Send on Behalf: resolved to Jeremy Fontenot / `jeremy.admin@1x76s5767.onmicrosoft.com`

Functional message trace evidence shows a message sent as the shared mailbox with status `Delivered`.

### Distribution group

**Status: COMPLETE**

Validated object:

- Display name: `Project 3 Distribution List`
- Primary SMTP address: `project3-dl@dev.jeremyfontenot.online`
- Recipient type: `MailUniversalDistributionGroup`

Validated members:

- Jeremy Fontenot
- Adele Vance

### External sender transport rule

**Status: COMPLETE**

Validated rule:

- Name: `Project 3 - External Sender Pilot`
- State: `Enabled`
- Mode: `Enforce`
- Priority: `0`
- Sender scope: `NotInOrganization`
- Recipient: `jeremy.admin@1x76s5767.onmicrosoft.com`
- Action: prepend subject with `[ EXTERNAL]`

Functional validation:

- External test message was delivered with the external-subject marker.
- Defender Explorer showed the message and related test messages as delivered.

## Microsoft Defender

**Status: COMPLETE for reviewed baseline controls**

Reviewed and documented during the project:

- Anti-malware default policy
- Safe Attachments built-in protection
- Safe Links built-in protection
- Anti-phishing default policy
- Quarantine view
- Explorer message investigation view

Defender Explorer evidence confirms visibility of Project 3 test messages, including the external-sender validation message.

## Microsoft Entra Conditional Access

### Problem observed

**Status: REMEDIATED**

The `Project 3 License Test` account authenticated successfully but received sign-in error `53003` because Conditional Access blocked access.

Sign-in analysis showed two relevant policy evaluations:

- `Multifactor authentication for Microsoft partners and vendors` — Failure during the blocked attempt
- `Security info registration for Microsoft partners and vendors` — Failure with `Block`

The security-info registration policy was incorrectly scoped to `All users`, causing an internal tenant member to hit a policy intended for external/partner identities.

### Remediation

**Status: COMPLETE**

Policy scope changed from:

- Include: `All users`

to:

- Include: `Guest or external users`
- All six external identity categories selected
- External Microsoft Entra organizations: `All`

The existing emergency-access exclusions and trusted-location behavior were preserved.

### Audit validation

**Status: COMPLETE**

Relevant audit event:

- Activity: `Update conditional access policy`
- Result: `Success`
- Target: `Security info registration for Microsoft partners and vendors`
- Initiated by: Jeremy Fontenot
- Time: 2026-09-21T20:48:36Z

The audit record shows the policy changed away from `includeUsers: ["All"]` to external-user targeting.

### Post-remediation sign-in validation

**Status: COMPLETE**

Validated successful sign-in:

- User: `Project 3 License Test`
- UPN: `project3.license.test@1x76s5767.onmicrosoft.com`
- Application: `My Apps`
- Time: 2026-09-21T20:53:15Z
- Status: `Success`
- Authentication requirement: `Multifactor authentication`
- Additional detail: `MFA requirement satisfied by claim in the token`

Conditional Access evaluation after remediation:

- MFA policy: `Success`
- Secure password change policy: `Not applied`
- Reauthentication on sign-in risk policy: `Not applied`
- Security info registration block policy: `Not applied`

This demonstrates that the scope remediation removed the incorrect block without disabling MFA enforcement.

## Developer E5 licensing

### Effective user license

**Status: COMPLETE**

The `Project 3 License Test` account has an active effective license:

- SKU: `DEVELOPERPACK_V2_E5`
- SKU ID: `0d1bdf5e-c580-4ee9-9618-c9a88a800cdc`

The license-details response shows the majority of service plans provisioned successfully. At the captured point in time:

- `INTUNE_A` = `PendingInput`
- `INTUNE_O365` = `PendingActivation`

These non-final Intune states are documented rather than represented as completed provisioning.

### Group assignment

**Status: COMPLETE in Microsoft 365 Admin Center / Graph metadata discrepancy documented**

Microsoft 365 Admin Center shows:

- Group: `Project 3 E5 Licensing`
- Type: `Group`
- Developer E5 product selected
- Group apps and services available for management
- Licensing errors: `0`
- Members without licenses: `0`

However, Microsoft Graph repeatedly returned:

- Group `assignedLicenses: []`
- Group `licenseProcessingState: null`
- User `assignedByGroup: null`

An attempted direct removal of the user license returned the service error that the license was inherited from group membership. Because the Microsoft 365 licensing UI and service behavior contradict the Graph metadata, the discrepancy is preserved as a troubleshooting finding.

## Evidence handling

No passwords, tokens, private keys, recovery keys, LAPS passwords, or other secrets are included in this package.
