# Troubleshooting

## Autopilot profile propagation
Profile assignment did not appear immediately. A service sync and propagation wait were used before the device reported `Assigned`.

## ESP assignment display
An ESP assignment temporarily appeared stale/soft-deleted even though the target group existed. Refreshing the portal restored the correct Active state without rebuilding the group.

## Branding asset limits
The original background exceeded Microsoft Entra upload limits. It was recompressed while retaining the required dimensions.

## Safe backup before reset
Because the Autopilot target was also the administrative laptop, destructive reset was delayed until a dedicated SMB backup target and independent OpenVPN recovery path were validated.

## Standard user and elevation
The Autopilot profile intentionally created a standard user. BitLocker management commands failed from the standard session. Assigning a separate Entra account to Device Administrators provided the supported administrative path. A filtered `runas` token still showed the Administrators SID as deny-only; a true UAC elevation produced an enabled Administrators token.

## Initial compliance failure
The first compliance report showed BitLocker and Secure Boot as not compliant. Local BitLocker validation showed the OS volume was already fully encrypted. `Confirm-SecureBootUEFI` returned `False`, identifying the real firmware gap. Secure Boot was enabled in UEFI, then an Intune sync was performed. Final compliance changed to `Compliant`.

## Management boundary
After Autopilot, the endpoint is Microsoft Entra joined and Intune-managed rather than AD DS domain joined. Intune/MDM is the authoritative management path for this project endpoint.
