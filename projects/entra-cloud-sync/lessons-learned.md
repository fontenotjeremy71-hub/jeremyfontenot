# Lessons Learned

## Project Status
COMPLETE

## Preserve Working Infrastructure

The existing Microsoft Entra Cloud Sync deployment was already functioning and did not need to be rebuilt.

A key operational lesson from this project was to validate the current state before making changes. The working agent, OU scope, Password Hash Synchronization, and existing synchronized users provided a known-good baseline.

## Understand Cloud Sync Timing

Microsoft Entra Cloud Sync uses separate synchronization intervals for different functions.

Observed in this lab:

- Users and Groups provisioning: 20 minutes
- Password Hash Synchronization: 5 minutes

A newly created or modified directory object should not be treated as failed until the expected provisioning interval has been considered.

This distinction prevents unnecessary troubleshooting, restarts, or configuration changes.

## Source of Authority Matters

For synchronized identities, on-premises Active Directory remained the authoritative source for the tested attributes.

Changes were made in Active Directory first and then validated in Microsoft Entra.

The source relationship was verified using:

- Active Directory `objectGUID`
- Base64 source-anchor conversion
- Microsoft Entra on-premises immutable ID
- Provisioning log source and target identifiers

## Source Anchors Provide Strong Identity Correlation

The controlled user's Active Directory `objectGUID` was converted to its Base64 source-anchor representation.

That value matched the Microsoft Entra on-premises immutable ID and the provisioning-log source anchor.

This provided direct evidence that the cloud identity was linked to the intended on-premises AD object.

## Password Hash Synchronization Is Independent of User Provisioning Timing

Password Hash Synchronization completed on a shorter cycle than Users and Groups provisioning.

Successful Microsoft Entra authentication after an on-premises password change provided practical proof that Password Hash Synchronization was functioning.

## Group Synchronization Includes Membership Relationships

Creating a synchronized group is only part of group lifecycle validation.

This project also confirmed that:

- The security group synchronized to Microsoft Entra
- The user membership synchronized
- Provisioning logs processed the membership relationship
- The group `Member` property referenced the synchronized user's source anchor

## Provisioning Logs Are Essential Troubleshooting Evidence

Provisioning logs provided visibility into:

- Import from Active Directory
- Scope evaluation
- Provisioning into Microsoft Entra ID
- Modified properties
- Source IDs
- Target IDs
- Success or failure status

They were more useful for determining actual synchronization behavior than relying only on portal object visibility.

## Service Running Does Not Mean Every Component Is Healthy

The provisioning agent service was Running while the event log still contained performance-counter errors.

Reviewing the agent event log identified a permissions issue affecting the metrics collector.

Adding the provisioning gMSA to the local `Performance Log Users` group resolved the registry-access error without reinstalling Cloud Sync.

## Validate Commands in Their Correct Context

`Test-ADServiceAccount` returned `False` when executed on DC01 because the Cloud Sync gMSA was assigned for use by SYNC01.

The result demonstrated the importance of understanding what a validation command actually tests before interpreting its output as a failure.

## Do Not Troubleshoot Normal Delay as an Outage

The group initially appeared missing from Microsoft Entra because a Users and Groups provisioning cycle had not yet completed.

The object eventually synchronized successfully after the expected Cloud Sync interval.

The main operational lesson is:

> Confirm the synchronization schedule before escalating normal propagation delay into troubleshooting.

## Portfolio Evidence Should Be Sanitized

Useful evidence includes:

- AD object properties
- OU scope
- provisioning status
- group membership
- provisioning logs
- source-anchor correlation
- synchronization timestamps
- agent health

Passwords, tokens, authentication secrets, private keys, and other credentials should never be included in portfolio evidence.
