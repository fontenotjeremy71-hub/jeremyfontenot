# Troubleshooting Runbook

Every troubleshooting scenario below distinguishes between actions that can be performed in Intune now and actions that require Apple Business Manager or an enrolled Mac.

## Device not appearing in Apple Business Manager

**Classification:** SIMULATED / DOCUMENTED

Check:

1. Purchase source is an Apple-authorized reseller or Apple direct channel that supports ABM assignment.
2. Organization ID and reseller/customer identifiers are correct.
3. Device serial is eligible for automated assignment.
4. Reseller has assigned the device to the correct ABM organization.
5. ABM sync/import has completed.

Do not troubleshoot Intune until the device exists in ABM.

## Device not synchronizing from ABM to Intune

**Classification:** SIMULATED / DOCUMENTED

Check:

1. Enrollment Program Token has not expired.
2. Token was created for the correct ABM MDM server.
3. Device is assigned to that MDM server in ABM.
4. Intune token sync completes without error.
5. Device serial appears under the correct token.

If the token has expired, renew the existing relationship rather than creating an unrelated replacement unless the relationship is intentionally being rebuilt.

## ADE profile not assigned

Check:

- device exists under the Enrollment Program Token;
- device was synchronized after assignment;
- profile assignment scope includes the device;
- no competing assignment exists;
- profile is active.

## Setup Assistant does not show expected panes

Check:

- device is actually using ADE;
- device has been erased/reset after the ADE assignment;
- latest ADE profile has synchronized;
- skipped Setup Assistant panes match the assigned profile;
- network access to Apple activation services is available.

## APNs communication problems

**REAL operational dependency**

Check:

- Intune Apple MDM Push Certificate status;
- certificate expiration date;
- same Apple account ownership used for renewal;
- certificate was renewed rather than replaced;
- device can reach Apple Push Notification service.

Replacing instead of renewing the APNs certificate can sever management continuity and should be treated as a high-risk administrative change.

## Company Portal / Entra authentication failure

Check:

- user can authenticate to Microsoft Entra;
- user is licensed for required Intune services;
- device time is correct;
- Conditional Access does not unintentionally block enrollment;
- Company Portal is supported on the installed macOS version;
- browser/web authentication completes successfully.

## Platform SSO registration failure

**Classification:** SIMULATED / DOCUMENTED endpoint procedure

Check:

- supported macOS version;
- Company Portal / Enterprise SSO plug-in prerequisites;
- Platform SSO profile is assigned;
- extension identifier and team identifier are correct;
- user completed required registration;
- Entra sign-in logs for authentication failures;
- profile conflicts or duplicate SSO payloads.

## FileVault not enabling

Check:

- FileVault policy assignment;
- device is supervised/managed as required by the chosen workflow;
- user has secure token capability where required;
- no conflicting FileVault payload exists;
- device has checked in after policy assignment;
- Intune per-setting status for policy errors.

## FileVault recovery key not escrowed

Check:

- FileVault is actually enabled;
- recovery-key escrow policy is assigned;
- device has checked in after FileVault activation;
- personal recovery key exists;
- recovery key is visible in the authorized Intune recovery workflow;
- no policy conflict is present.

Never collect or publish the actual recovery key in portfolio evidence.

## Compliance failure

Check each configured requirement individually:

- System Integrity Protection;
- password requirement;
- storage encryption;
- firewall;
- Stealth Mode;
- Gatekeeper state.

Use per-setting compliance status rather than guessing from the overall state.

## Enterprise Wi-Fi failure

Check:

- SSID spelling;
- security type;
- EAP type;
- trusted root certificate;
- client certificate availability;
- certificate subject/SAN requirements;
- certificate EKU;
- RADIUS trust chain;
- device time;
- wireless controller/NPS/RADIUS logs.

For EAP-TLS, troubleshoot certificate trust and identity before user credentials because the design is certificate-based.

## Application deployment failure

Check:

- app type matches packaging format;
- package is signed and compatible with the target macOS version;
- assignment is correct;
- detection logic/version metadata is valid;
- required privacy/system extension settings are deployed;
- device has checked in;
- Intune app install status and local logs.

## Expired Enrollment Program Token

Renew through the existing Apple Business Manager server relationship and upload the renewed token to Intune. Confirm the device count and sync after renewal.

## Device retirement

For user offboarding or BYOD-style management removal, prefer the least destructive action that satisfies the requirement. Preserve corporate data handling policy and confirm whether retire removes managed configuration without factory reset.

## Lost or stolen device

Escalate according to organization policy. Evaluate wipe, lock-related capabilities, identity-session revocation, certificate revocation, and asset reporting. Do not execute destructive actions without identity and ownership verification.
