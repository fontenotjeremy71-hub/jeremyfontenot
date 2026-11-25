# Monitoring and Logging

## Monitoring State

I treat monitoring as an evidence-limited operational discipline. The repository validates some service and listener state but does not prove a complete alerting platform or round-the-clock monitoring program.

## Linux rsyslog

Authenticated Linux01 evidence supports:

- rsyslog active
- TCP port 514 listening on 10.10.30.20
- UDP port 514 listening on 10.10.30.20
- Remote collector configuration
- pfSense alert configuration
- Weekly rsyslog log rotation
- Four retained rotations and compression

The repository documents forwarding of selected pfSense system, firewall, authentication, VPN, and gateway events to Linux01. It does not prove that every sender successfully delivers every event.

## Connectivity Checks

A client-path TCP check to Linux01 port 514 timed out. I retain that as a reachability observation and do not convert it into an rsyslog failure.

## Azure Monitoring Indicators

Azure Arc evidence supports:

- DPS status OK
- Metrics upload status OK
- Agent connectivity
- SQL extension telemetry

This evidence does not establish a complete Azure Monitor or alerting implementation.

## Planned Expansion

My change plan identifies Windows Event Forwarding and Proxmox syslog forwarding as future work requiring approval. It also identifies source restrictions, destination configuration, retention, test events, and rollback. No such expansion is presented here as implemented.

## Operational Boundaries

I do not claim:

- High-availability monitoring
- 24-hour alert coverage
- Guaranteed log delivery
- SIEM operation
- SOC monitoring
- Compliance logging
- Complete event retention

## Evidence

- [Centralized logging plan](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/source-summaries/centralized-logging-expansion.md)
- [Linux01 validation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-system-network-domain-validation.md)
- [Azure Arc public evidence](../../../evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/evidence/azure-arc-validation-public.txt)
