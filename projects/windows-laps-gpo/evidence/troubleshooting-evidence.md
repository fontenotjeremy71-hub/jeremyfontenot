# Troubleshooting Evidence

## RDP

- TCP 3389 to DC01: reachable
- Local client failure: `mstsc.exe` AppHangB1 / Event ID 1002
- Working launch: `mstsc /public /admin /v:dc01.ad.jeremyfontenot.online`

## WMI / RSOP

Initial WMI result:

```text
The RPC server is unavailable. (Exception from HRESULT: 0x800706BA)
```

WMI firewall rule source:

```text
PolicyStoreSourceType : Local
PolicyStoreSource     : PersistentStore
Enabled               : False
Profile               : Domain
```

After enabling the Domain-profile PersistentStore WMI rules:

```text
CSName  : WS01
Caption : Microsoft Windows 10 Pro
Version : 10.0.19045
```

The Group Policy Results wizard then completed successfully.
