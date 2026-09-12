# Windows LAPS Validated Results

## Schema extension

Post-extension query returned all required modern attributes:

```text
msLAPS-EncryptedDSRMPassword
msLAPS-EncryptedDSRMPasswordHistory
msLAPS-EncryptedPassword
msLAPS-EncryptedPasswordHistory
msLAPS-Password
msLAPS-PasswordExpirationTime
```

## OU and delegation

WS01 final OU:

```text
OU=LAPS-Test,OU=Workstations,OU=JFAD,DC=ad,DC=jeremyfontenot,DC=online
```

Extended-right holders:

```text
NT AUTHORITY\SYSTEM
JFAD\Domain Admins
JFAD\GG-LAPS-Password-Readers
```

Final reader group membership:

```text
Name           : LAPS Reader Test
SamAccountName : laps.reader01
ObjectClass    : user
```

`laps.reader01` group memberships:

```text
Domain Users
GG-LAPS-Password-Readers
```

## GPO application

`gpresult /r /scope computer` included:

```text
GPO - Workstations - Windows LAPS
```

## Effective policy - Event 10021

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

## Final encrypted retrieval

```text
ComputerName        : WS01
Account             : LocalAdmin
PasswordUpdateTime  : 9/11/2026 7:06:17 PM
ExpirationTimestamp : 10/11/2026 7:06:17 PM
Source              : EncryptedPassword
DecryptionStatus    : Success
AuthorizedDecryptor : JFAD\GG-LAPS-Password-Readers
```

## AD attribute presence

```text
Name                          : WS01
msLAPS-PasswordExpirationTime : 134362343115244738
EncryptedPasswordPresent      : True
```

## Final rotation events

```text
10014 - Administrator-initiated password update
10020 - LocalAdmin password successfully updated
10018 - Active Directory successfully updated
10004 - LAPS policy processing succeeded
```

## Negative access test

```text
ACCESS TEST RESULT: No LAPS record returned for unauthorized user.
```

No managed password value is present in this evidence.
