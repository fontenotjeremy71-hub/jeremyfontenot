# Architecture

## Project Status
COMPLETE

## Hybrid Identity Architecture

This project uses Microsoft Entra Cloud Sync to synchronize selected identities from on-premises Active Directory to Microsoft Entra ID.

## Core Components

### On-Premises Active Directory

- Domain: `ad.jeremyfontenot.online`
- NetBIOS: `JFAD`
- Domain Controller: `DC01`
- IP address: `10.10.20.10`
- Operating System: Windows Server 2022
- Domain functional level: Windows Server 2016

Directory services provided by DC01 include:

- Active Directory Domain Services
- DNS
- DHCP
- Kerberos
- Global Catalog
- Active Directory Web Services

### Cloud Sync Server

- Server: `SYNC01`
- IP address: `10.10.20.105`
- Operating System: Windows Server 2022
- Role: Microsoft Entra Cloud Sync provisioning agent host

The Cloud Sync agent runs under an existing group Managed Service Account.

### Microsoft Entra ID

- Verified domain: `jeremyfontenot.online`
- Synchronization direction: Active Directory to Microsoft Entra ID
- Synchronization technology: Microsoft Entra Cloud Sync
- Password Hash Synchronization: Enabled

## Synchronization Scope

Cloud Sync is intentionally limited to:

`OU=Cloud Sync,OU=JFAD,DC=ad,DC=jeremyfontenot,DC=online`

This dedicated OU provides a controlled boundary for synchronized users and groups without broadly synchronizing unrelated Active Directory objects.

## Identity Flow

The validated identity path is:

`DC01 Active Directory`
→ `Dedicated Cloud Sync OU`
→ `SYNC01 Microsoft Entra Cloud Sync Agent`
→ `Microsoft Entra ID`

Password changes follow a separate Password Hash Synchronization process through the same Cloud Sync deployment.

## Validated Object Types

The project validated synchronization of:

- User objects
- User attributes
- Security groups
- Group membership
- Password hashes

## Source of Authority

For the identities tested in this project, on-premises Active Directory is the authoritative source.

Microsoft Entra receives synchronized identity data through Cloud Sync.

The identity relationship was validated through:

- Active Directory `objectGUID`
- Cloud Sync `SourceAnchor`
- Microsoft Entra on-premises immutable ID
- Provisioning-log source and target identifiers

## Synchronization Timing

Observed configuration intervals:

- Users and Groups provisioning: 20 minutes
- Password Hash Synchronization: 5 minutes

These are separate processing cycles and should be considered during troubleshooting.

## Administrative Access Model

The administrative laptop is not domain joined.

Administration is therefore performed primarily through:

- PowerShell Remoting to `DC01`
- PowerShell Remoting to `SYNC01`
- Microsoft Entra admin center

This avoids relying on laptop Kerberos or domain-integrated RSAT functionality.

## Design Principle

The architecture preserves the existing working Cloud Sync deployment.

No additional synchronization engine was introduced, and Microsoft Entra Connect Sync was not installed simply to obtain manual delta-sync capability.

## Cloud Sync vs. Microsoft Entra Connect Sync

This lab uses Microsoft Entra Cloud Sync rather than Microsoft Entra Connect Sync.

### Microsoft Entra Cloud Sync

Cloud Sync uses a lightweight provisioning agent installed on `SYNC01`.

In this lab it provides:

- Active Directory to Microsoft Entra ID user synchronization
- Security-group synchronization
- Group-membership synchronization
- Password Hash Synchronization
- OU-based scoping
- Cloud-managed provisioning configuration
- Provisioning-log visibility in Microsoft Entra

The observed Users and Groups provisioning interval is 20 minutes.

### Microsoft Entra Connect Sync

Microsoft Entra Connect Sync uses the traditional synchronization engine installed on a Windows Server.

A key operational difference relevant to this lab is that Connect Sync supports administrator-triggered synchronization cycles, such as a delta synchronization, whereas the Cloud Sync Users and Groups provisioning job operates on its service-managed schedule.

Connect Sync was not installed in this project because the existing Cloud Sync deployment was already functioning and introducing another synchronization engine was unnecessary for the project objectives.

### Design Decision

Cloud Sync was retained because it already met the requirements of this controlled hybrid identity implementation.

The architecture therefore remained:

`Active Directory`
→ `Microsoft Entra Cloud Sync`
→ `Microsoft Entra ID`

rather than adding Microsoft Entra Connect Sync solely to obtain manually triggered synchronization cycles.

This preserves the existing working infrastructure and avoids overlapping synchronization engines for the same test objects.
