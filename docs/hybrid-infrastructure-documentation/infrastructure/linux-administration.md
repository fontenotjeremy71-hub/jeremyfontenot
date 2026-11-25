# Linux Administration

## Linux01 Platform

I run Linux01 as VM 400 on Proxmox VE. I use Ubuntu 26.04 LTS on the system and connect its virtual network interface to VLAN 30.

| Setting | Linux01 configuration |
|---|---|
| Hostname | Linux01 |
| Operating system | Ubuntu 26.04 LTS |
| Interface | ens18 |
| IPv4 address | 10.10.30.20/24 |
| Default gateway | 10.10.30.1 |
| DNS server | 10.10.20.10 |
| Active Directory domain | ad.jeremyfontenot.online |

## Active Directory Integration

I integrate Linux01 with `ad.jeremyfontenot.online` through realmd, SSSD, and Kerberos. I use SSSD for identity lookups and domain-backed authentication, and I use SSH for remote Linux administration.

## SSSD Configuration and Troubleshooting

I diagnosed an SSSD configuration conflict involving direct responder activation and the NSS, PAM, and PAC sockets. SSSD 2.12 rejected the `config_file_version = 2` directive during configuration validation.

I removed the rejected directive, disabled the conflicting NSS, PAM, and PAC sockets, restarted `sssd.service`, and cleared the failed-unit state. I then checked the SSSD configuration, service state, AD identity lookup, and a new AD-authenticated SSH session.

## Centralized Logging

I configured Linux01 as the rsyslog receiver for selected pfSense events. I configured the receiver to listen on TCP and UDP port 514 at `10.10.30.20` and used the following configuration files:

| Configuration file | Purpose |
|---|---|
| `/etc/rsyslog.d/10-remote-collector.conf` | Remote syslog receiver and destination configuration |
| `/etc/rsyslog.d/05-pfsense-alerts.conf` | pfSense alert-message handling |
| `/etc/logrotate.d/rsyslog` | Weekly rotation, four retained rotations, and compression |

I configured the remote log destination templates `/var/log/remote/%FROMHOST-IP%/messages.log` and `/var/log/remote/pfsense-alerts.log` to organize messages by sender and log type.

## Administrative Work

I administer Linux network settings, SSH access, packages and services, domain identity integration, SSSD configuration, rsyslog listeners, log rotation, and system inventory. I use service state, socket listeners, configuration validation, identity lookup, and log review to troubleshoot Linux services.

## Evidence

- [Linux01 system, network, and domain inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-system-network-domain-validation.md)
- [Linux01 SSSD remediation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-sssd-remediation-validation.md)
- [Linux01 target-local inventory validation](https://github.com/fontenotjeremy71-hub/jeremy-homelab-ops/blob/main/evidence/linux01-local-inventory-validation-20260626-035220.md)
