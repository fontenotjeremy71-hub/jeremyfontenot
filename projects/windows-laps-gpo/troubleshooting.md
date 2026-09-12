# Troubleshooting

## RDP client hang

TCP 3389 to DC01 was reachable, but the local Remote Desktop Connection client hung or closed. Windows Error Reporting showed `mstsc.exe` `AppHangB1` / Application Hang Event ID 1002.

Resolution:

```text
mstsc /public /admin /v:dc01.ad.jeremyfontenot.online
```

The administrative RDP session then opened successfully.

## RSOP / WMI RPC failure

The Group Policy Results wizard initially failed to query WS01. A direct WMI test returned `0x800706BA - The RPC server is unavailable`.

Inspection showed all `Windows Management Instrumentation (WMI)` firewall rules were disabled and originated from the local `PersistentStore`.

The Domain-profile WMI rules were enabled in `PersistentStore`. A subsequent `Get-WmiObject Win32_OperatingSystem -ComputerName WS01` succeeded and the GUI Group Policy Results report generated correctly.

## Disabled built-in Administrator

LAPS Event ID 10067 reported that the built-in `Administrator` account was disabled. WS01 already had an enabled custom `LocalAdmin` account in the local Administrators group.

The LAPS GPO was updated to manage `LocalAdmin`. Event IDs 10021 and 10020 then confirmed the intended account and successful password update.

## Reader account could not WinRM to DC01

`laps.reader01` intentionally lacked administrative/WinRM rights on DC01. Rather than granting unnecessary remote-administration permission, `Get-LapsADPassword -Credential` and `-DecryptionCredential` were used inside the existing administrative remoting session to validate the delegated reader credentials.
