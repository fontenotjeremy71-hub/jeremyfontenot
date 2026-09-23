# Portfolio Summary

## Windows Autopilot & Intune MDM Provisioning

Implemented and validated an end-to-end Windows Autopilot deployment using Microsoft Intune and Microsoft Entra ID.

The project uses dedicated pilot user/device groups, user-driven Microsoft Entra join, automatic Intune MDM enrollment, custom Entra branding, Enrollment Status Page controls, required Microsoft 365 Apps deployment, Windows compliance, and a Settings Catalog security baseline.

A registered physical Lenovo endpoint was safely backed up, reset to OOBE, and provisioned through the live Autopilot workflow. Post-enrollment validation confirmed Entra join, Intune management, Microsoft 365 Apps, BitLocker, Defender, Windows Firewall, VBS, Secure Boot, and final Intune compliance.

A real compliance issue was identified and remediated: Secure Boot was disabled in firmware. After enabling Secure Boot and synchronizing the endpoint, Intune reported the device compliant.

The Autopilot user remains a standard user. Administrative elevation is provided separately through the Microsoft Entra Device Administrators role.

**Status: COMPLETE**
