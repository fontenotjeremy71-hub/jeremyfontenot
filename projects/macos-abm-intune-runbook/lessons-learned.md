# Lessons Learned

## 1. Apple management has two control planes

Intune can expose Apple enrollment, configuration, compliance, application, and lifecycle administration even when Apple Business Manager is not available. ABM is a separate Apple control plane for organization ownership, device assignment, and ADE.

Treating these as one system would overstate what was actually implemented.

## 2. APNs is foundational and operationally sensitive

The Apple MDM Push certificate is not a one-time setup artifact. It is an annual operational dependency. The same Apple account must remain available for renewal, and the existing certificate relationship should be renewed rather than casually replaced.

## 3. Policy creation is not endpoint validation

Creating a macOS compliance policy or FileVault profile in Intune proves administrative configuration capability. It does not prove that a Mac received, enforced, or reported the setting.

This project intentionally keeps those claims separate.

## 4. Portfolio accuracy is stronger than fabricated completeness

ABM, ADE, Platform SSO registration, EAP-TLS authentication, FileVault escrow, and lifecycle execution are valuable concepts, but inventing screenshots or pretending a managed Mac exists would weaken the portfolio.

A clearly bounded simulation demonstrates sound administration judgment.

## 5. Current Intune design should avoid deprecated templates

The deprecated macOS Endpoint Protection template was visible, but FileVault was configured through the current Settings Catalog instead.

## 6. Enterprise Wi-Fi is a dependency chain

A Wi-Fi profile alone is not enterprise authentication. EAP-TLS depends on:

- trusted root certificate;
- device/user certificate issuance;
- certificate identity/EKU design;
- RADIUS trust;
- network policy;
- managed endpoint delivery.

Documenting that dependency chain is more meaningful than creating a fake SSID.

## 7. Lifecycle administration requires ownership context

Retire, wipe, delete, restart, rename, and sync are exposed in Intune, but the correct action depends on ownership, incident type, reassignment plan, and data-retention requirements.

## 8. Evidence should prove exactly what the caption claims

The evidence gallery pairs each screenshot with a narrow claim. A capability screenshot proves capability. A policy review proves settings. A policy-monitor screenshot proves the policy exists. None are used to imply an enrolled Mac where none exists.
