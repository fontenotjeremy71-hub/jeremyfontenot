# Architecture

## Objective

Deploy modern Windows LAPS in a controlled Active Directory test scope using Group Policy, encrypted password storage, and delegated least-privilege access.

## Logical path

`Administrative laptop -> DC01 -> LAPS-Test OU -> WS01 -> LocalAdmin`

The administrative laptop is not domain joined, so domain-integrated administration was performed through DC01 by PowerShell remoting and RDP.

## AD and endpoint design

- Domain: `ad.jeremyfontenot.online`
- Domain controller / Schema Master: `DC01`
- Domain functional level: Windows Server 2016
- Endpoint: `WS01`
- Endpoint OS: Windows 10 Pro build 19045
- OU: `OU=LAPS-Test,OU=Workstations,OU=JFAD,DC=ad,DC=jeremyfontenot,DC=online`

## LAPS schema

The schema was first queried for `msLAPS-*` attributes. None were present. `Update-LapsADSchema` was then run with temporary Schema Admin membership, after which the membership was removed.

Validated attributes:

- `msLAPS-Password`
- `msLAPS-PasswordExpirationTime`
- `msLAPS-EncryptedPassword`
- `msLAPS-EncryptedPasswordHistory`
- `msLAPS-EncryptedDSRMPassword`
- `msLAPS-EncryptedDSRMPasswordHistory`

## Group Policy

GPO: `GPO - Workstations - Windows LAPS`

Settings:

- Backup directory: Active Directory
- Managed account: `LocalAdmin`
- Password age: 30 days
- Password length: 14
- Complexity: uppercase + lowercase + numbers + special characters
- Password expiration protection: enabled
- Password encryption: enabled
- Authorized decryptor: `JFAD\GG-LAPS-Password-Readers`

## Delegation

`Set-LapsADComputerSelfPermission` grants managed computers permission to update their own LAPS attributes. `Set-LapsADReadPasswordPermission` delegates password-read rights to `JFAD\GG-LAPS-Password-Readers`.

The final test reader account `laps.reader01` belongs only to `Domain Users` and `GG-LAPS-Password-Readers`, demonstrating delegated access independent of Domain Admin privileges.
