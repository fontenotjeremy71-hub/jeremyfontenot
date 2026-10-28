# Linux01 SSSD Remediation Validation

## Claim supported

Direct Linux01 remediation evidence supports a narrow Linux01-only SSSD responder/socket conflict remediation and post-remediation validation.

## Directly observed values

- Initial condition: SSSD NSS, PAM, and PAC sockets were enabled and failed.
- Initial condition: SSSD was configured for direct responder activation through `services = nss, pam`.
- Initial condition: `config_file_version = 2` was rejected by SSSD 2.12 config validation.
- Remediation action: removed only the rejected `config_file_version = 2` directive.
- Remediation action: disabled conflicting NSS, PAM, and PAC sockets.
- Remediation action: restarted sssd.service.
- Remediation action: cleared failed-unit state.
- Post-remediation service state: sssd.service enabled and active/running.
- Post-remediation failed-unit state: zero failed units.
- SSSD configuration validation: passed.
- AD identity lookup: passed.
- New AD-authenticated SSH session: passed.
- Initial diagnostic SHA-256: 3CAD0FB73202D777D41DEE40D6F4D19D4019B9AD30552B37970B55A5CA5AB3BB.
- Original/backup configuration SHA-256: 23ACE1BECA5FF6F7D58200EFE054EA8E5A938E02F37FCE25B1CA1B5D2F05BD14.
- Post-remediation diagnostic SHA-256: FD55604BFB94487B86FBF631703FA995B9726471689385CCB2D277492AA7CBEE.

## Source command or source object

Linux01 SSSD remediation evidence record.

## Source repository

fontenotjeremy71-hub/jeremy-homelab-ops

## Source commit

fb6c286873285778d88d6d5cfde0b9bd00b96f36

## Source path

`evidence/linux01-sssd-remediation-20260626-110159.md`

## Source file SHA-256

`evidence/linux01-sssd-remediation-20260626-110159.md`: 04773570FBE305353F5EB370B8F9629AC335E35A7BEF7151A2CBB98D7371CC49

## Public artifact SHA-256

Recorded in `evidence-library/integrity/evidence-hashes.json` for this artifact path. The self-hash is recorded outside this file so the digest does not invalidate itself.

## Sanitization performed

Removed diagnostic artifact paths, backup filesystem path, account context, raw command history, and implementation details not needed to support the remediation claim. Retained hashes because they are part of the validation evidence.

## Limitations

- Personal nonproduction home lab only.
- Captured-state evidence only.
- Linux01 only.
- This does not claim that all Linux domain-authentication paths were tested.
- This does not prove production readiness, employer-system administration, or recurring assurance.

## Validation date

2026-06-30

## Classification

Validated
