# Monitoring and Logging

## Centralized Linux Logging

I use Linux01 as the rsyslog receiver for selected pfSense events. I configure the receiver to listen on TCP and UDP port 514 at `10.10.30.20`.

I forward selected pfSense system, firewall, authentication, VPN, and gateway events to Linux01. I use rsyslog configuration files to define remote collection and pfSense alert handling.

| Configuration | Purpose |
|---|---|
| `/etc/rsyslog.d/10-remote-collector.conf` | I configure remote syslog collection and destination templates |
| `/etc/rsyslog.d/05-pfsense-alerts.conf` | I configure handling for pfSense alert messages |
| `/etc/logrotate.d/rsyslog` | I configure weekly rotation, four retained rotations, and compression |

I organize received messages under `/var/log/remote/` using the sender IP and a separate pfSense alert log.

## Service and Listener Administration

I inspect the rsyslog service, TCP and UDP listeners, configuration files, destination paths, and log rotation settings when administering the logging receiver. I use Linux01 target-local inventory to review the receiver configuration and service state.

## Azure Arc Monitoring Indicators

I use Azure Arc and the connected SQL Server resource to review agent connectivity, extension provisioning, Data Processing Service status, and metrics-upload indicators. I use these service indicators as part of my hybrid-management administration.

## Evidence

- [Linux01 logging configuration and receiver inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/source-summaries/centralized-logging-expansion.md)
- [Linux01 system, network, and domain inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-system-network-domain-validation.md)
- [Azure Arc public validation](../../../evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/evidence/azure-arc-validation-public.txt)
- [Azure Arc evidence manifest](../../../evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/evidence-manifest.json)
