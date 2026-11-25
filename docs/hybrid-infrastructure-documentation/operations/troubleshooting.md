# Troubleshooting

## Troubleshooting Method

I troubleshoot infrastructure by reproducing the behavior, checking the relevant service and network dependencies, reviewing configuration and logs, isolating the cause, applying a focused correction, and retesting the affected workflow.

## Linux01 SSSD and Active Directory Authentication

### Problem

I encountered failed SSSD NSS, PAM, and PAC sockets on Linux01. SSSD 2.12 also rejected the `config_file_version = 2` directive during configuration validation.

### Investigation

I reviewed the SSSD service and socket state and checked the configuration with SSSD's validation tooling. I identified a conflict between direct responder activation in the SSSD configuration and the separately enabled responder sockets.

### Correction

I removed the rejected `config_file_version = 2` directive, disabled the conflicting NSS, PAM, and PAC sockets, restarted `sssd.service`, and cleared the failed-unit state.

### Result

I verified that SSSD was enabled and active, the configuration passed validation, AD identity lookup succeeded, and a new SSH session authenticated through Active Directory.

## WS01 Remote Desktop and DNS

### Problem

I investigated Remote Desktop connection and Network Level Authentication behavior on WS01.

### Investigation and Correction

I checked WS01 network configuration, DNS and DHCP settings, Remote Desktop configuration, and Windows firewall rules. I used DC01 to resolve the WS01 hostname and test TCP port 3389.

### Result

I confirmed that DC01 resolved `ws01.ad.jeremyfontenot.online` to `10.10.20.100` and that the TCP 3389 connectivity test succeeded. I also retained screenshots of the workstation Remote Desktop and firewall configuration.

## Evidence

- [Linux01 SSSD remediation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-sssd-remediation-validation.md)
- [WS01 system and domain inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/ws01-system-and-domain-validation.md)
- [WS01 Remote Desktop and DNS test](../../../evidence-library/projects/on-prem-home-lab/screenshots/figure-07-dc01-to-ws01-rdp-dns-validation.png)
- [WS01 DNS and DHCP configuration](../../../evidence-library/projects/on-prem-home-lab/screenshots/figure-04-ws01-dns-dhcp-validation.png)
