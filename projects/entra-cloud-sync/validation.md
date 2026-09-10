# Validation

## Project Status
IN PROGRESS

## Controlled Identity Lifecycle Test

### User Provisioning
- Source user: `cloudsync.test01`
- Source UPN: `cloudsync.test01@jeremyfontenot.online`
- Source OU: `OU=Cloud Sync,OU=JFAD,DC=ad,DC=jeremyfontenot,DC=online`
- Microsoft Entra provisioning: Validated
- On-premises sync enabled: Yes

### Attribute Synchronization
- Attribute tested: `Department`
- On-premises value: `Hybrid Identity Lab`
- Microsoft Entra value: `Hybrid Identity Lab`
- Result: Validated

### Password Hash Synchronization
- Password changed on-premises
- Microsoft Entra authentication succeeded using the updated password
- Result: Validated

### Group Synchronization
- Source group: `GG-CloudSync-Test`
- Group type: Global Security
- Source: Windows Server Active Directory
- Microsoft Entra provisioning: Validated
- Direct synchronized members: 1
- Member: `Cloud Sync Test 01`

### Source Anchor Correlation
- AD ObjectGUID: `1e49a065-aa0d-4415-87d2-ee0ad0f4f1d2`
- Calculated source anchor: `ZaBJHg2qFUSH0u4K0PTx0g==`
- Microsoft Entra on-premises immutable ID matched the calculated source anchor
- Result: Validated

### Cloud Sync Health
- Configuration status: Healthy
- Provisioning agent: Active
- Users synchronized: 4
- Groups synchronized: 1
- Users/groups provisioning interval: 20 minutes
- Password Hash Sync interval: 5 minutes
- Provisioning failures in final validation window: None

## Overall Result
The controlled hybrid identity lifecycle test successfully validated Active Directory to Microsoft Entra provisioning, attribute synchronization, Password Hash Synchronization, security-group synchronization, membership synchronization, provisioning logs, and source-anchor correlation.

## Validation Matrix

| Validation Area | Source / Test | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| Cloud Sync agent service | `SYNC01` service state | Running / Automatic | Running / Automatic | COMPLETE |
| Cloud Sync agent in Entra | Cloud Sync Agents page | Active | Active | COMPLETE |
| OU scope | Dedicated Cloud Sync OU | Correct OU selected | Correct OU selected | COMPLETE |
| New user creation | `cloudsync.test01` | Enabled in scoped OU | Enabled in scoped OU | COMPLETE |
| User provisioning | AD → Microsoft Entra | User appears in Entra | User synchronized successfully | COMPLETE |
| Attribute synchronization | `Department` | `Hybrid Identity Lab` in Entra | Value synchronized | COMPLETE |
| Password Hash Sync | On-prem password change | New password authenticates to Entra | Authentication successful | COMPLETE |
| Security group sync | `GG-CloudSync-Test` | Group appears in Entra | Group synchronized | COMPLETE |
| Group membership sync | `cloudsync.test01` membership | Member appears in Entra group | Membership synchronized | COMPLETE |
| Source anchor correlation | AD `objectGUID` → Base64 | Matches Entra immutable ID | Exact match confirmed | COMPLETE |
| Provisioning logs | User provisioning event | Successful processing | Success | COMPLETE |
| Group provisioning logs | Group provisioning event | Successful processing | Success | COMPLETE |
| Provisioning failures | Final failure review | No current failures | No results | COMPLETE |
| Agent outbound connectivity | Microsoft bootstrap endpoint TCP 443 | Connection succeeds | `TcpTestSucceeded = True` | COMPLETE |

## Lifecycle Validation Result

The controlled identity lifecycle test is COMPLETE.

The broader portfolio project remains IN PROGRESS until final portfolio presentation material and evidence files are organized and committed.
