# Troubleshooting

## Method

I document troubleshooting by preserving observed symptoms, diagnostic commands or records, established causes, corrective actions, verification, and unresolved boundaries.

## Linux01 SSSD

### Technical Context

Linux01 uses SSSD for identity integration with `ad.jeremyfontenot.online`.

### Observed Problem

SSSD NSS, PAM, and PAC sockets were enabled and failed. SSSD 2.12 rejected `config_file_version = 2` in the existing configuration.

### Investigation

I reviewed service state, socket state, and SSSD configuration validation. The evidence record identified the conflicting direct responder activation and rejected directive.

### Corrective Action

I removed only the rejected directive and disabled the conflicting NSS, PAM, and PAC sockets. I restarted sssd.service and cleared failed-unit state.

### Verification

Post-remediation evidence showed SSSD enabled and active, zero failed units, successful SSSD configuration validation, successful AD identity lookup, and a new AD-authenticated SSH session.

### Technical Outcome

Linux01's SSSD and AD-authenticated SSH path were remediated and validated for the specific host and captured state.

## WS01 Remote Desktop

### Technical Context

WS01 is a domain-joined Windows 10 client.

### Observed Problem

Repository screenshots document initial RDP and NLA troubleshooting, including DNS/DHCP and RDP/firewall/network validation.

### Investigation

I reviewed client identity and network state and tested DC01-to-WS01 RDP connectivity.

### Verification

Evidence includes DC01-to-WS01 RDP/DNS validation and WS01 RDP/firewall/network configuration. I do not claim that every RDP or NLA condition was permanently resolved outside the recorded test context.

## Reachability Checks

Read-only inventory work produced TCP timeout observations for pfSense HTTPS, DC01 Kerberos, LDAP, SMB, WinRM, and Linux01 rsyslog in different contexts. I retain these as inconclusive reachability observations and distinguish module absence from network failure.

## Domain and Secure-Channel Checks

One management workstation run produced `nltest` domain-discovery and secure-channel inconclusive results. DC01 and WS01 direct inventories still support their respective domain states. I do not interpret the management-workstation context as domain-wide failure.

## Evidence

- [Linux01 SSSD remediation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-sssd-remediation-validation.md)
- [WS01 evidence manifest](../../../evidence-library/projects/on-prem-home-lab/screenshots/screenshots-manifest.json)
- [Inventory and validation summary](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/source-summaries/home-lab-inventory-validation.md)
