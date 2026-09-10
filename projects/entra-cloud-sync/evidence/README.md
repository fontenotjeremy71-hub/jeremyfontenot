# Evidence Manifest

## Project Status
IN PROGRESS

This folder contains sanitized evidence and supporting visuals for the Microsoft Entra Hybrid Identity & Cloud Sync project.

## Captured Evidence

1. `02-cloudsync-test01-initial-provisioning.png`
   - Initial synchronized user in Microsoft Entra

2. `03-cloudsync-test01-attribute-sync.png`
   - Department attribute synchronized to `Hybrid Identity Lab`

3. `04-cloudsync-test01-password-hash-sync.png`
   - Successful Microsoft Entra authentication after on-premises password change

4. `05-cloudsync-group-membership.png`
   - `Cloud Sync Test 01` synchronized as a member of `GG-CloudSync-Test`

5. `06-cloudsync-user-provisioning-log.png`
   - Successful user import, scope evaluation, and provisioning

6. `07-cloudsync-user-modified-properties.png`
   - User attribute and source-anchor processing

7. `08-cloudsync-source-authority.png`
   - On-premises synchronization and immutable-ID evidence

8. `09-cloudsync-overview-health.png`
   - Healthy Cloud Sync configuration and synchronization counts

9. `10-cloudsync-no-failures.png`
   - Final provisioning-log failure review with no results

10. `11-cloudsync-group-provisioning-log.png`
    - Successful group provisioning event

11. `12-cloudsync-group-modified-properties.png`
    - Group membership/source-anchor processing

12. `13-cloudsync-group-summary.png`
    - AD-to-Entra group provisioning summary

13. `14-cloudsync-agent-status.png`
    - SYNC01 Cloud Sync agent shown as Active

14. `15-cloudsync-ou-scope.png`
    - Dedicated Cloud Sync OU scope

15. `16-cloudsync-group-attribute-mapping.png`
    - Group attribute mappings

## Supporting Visuals

- `01-cloudsync-architecture.png`
- `02-identity-lifecycle.png`
- `03-source-anchor-correlation.png`
- `04-sync-timing.png`
- `05-troubleshooting-flow.png`
- `06-validation-summary.png`
- `07-cloudsync-vs-connect-sync.png`

These visuals summarize only validated Project 2 lab architecture, workflow, timing, troubleshooting, and validation results.

## Evidence Note

The original pre-test OU baseline was captured as PowerShell output rather than as a screenshot. No screenshot was fabricated for that step.

## Sanitization Requirements

Before publishing evidence, verify screenshots do not expose:

- passwords
- authentication tokens
- session cookies
- bearer tokens
- private keys
- VPN credentials
- recovery secrets
- other authentication secrets

Directory object GUIDs, source anchors, lab UPNs, server names, and lab IP addresses may remain where intentionally used as technical evidence.
