# Lessons Learned

1. Pilot-scoped groups reduce blast radius and simplify troubleshooting.
2. Assigned or Active is not proof of endpoint enforcement; validate the resulting device state.
3. End-to-end validation matters more than portal configuration screenshots.
4. Backup and recovery readiness are part of change management for destructive enrollment testing.
5. Keep normal users standard and provide a separate administrative elevation path.
6. `runas` is not the same as UAC elevation; validate the actual token.
7. Troubleshoot compliance from both endpoint evidence and the Intune management plane.
8. Firmware settings such as Secure Boot can determine cloud compliance.
9. Endpoint-side PowerShell plus Intune portal status provides stronger evidence than either source alone.
10. Never publish recovery codes, private keys, VPN profiles, browser password exports, or BitLocker recovery values.
