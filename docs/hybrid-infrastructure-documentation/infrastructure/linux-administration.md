# Linux Administration

## Linux01

Linux01 is VM 400. Direct evidence supports Ubuntu 26.04 LTS, Linux kernel 7.0.0-22-generic, x86_64 architecture, and VLAN 30 placement.

The current interface has:

- Interface: ens18 UP
- IPv4: 10.10.30.20/24
- Gateway: 10.10.30.1
- DNS: 10.10.20.10
- Domain: ad.jeremyfontenot.online

The evidence identifies the older 10.10.20.x address as an earlier addressing context, not the current Linux01 address.

## Directory Integration

I documented realmd/SSSD/Kerberos integration with the Active Directory domain. realmd reports active-directory server software and SSSD client software, and domain identity resolution was observed as resolved.

## SSSD Remediation

For Linux01, I identified a resolver/socket conflict:

- NSS, PAM, and PAC sockets were enabled and failed.
- The SSSD configuration used direct responder activation.
- SSSD 2.12 rejected `config_file_version = 2`.

I removed only the rejected directive and disabled the conflicting NSS, PAM, and PAC sockets. I then restarted SSSD and cleared failed-unit state.

Post-remediation evidence supports:

- sssd.service enabled and active/running
- Zero failed units
- SSSD configuration validation passed
- AD identity lookup passed
- A new AD-authenticated SSH session passed

This result is limited to Linux01.

## Logging

Target-local inventory validates rsyslog state, TCP and UDP listeners on 10.10.30.20:514, remote collector configuration, pfSense alert configuration, and log rotation.

Centralized logging expansion for Windows and Proxmox remains a change plan rather than a completed implementation.

## Administrative Responsibilities

My Linux work includes network configuration, SSH administration, package and service validation, system-state inventory, AD identity integration, SSSD troubleshooting, rsyslog configuration review, log rotation, and file integrity capture.

## Evidence

- [Linux01 system, network, and domain validation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-system-network-domain-validation.md)
- [Linux01 SSSD remediation validation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-sssd-remediation-validation.md)
- [Centralized logging plan](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/source-summaries/centralized-logging-expansion.md)
