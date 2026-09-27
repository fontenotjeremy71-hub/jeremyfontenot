# Simulated Enterprise Deployment Scenario

## Scenario

A company purchases a batch of corporate Macs from an Apple-authorized reseller. The devices are automatically assigned to the organization's Apple Business Manager tenant and then to Microsoft Intune.

This scenario is **SIMULATED / DOCUMENTED**. It is used to demonstrate the intended operational sequence without claiming that an ABM tenant or physical managed Mac exists in this lab.

## Workflow

1. **Procurement**
   - Reseller associates devices with the ABM organization.

2. **Apple Business Manager**
   - Devices appear in ABM.
   - Administrator assigns them to the Microsoft Intune MDM server.

3. **Enrollment Program Token**
   - Intune synchronizes assigned devices from ABM.

4. **ADE profile**
   - Corporate enrollment profile is assigned.
   - Required Setup Assistant panes are shown or skipped according to policy.

5. **Setup Assistant**
   - Device connects to the network.
   - Apple activation identifies the device as organization-managed.
   - Remote management begins.

6. **Microsoft Entra authentication**
   - User authenticates with organizational identity.

7. **Intune enrollment**
   - Device becomes managed and appears in inventory.

8. **Security baseline**
   - Compliance evaluates System Integrity Protection, password state, encryption, firewall, Stealth Mode, and Gatekeeper.
   - FileVault policy enables encryption and recovery-key escrow.

9. **Identity**
   - Platform SSO registration links the local macOS sign-in experience with Microsoft Entra according to the chosen authentication method.

10. **Enterprise Wi-Fi**
    - Trusted root certificate and client certificate are delivered.
    - WPA2-Enterprise / EAP-TLS profile connects the device to corporate wireless.

11. **Applications**
    - Required productivity/security applications install from Intune.

12. **Operations**
    - Help desk/admin teams use inventory, sync, restart, rename, retire, wipe, and reassignment workflows according to policy.

## Validation checkpoints

A real deployment would not be marked complete until the following were observed on an enrolled Mac:

- ADE profile applied during Setup Assistant;
- Entra authentication succeeds;
- device appears in Intune;
- configuration profiles report success;
- FileVault is enabled;
- recovery key is escrowed;
- compliance reports compliant;
- required apps install;
- Platform SSO registration succeeds;
- enterprise Wi-Fi authenticates;
- lifecycle actions behave as expected.
