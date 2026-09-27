# Validation

## Final validation matrix

| Capability | Real / Simulated | Configured | Validated | Evidence | Status |
|---|---|---:|---:|---|---|
| Intune Apple enrollment administration | Real | Yes | Yes | Apple enrollment baseline | COMPLETE |
| APNs certificate creation | Real | Yes | Yes | Apple Push Certificates Portal confirmation | COMPLETE |
| APNs upload to Intune | Real | Yes | Yes | Intune upload confirmation | COMPLETE |
| ABM organization | Simulated | No | No | Architecture/runbook only | SIMULATED / DOCUMENTED |
| Enrollment Program Token | Simulated | No | Workflow only | Token creation page reviewed | SIMULATED / DOCUMENTED |
| ADE device synchronization | Simulated | No | No | Runbook only | SIMULATED / DOCUMENTED |
| ADE profile | Simulated | No | No | Runbook only | SIMULATED / DOCUMENTED |
| macOS compliance policy | Real | Yes | Policy object yes | Review + policy monitor | COMPLETE |
| Compliance on enrolled Mac | Simulated | No | No | No enrolled Mac | NOT VALIDATED |
| FileVault policy | Real | Yes | Policy object yes | Settings + policy list | COMPLETE |
| FileVault encryption on Mac | Simulated | No | No | No enrolled Mac | NOT VALIDATED |
| Recovery-key escrow | Simulated | Policy intent only | No | No enrolled Mac | NOT VALIDATED |
| Platform SSO capability | Real | No policy retained | Yes | Settings Catalog capability | VALIDATED |
| Platform SSO endpoint registration | Simulated | No | No | No enrolled Mac | SIMULATED / DOCUMENTED |
| Enterprise Wi-Fi capability | Real | No policy retained | Yes | Enterprise profile settings | VALIDATED |
| EAP-TLS availability | Real | No policy retained | Yes | EAP dropdown | VALIDATED |
| SCEP profile capability | Real | No policy retained | Yes | SCEP configuration surface | VALIDATED |
| Certificate issuance | Simulated | No | No | No enterprise PKI/SCEP path | SIMULATED / DOCUMENTED |
| macOS app deployment capability | Real | No app retained | Yes | App type selector | VALIDATED |
| App install on Mac | Simulated | No | No | No enrolled Mac | NOT VALIDATED |
| macOS enrollment restrictions | Real | Existing default | Yes | Restriction properties | VALIDATED |
| macOS device inventory | Real | N/A | Yes | 0-device inventory page | VALIDATED |
| Bulk device actions | Real capability | N/A | Yes | Action list | VALIDATED |
| Retire / wipe execution | Simulated | No | No | No enrolled Mac | SIMULATED / DOCUMENTED |
| Device reassignment | Simulated | No | No | Lifecycle runbook | SIMULATED / DOCUMENTED |

## Evidence interpretation

A screenshot proving that an Intune configuration surface exists is classified as **capability validation**, not endpoint implementation.

A policy object created in Intune is classified as **REAL CONFIGURATION**.

A result that requires an enrolled Mac is not marked validated unless an actual device reports the state.

## Evidence index

See [evidence/README.md](evidence/README.md) and the live [evidence gallery](evidence/).
