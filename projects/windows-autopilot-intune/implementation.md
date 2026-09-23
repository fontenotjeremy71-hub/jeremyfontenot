# Implementation

## 1. Pilot-scoped automatic MDM enrollment
Automatic Intune enrollment was scoped to `SG-Intune-Autopilot-Pilot-Users`.

## 2. Autopilot registration and targeting
A physical Lenovo endpoint was registered with Windows Autopilot and added to `SG-Intune-Autopilot-Pilot-Devices`. The device later reported the deployment profile as assigned.

## 3. User-driven Microsoft Entra join
`AP UserDriven EntraJoin Pilot` was configured for user-driven Microsoft Entra join, standard-user provisioning, and the device naming template `AP-%SERIAL%`.

## 4. Microsoft Entra branding
Custom background, banner, square logo, sign-in hint, and lab-specific sign-in text were configured and observed during live OOBE.

## 5. Enrollment Status Page
`ESP Autopilot Pilot` displayed provisioning progress and blocked completion while the required application and device configuration were processed.

## 6. Microsoft 365 Apps
`M365 Apps Autopilot Pilot` was required for the pilot device group. Post-enrollment validation confirmed `O365ProPlusRetail` on x64 Click-to-Run.

## 7. Compliance and remediation
`Compliance Windows Autopilot Pilot` initially reported BitLocker and Secure Boot as noncompliant. Local validation showed BitLocker was already fully encrypted while Secure Boot was disabled. Secure Boot was enabled in firmware and Intune was synchronized; the device then reported compliant.

## 8. Security configuration
`Config Windows Autopilot Security Pilot` applied BitLocker, Defender, firewall, PUA, and VBS controls. Final Intune check-in status showed 2 succeeded, 0 errors, 0 conflicts, 0 not applicable, and 0 in progress.

## 9. Administrative access
The Autopilot user remained a standard user. A separate tenant administrator was assigned the Microsoft Entra Device Administrators role. UAC elevation was validated before running administrative endpoint checks.

## 10. Safe reset preparation
Before destructive reset, selected lab/business data and recovery-critical configuration were backed up to an SMB share. Secret-bearing recovery files are intentionally excluded from this public repository.
