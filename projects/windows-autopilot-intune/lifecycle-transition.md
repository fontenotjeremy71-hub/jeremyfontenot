# Post-Project Device Lifecycle Transition

**Date:** 2026-09-26  
**Endpoint:** `LT-JF01`  
**Scope:** Post-project lifecycle; not part of the original Autopilot success criteria.

## Purpose

The physical Lenovo endpoint used for the completed Windows Autopilot and Intune pilot was later repurposed for the on-premises Active Directory lab. The historical Autopilot evidence remains valid for the completed pilot phase; this document records the endpoint's later management-state transition.

## Transition

1. Preserved the completed Autopilot/Intune evidence before repurposing the device.
2. Removed the endpoint from the Autopilot/Entra pilot state.
3. Retained a local safety administrator during the transition.
4. Renamed the endpoint to `LT-JF01`.
5. Joined `ad.jeremyfontenot.online`.
6. Validated interactive domain authentication and the workstation trust relationship.
7. Rebuilt the remote-access OpenVPN path after troubleshooting a transport issue, then revalidated domain services over VPN.

## Final AD DS validation

- Secure channel: healthy.
- Domain controller discovery: `DC01.ad.jeremyfontenot.online` / `10.10.20.10`.
- Domain time source: DC01.
- Group Policy: computer policy applied successfully from DC01.
- Applied computer GPOs: Default Domain Policy, Windows Firewall baseline, RDP Restrictions baseline, PowerShell Logging baseline, and Windows Update baseline.
- VPN path: SMB TCP 445 and RPC TCP 135 validated.
- Remote administration: session enumeration and administrative RDP to DC01 validated.

## Evidence boundary

This later AD DS state must not be presented as simultaneous with the Autopilot pilot state. During Autopilot validation, the endpoint was Microsoft Entra joined and Intune managed. After that project was completed, it was intentionally repurposed as an on-premises AD DS member workstation.

See [evidence/07-post-autopilot-lifecycle-validation.txt](evidence/07-post-autopilot-lifecycle-validation.txt) for the sanitized validation summary.
