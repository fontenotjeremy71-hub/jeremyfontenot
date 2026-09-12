# Windows LAPS & Advanced Group Policy

## Status

**COMPLETE**

This project demonstrates a validated deployment of modern Windows LAPS in the `ad.jeremyfontenot.online` Active Directory lab using a dedicated test OU, Group Policy, encrypted password storage, least-privilege delegation, event-log validation, and forced password rotation.

## Environment

| Component | Configuration |
|---|---|
| AD domain | `ad.jeremyfontenot.online` |
| NetBIOS | `JFAD` |
| Domain controller | `DC01` - Windows Server 2022 |
| Test endpoint | `WS01` - Windows 10 Pro 10.0.19045 |
| Test OU | `OU=LAPS-Test,OU=Workstations,OU=JFAD,DC=ad,DC=jeremyfontenot,DC=online` |
| LAPS GPO | `GPO - Workstations - Windows LAPS` |
| Managed account | `LocalAdmin` |
| Reader group | `JFAD\GG-LAPS-Password-Readers` |

## Validated controls

- Modern Windows LAPS module present on DC01 and WS01
- AD schema inspected before modification
- `Update-LapsADSchema` completed and six `msLAPS-*` attributes validated
- Dedicated `LAPS-Test` OU created and WS01 moved into scope
- Computer self-permission delegated with `Set-LapsADComputerSelfPermission`
- Dedicated password-reader group created and delegated with `Set-LapsADReadPasswordPermission`
- GPO configured for AD backup, 30-day age, 14-character complex passwords, encrypted storage, and an authorized decryptor group
- `gpupdate`, `gpresult`, and GUI Group Policy Results/RSOP validated
- Windows LAPS Event IDs 10021, 10020, 10018, 10014, and 10004 validated
- Delegated non-admin retrieval succeeded
- Unauthorized standard-user retrieval returned no LAPS record
- Forced password rotation changed the password update and expiration timestamps

## Security design

The built-in RID-500 `Administrator` account remains disabled. Windows LAPS manages the existing enabled `WS01\LocalAdmin` account instead. Passwords are stored using encrypted Windows LAPS attributes in Active Directory. The actual password is intentionally excluded from all portfolio evidence.

## Documentation

- [Architecture](architecture.md)
- [Implementation](implementation.md)
- [Validation](validation.md)
- [Troubleshooting](troubleshooting.md)
- [Lessons learned](lessons-learned.md)
- [Sanitized evidence](evidence/README.md)
- [Validation script](scripts/Validate-WindowsLAPS.ps1)
