# Linux01 SSSD Remediation

## Summary

- Target: Linux01
- Date: June 26, 2026
- Domain: ad.jeremyfontenot.online
- Classification: SSSD responder activation conflict
- Result: Remediated and validated

## Initial Condition

- sssd-nss.socket, sssd-pam.socket, and sssd-pac.socket were enabled and failed.
- /etc/sssd/sssd.conf used direct responder activation with services = nss, pam.
- config_file_version = 2 was rejected by SSSD 2.12 configuration validation.
- Initial diagnostic: artifacts/target-local-collection/Linux01/linux01-sssd-diagnostic-20260626-094322.json
- Initial SHA-256: 3CAD0FB73202D777D41DEE40D6F4D19D4019B9AD30552B37970B55A5CA5AB3BB

## Backup

- Backup: /root/sssd.conf.pre-remediation-20260626-095429.bak
- Original and backup SHA-256: 23ace1beca5ff6f7d58200efe054ea8e5a938e02f37fce25b1ca1b5d2f05bd14

## Remediation

1. Removed the rejected config_file_version directive.
2. Confirmed sssctl config-check completed with zero issues.
3. Disabled the NSS, PAM, and PAC SSSD socket units.
4. Restarted sssd.service.
5. Cleared the historical failed-unit state.

## Validation

- sssd.service is enabled, active, and running.
- No failed systemd units remain.
- All three responder sockets report disabled.
- AD identity lookup succeeded.
- A new AD-authenticated SSH session succeeded.
- Post-remediation diagnostic: artifacts/target-local-collection/Linux01/linux01-sssd-diagnostic-20260626-110159.json
- Post-remediation SHA-256: FD55604BFB94487B86FBF631703FA995B9726471689385CCB2D277492AA7CBEE

## Final Status

Linux01 is operating normally using direct SSSD responder activation.
