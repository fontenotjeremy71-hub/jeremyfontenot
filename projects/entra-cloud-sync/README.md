# Microsoft Entra Hybrid Identity & Cloud Sync

## Project Status
IN PROGRESS

## Overview

This project demonstrates a validated hybrid identity implementation using Microsoft Entra Cloud Sync to synchronize selected Active Directory users and groups from an on-premises Windows Server environment to Microsoft Entra ID.

The project focuses on controlled identity lifecycle validation, source-of-authority verification, Password Hash Synchronization, security-group synchronization, provisioning-log analysis, and troubleshooting without rebuilding the existing working Cloud Sync deployment.

## Environment

### On-Premises

- Active Directory domain: `ad.jeremyfontenot.online`
- NetBIOS domain: `JFAD`
- Domain Controller: `DC01`
- DC01 IP: `10.10.20.10`
- Operating System: Windows Server 2022
- Domain functional level: Windows Server 2016

### Cloud Sync

- Cloud Sync server: `SYNC01`
- SYNC01 IP: `10.10.20.105`
- Operating System: Windows Server 2022
- Synchronization technology: Microsoft Entra Cloud Sync
- Password Hash Synchronization: Enabled

### Microsoft Entra

- Verified domain: `jeremyfontenot.online`
- Synchronization direction: Active Directory → Microsoft Entra ID

## Cloud Sync Scope

Synchronization is intentionally limited to:

`OU=Cloud Sync,OU=JFAD,DC=ad,DC=jeremyfontenot,DC=online`

This provides a controlled boundary for hybrid identity testing without synchronizing unrelated Active Directory objects.

## Validated Capabilities

The project successfully validated:

- Cloud Sync provisioning-agent health
- Dedicated OU scoping
- New user provisioning from Active Directory to Microsoft Entra ID
- On-premises attribute synchronization
- Password Hash Synchronization
- Cloud authentication after an on-premises password change
- Security-group synchronization
- Group-membership synchronization
- Provisioning logs
- Source-anchor correlation
- Source-of-authority behavior
- Provisioning-failure review
- Cloud Sync troubleshooting

## Controlled Lifecycle Test

The primary test identity was:

`cloudsync.test01@jeremyfontenot.online`

The lifecycle test validated:

1. Creation in on-premises Active Directory
2. Placement in the dedicated Cloud Sync OU
3. Provisioning to Microsoft Entra ID
4. Synchronization of the `Department` attribute
5. Password change on-premises
6. Successful Microsoft Entra authentication with the updated password
7. Membership in `GG-CloudSync-Test`
8. Security-group and membership synchronization
9. Provisioning-log confirmation
10. Source-anchor and immutable-ID correlation

## Source of Authority

For the synchronized objects tested in this project, on-premises Active Directory remained the authoritative identity source.

The identity relationship was validated by correlating:

- Active Directory `objectGUID`
- Cloud Sync `SourceAnchor`
- Microsoft Entra on-premises immutable ID
- Provisioning-log source and target identifiers

## Synchronization Timing

Observed Cloud Sync intervals:

- Users and Groups provisioning: 20 minutes
- Password Hash Synchronization: 5 minutes

These separate intervals were accounted for during validation and troubleshooting.

## Troubleshooting Highlights

During validation, the Cloud Sync agent reported a permissions-related metrics error involving access to the registry key `Global`.

The provisioning agent gMSA was added to the local `Performance Log Users` group on `SYNC01`.

After the agent service restarted:

- the registry-access error did not recur
- the metrics agent initialized successfully
- Cloud Sync remained active
- user synchronization succeeded
- group synchronization succeeded
- Password Hash Synchronization succeeded

The existing Cloud Sync installation was preserved.

## Project Documentation

- [Architecture](architecture.md)
- [Implementation](implementation.md)
- [Validation](validation.md)
- [Troubleshooting](troubleshooting.md)
- [Lessons Learned](lessons-learned.md)

## Security and Evidence Handling

Portfolio evidence is sanitized.

The project does not publish:

- passwords
- authentication tokens
- session cookies
- private keys
- VPN credentials
- other authentication secrets

## Technologies Demonstrated

- Windows Server 2022
- Active Directory Domain Services
- Microsoft Entra ID
- Microsoft Entra Cloud Sync
- Password Hash Synchronization
- Group Managed Service Accounts
- PowerShell
- PowerShell Remoting
- Microsoft Entra provisioning logs
- Hybrid identity troubleshooting

## Validation Script

A reusable PowerShell validation script is included at:

`scripts/Test-CloudSyncADState.ps1`

The script validates the current on-premises source state for:

- `cloudsync.test01`
- `GG-CloudSync-Test`
- Direct group membership
- Objects located in the dedicated Cloud Sync OU

The script is designed to be executed against a domain controller with the Active Directory PowerShell module available.

Example execution from the administrative workstation:

```powershell
Invoke-Command -Session $dc -FilePath ".\scripts\Test-CloudSyncADState.ps1"
```

The script provides repeatable evidence of the Active Directory state without modifying directory objects.


## Interview Explanation

I built and validated a hybrid identity lab using Microsoft Entra Cloud Sync between an on-premises Active Directory environment and Microsoft Entra ID.

The environment uses Windows Server 2022 with a dedicated Cloud Sync server and a scoped synchronization OU. I preserved the existing working Cloud Sync deployment rather than rebuilding it.

For the validation, I created a controlled Active Directory user and confirmed that it provisioned to Microsoft Entra. I then changed a supported on-premises attribute, verified the cloud update, changed the user password on-premises, and validated Password Hash Synchronization by successfully authenticating to Microsoft Entra with the new password.

I also created a security group, synchronized the group and its membership, reviewed provisioning logs, and correlated the Active Directory objectGUID with the Cloud Sync source anchor and the Microsoft Entra immutable ID.

During troubleshooting, I identified a permissions issue affecting Cloud Sync metrics, corrected the gMSA permissions on SYNC01, and validated that the agent remained healthy. I also documented the difference between the 20-minute Users and Groups provisioning interval and the 5-minute Password Hash Sync interval so that normal propagation delay is not mistaken for a failure.

The project demonstrates hybrid identity administration, Active Directory, Microsoft Entra ID, Cloud Sync, Password Hash Synchronization, group synchronization, PowerShell remoting, provisioning-log analysis, and evidence-based troubleshooting.

## Resume Bullet

- Built and validated a Microsoft Entra hybrid identity lab using Windows Server 2022 Active Directory and Microsoft Entra Cloud Sync, including scoped user and security-group synchronization, Password Hash Synchronization, attribute lifecycle testing, source-anchor correlation, provisioning-log analysis, gMSA troubleshooting, and PowerShell-based remote administration.

## LinkedIn Project Description

Built and validated a Microsoft Entra hybrid identity lab integrating Windows Server 2022 Active Directory with Microsoft Entra ID through Microsoft Entra Cloud Sync.

The project included controlled user provisioning, attribute synchronization, Password Hash Synchronization, security-group and group-membership synchronization, source-anchor correlation, provisioning-log analysis, and PowerShell-based remote administration.

I also troubleshot Cloud Sync agent permissions using event logs, validated the provisioning agent gMSA configuration, and confirmed the difference between the 20-minute Users and Groups provisioning cycle and the separate 5-minute Password Hash Sync cycle.

Technologies used: Windows Server 2022, Active Directory Domain Services, Microsoft Entra ID, Microsoft Entra Cloud Sync, Password Hash Synchronization, gMSA, PowerShell, PowerShell Remoting, and Entra provisioning logs.
