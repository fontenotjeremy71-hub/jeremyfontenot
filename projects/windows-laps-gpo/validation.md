# Validation

## Group Policy

`gpupdate /force` completed successfully on WS01. `gpresult /r /scope computer` listed `GPO - Workstations - Windows LAPS` under Applied Group Policy Objects. The Group Policy Results wizard was also generated after WMI/RPC remediation.

## Effective policy

Event ID 10021 reported:

```text
Policy source: GPO
Backup directory: Active Directory
Local administrator account name: LocalAdmin
Password age in days: 30
Password complexity: 4
Password length: 14
Password expiration protection enabled: 1
Password encryption enabled: 1
Password encryption target principal: JFAD\GG-LAPS-Password-Readers
```

## AD backup and retrieval

Sanitized final retrieval:

```text
ComputerName        : WS01
Account             : LocalAdmin
PasswordUpdateTime  : 9/11/2026 7:06:17 PM
ExpirationTimestamp : 10/11/2026 7:06:17 PM
Source              : EncryptedPassword
DecryptionStatus    : Success
AuthorizedDecryptor : JFAD\GG-LAPS-Password-Readers
```

The `Password` property was deliberately excluded.

## Forced rotation

Event sequence:

- 10014 - administrator-initiated password update
- 10020 - `LocalAdmin` password updated
- 10018 - Active Directory updated with the new password
- 10004 - LAPS policy processing succeeded

## Least privilege

`laps.reader01` was validated with only `Domain Users` and `GG-LAPS-Password-Readers` memberships and successfully decrypted the encrypted LAPS record.

A standard user outside the reader group produced:

```text
ACCESS TEST RESULT: No LAPS record returned for unauthorized user.
```

## AD attribute presence

```text
Name                          : WS01
msLAPS-PasswordExpirationTime : 134362343115244738
EncryptedPasswordPresent      : True
```
