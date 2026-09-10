# Implementation

## Project Status
COMPLETE

## Existing Hybrid Identity Architecture

This project uses an existing Microsoft Entra Cloud Sync deployment. The synchronization infrastructure was already operational before this validation project and was not rebuilt.

### On-Premises Active Directory

- Domain: `ad.jeremyfontenot.online`
- NetBIOS domain: `JFAD`
- Domain Controller: `DC01`
- Domain Controller IP: `10.10.20.10`
- Operating System: Windows Server 2022
- Domain functional level: Windows Server 2016

DC01 provides:

- Active Directory Domain Services
- DNS
- DHCP
- Kerberos
- Global Catalog
- Active Directory Web Services

### Microsoft Entra

- Verified domain: `jeremyfontenot.online`
- Synchronization technology: Microsoft Entra Cloud Sync
- Cloud Sync server: `SYNC01`
- SYNC01 IP: `10.10.20.105`
- Operating System: Windows Server 2022

## Cloud Sync Scope

Synchronization is intentionally limited to the dedicated organizational unit:

`OU=Cloud Sync,OU=JFAD,DC=ad,DC=jeremyfontenot,DC=online`

The scope was validated in the Microsoft Entra admin center before performing the controlled identity lifecycle test.

## Controlled Test User

A dedicated test identity was created in the Cloud Sync OU:

- Display name: `Cloud Sync Test 01`
- SAM account name: `cloudsync.test01`
- UPN: `cloudsync.test01@jeremyfontenot.online`
- Enabled: Yes
- Password expiration: Disabled for the controlled lab account

The account was created on-premises and allowed to synchronize through the existing Cloud Sync configuration.

## Attribute Synchronization Test

The on-premises `Department` attribute was changed to:

`Hybrid Identity Lab`

The value was first validated in Active Directory and subsequently verified in Microsoft Entra.

## Password Hash Synchronization Test

The controlled user's password was changed on-premises.

The change was validated by:

1. Confirming a new `PasswordLastSet` timestamp in Active Directory.
2. Authenticating successfully to Microsoft Entra using the updated password.

No password value was recorded in project evidence.

## Security Group Synchronization Test

A controlled Active Directory security group was created:

- Group: `GG-CloudSync-Test`
- Category: Security
- Scope: Global
- Location: Dedicated Cloud Sync OU

`cloudsync.test01` was added as a direct member.

After the normal Cloud Sync provisioning cycle, Microsoft Entra showed:

- Source: Windows Server AD
- Type: Security
- One synchronized direct user member

## Synchronization Intervals Observed

The Cloud Sync configuration reports:

- Users and Groups provisioning interval: 20 minutes
- Password Hash Sync interval: 5 minutes

These separate synchronization schedules were accounted for during validation to distinguish expected propagation delay from actual synchronization failures.

## Provisioning Agent

The existing agent on `SYNC01` was retained.

Agent validation confirmed:

- Service: `AADConnectProvisioningAgent`
- Service state: Running
- Startup mode: Automatic
- Microsoft Entra agent status: Active

The agent runs under its existing group Managed Service Account and was not reinstalled or replaced.

## Implementation Principle

All lifecycle changes originated in on-premises Active Directory. Microsoft Entra was treated as the synchronized target for the tested identities and attributes.

Existing Cloud Sync infrastructure was preserved throughout the project.
