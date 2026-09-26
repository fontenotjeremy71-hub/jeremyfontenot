# Windows Autopilot & Intune MDM Provisioning

**Status:** COMPLETE  
**Completion date:** 2026-09-22

## Project objective

Build and validate a portfolio-quality Windows Autopilot and Microsoft Intune pilot demonstrating device registration, user-driven Microsoft Entra join, automatic Intune enrollment, branded OOBE, Enrollment Status Page controls, required Microsoft 365 Apps deployment, compliance evaluation, BitLocker, Microsoft Defender, Windows Firewall, Virtualization Based Security, Secure Boot, and post-enrollment management.

## Environment

- Microsoft Entra verified domain: `jeremyfontenot.online`
- On-premises AD DS domain: `ad.jeremyfontenot.online`
- Autopilot mode: user-driven
- Join type: Microsoft Entra joined
- Pilot user group: `SG-Intune-Autopilot-Pilot-Users`
- Pilot device group: `SG-Intune-Autopilot-Pilot-Devices`
- Autopilot deployment profile: `AP UserDriven EntraJoin Pilot`
- Enrollment Status Page: `ESP Autopilot Pilot`
- Required application: `M365 Apps Autopilot Pilot`
- Compliance policy: `Compliance Windows Autopilot Pilot`
- Security configuration: `Config Windows Autopilot Security Pilot`

## End-to-end result

A registered physical Lenovo endpoint was safely backed up, reset to Windows OOBE, and successfully completed the live Windows Autopilot deployment flow.

Validated outcomes include branded OOBE, Microsoft Entra join, Intune MDM enrollment, Enrollment Status Page completion, required Microsoft 365 Apps deployment, BitLocker, Defender, Windows Firewall, VBS, Secure Boot remediation, final Intune compliance, Settings Catalog success, and a separate administrative elevation path while the Autopilot user remained standard.

## Security and evidence handling

Public evidence excludes passwords, recovery keys, MFA codes, private SSH keys, OpenVPN credentials, 1Password recovery material, browser password exports, and other secrets. Unique hardware and directory identifiers are redacted from public screenshots and command output.

## Post-project device lifecycle

After the Autopilot/Intune validation was completed, the same physical endpoint was intentionally removed from the Autopilot/Entra-managed pilot and repurposed as `LT-JF01`, a member workstation in the on-premises `ad.jeremyfontenot.online` lab domain. This later transition does not change the completed Autopilot results above; it demonstrates controlled device lifecycle management and recovery to a known-good AD DS state.

See [lifecycle-transition.md](lifecycle-transition.md) for the post-project transition and [evidence/README.md](evidence/README.md) for the evidence index.
