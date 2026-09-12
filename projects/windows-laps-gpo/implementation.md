# Implementation

1. Validated the modern `LAPS` PowerShell module on DC01 and WS01.
2. Queried the AD schema for `msLAPS-*` attributes before making changes.
3. Temporarily added `jeremy.fontenot` to `Schema Admins`, refreshed the logon token, and ran `Update-LapsADSchema -Verbose`.
4. Verified all six modern Windows LAPS schema attributes and removed the temporary Schema Admin membership.
5. Created `OU=LAPS-Test` under `OU=Workstations` with accidental-deletion protection.
6. Moved WS01 from the existing Windows 10 OU into `LAPS-Test`.
7. Delegated computer self-permission with `Set-LapsADComputerSelfPermission`.
8. Created `GG-LAPS-Password-Readers` and delegated read permission with `Set-LapsADReadPasswordPermission`.
9. Created and linked `GPO - Workstations - Windows LAPS` to the LAPS-Test OU.
10. Configured AD backup, 30-day age, 14-character complex passwords, encryption, and `GG-LAPS-Password-Readers` as the authorized decryptor.
11. Initially allowed LAPS to target the built-in Administrator account. Event ID 10067 showed that the account was disabled.
12. Reviewed WS01 local Administrators and found the existing enabled `LocalAdmin` account.
13. Updated the GPO to manage `LocalAdmin` rather than enabling the built-in Administrator account.
14. Forced Group Policy processing and validated the effective policy through Event ID 10021.
15. Created non-admin reader account `laps.reader01`, added it to the reader group, and validated encrypted retrieval.
16. Created a temporary unauthorized standard user and confirmed it could not retrieve the LAPS record; the account was then deleted.
17. Forced a final `Reset-LapsPassword` and validated the new timestamps and Event IDs 10014, 10020, 10018, and 10004.
