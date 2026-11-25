# Remote Access

## Remote Administration

I use remote administration across Windows and Linux systems. Evidence supports RDP and WinRM-related troubleshooting and administration, while also recording access boundaries.

## VPN Route

The retained route evidence includes a route for `10.10.20.0/24` through `10.10.40.1` from `10.10.40.2`. This demonstrates a captured VPN route on the management workstation, not a complete validation of pfSense VPN configuration or tunnel health.

## Windows Remote Administration

WS01 evidence includes RDP enablement, firewall/network configuration, DNS validation, and a DC01-to-WS01 RDP test. The lab evidence distinguishes successful remote access work from a separate NLA-related troubleshooting case.

HVHOST01 direct evidence supports a successful WinRM validation and Azure Arc agent validation. VMM01 direct WinRM connection was available, but the current credential was rejected for remote PowerShell; I retain that as an access limitation.

## Linux Remote Administration

Linux01 evidence supports SSH identity integration. The SSSD remediation case records a successful AD-authenticated SSH session after remediation.

## Security Boundary

I do not publish VPN credentials, private keys, certificates, tokens, recovery codes, tenant values, account names, or raw authentication logs. Public network addresses are limited to the network ranges already included in the reviewed evidence.

## Validation State

The public evidence includes successful route, RDP, WinRM, or SSH observations only where directly supported. Timeouts and credential rejection remain limitations rather than proof of a service outage or firewall failure.

## Evidence

- [WS01 evidence manifest](../../../evidence-library/projects/on-prem-home-lab/screenshots/screenshots-manifest.json)
- [Linux01 SSSD remediation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-sssd-remediation-validation.md)
- [Azure Arc public evidence](../../../evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/evidence/azure-arc-validation-public.txt)
