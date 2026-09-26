# Validation

## Final validation matrix

| Component | Evidence | Status |
|---|---|---|
| Autopilot profile | Registered device received assigned profile | COMPLETE |
| Branded OOBE | Custom lab sign-in displayed | COMPLETE |
| Microsoft Entra join | `AzureAdJoined : YES`, `DomainJoined : NO` | COMPLETE |
| Device authentication | `DeviceAuthStatus : SUCCESS`, TPM protected | COMPLETE |
| SSO | `AzureAdPrt : YES` | COMPLETE |
| Intune MDM enrollment | EnterpriseMgmt scheduled tasks present | COMPLETE |
| Device naming | Autopilot naming template applied | COMPLETE |
| ESP | Device preparation/setup/account setup completed | COMPLETE |
| Microsoft 365 Apps | `O365ProPlusRetail`, x64 | COMPLETE |
| BitLocker | Fully encrypted, 100%, Protection On | COMPLETE |
| Defender | Antivirus, antispyware, real-time, behavior, IOAV enabled | COMPLETE |
| Windows Firewall | Domain, Private, Public enabled | COMPLETE |
| VBS | `VirtualizationBasedSecurityStatus : 2` | COMPLETE |
| Secure Boot | `Confirm-SecureBootUEFI` returned `True` after remediation | COMPLETE |
| Compliance | Intune device state `Compliant` | COMPLETE |
| Settings Catalog | 2 succeeded; 0 error/conflict/not-applicable/in-progress | COMPLETE |
| Standard-user posture | Pilot user non-admin; separate elevation path validated | COMPLETE |

## Sanitized command highlights

### Entra join and SSO
```text
AzureAdJoined : YES
EnterpriseJoined : NO
DomainJoined : NO
DeviceAuthStatus : SUCCESS
TpmProtected : YES
AzureAdPrt : YES
```

### Microsoft 365 Apps
```text
ProductReleaseIds : O365ProPlusRetail
Platform          : x64
```

### BitLocker
```text
Conversion Status    : Fully Encrypted
Percentage Encrypted : 100.0%
Encryption Method    : XTS-AES 128
Protection Status    : Protection On
Key Protectors       : Numerical Password, TPM
```

### Defender
```text
AntivirusEnabled          : True
AntispywareEnabled        : True
RealTimeProtectionEnabled : True
BehaviorMonitorEnabled    : True
IoavProtectionEnabled     : True
```

### Firewall
```text
Domain  True
Private True
Public  True
```

### VBS
```text
VirtualizationBasedSecurityStatus : 2
```

### Secure Boot
```text
Confirm-SecureBootUEFI
True
```

No recovery keys, passwords, tokens, device IDs, certificate thumbprints, or hardware serial numbers are included.
