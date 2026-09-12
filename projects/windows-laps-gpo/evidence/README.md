# Sanitized Evidence Index

This folder contains portfolio-safe evidence reconstructed from the validated command output captured during the lab. Managed passwords and authentication secrets are intentionally excluded.

## Core evidence

- [Validated results](validated-results.md)
- [Troubleshooting evidence](troubleshooting-evidence.md)

## Security handling

Never publish:

- Windows LAPS managed passwords
- domain passwords
- recovery secrets
- private keys
- tokens
- VPN credentials

The repository intentionally records only non-secret metadata such as account name, timestamps, encryption source, decryption status, authorized decryptor, event IDs, and GPO configuration.
