# macOS Device Lifecycle Runbook

## 1. Procurement and assignment

**SIMULATED / DOCUMENTED**

Preferred enterprise path:

1. Purchase through Apple or an authorized reseller linked to the ABM organization.
2. Verify the device appears in Apple Business Manager.
3. Assign the device to the Microsoft Intune MDM server.
4. Synchronize the Enrollment Program Token in Intune.
5. Assign the correct ADE profile.

## 2. Enrollment

**SIMULATED / DOCUMENTED**

1. User powers on or resets the Mac.
2. Apple activation identifies the device as organization-owned.
3. ADE directs the device to Intune.
4. Setup Assistant applies the configured enrollment experience.
5. User authenticates where required.
6. Intune enrollment completes.
7. Company Portal / Platform SSO registration follows the organization design.

## 3. Configuration and security

Microsoft-side configuration demonstrated in the real tenant includes:

- compliance baseline;
- FileVault baseline;
- Platform SSO capability;
- enterprise Wi-Fi capability;
- certificate profile capability;
- app deployment capability.

Endpoint enforcement remains unvalidated without an enrolled Mac.

## 4. Inventory and ownership

The Intune macOS inventory surface exposes:

- device name;
- management authority;
- ownership;
- compliance;
- OS and version;
- primary user;
- last check-in.

Current lab inventory: **0 macOS devices**.

## 5. Routine operations

Available real Intune actions include:

- Sync — request management check-in.
- Restart — restart the managed device.
- Rename — change device display/name where supported.

## 6. Retirement

**SIMULATED / DOCUMENTED**

Use when management should be removed without treating the device as stolen or requiring a factory reset. Confirm ownership and data-handling requirements before choosing Retire.

## 7. Wipe

**SIMULATED / DOCUMENTED**

Use only after validating:

- device identity;
- ownership;
- authorization;
- data-retention requirements;
- reassignment or disposal plan.

A wipe is destructive and should be treated as a controlled administrative action.

## 8. Delete

Deleting the Intune object is not equivalent to securely wiping the device. Confirm the device has already been retired/wiped or otherwise handled appropriately before deleting the management record.

## 9. Reassignment

**SIMULATED / DOCUMENTED**

For corporate devices:

1. Capture required asset state.
2. Retire/wipe according to policy.
3. Reassign in ABM if the MDM destination changes.
4. Ensure the correct ADE profile is assigned.
5. Reset the Mac.
6. Enroll the next user through Setup Assistant.
7. Validate inventory, compliance, FileVault, apps, and authentication.

## 10. Lost or stolen device

**SIMULATED / DOCUMENTED**

1. Verify the asset and user.
2. Escalate to security/management.
3. Revoke or block identity sessions as policy requires.
4. Evaluate remote wipe.
5. Revoke device certificates where appropriate.
6. Preserve incident records.
7. Update asset ownership/status.
8. Do not expose recovery keys or credentials during evidence capture.
