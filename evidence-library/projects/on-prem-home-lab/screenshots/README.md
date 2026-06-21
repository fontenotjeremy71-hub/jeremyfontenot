# On-Prem Home Lab Screenshots for Repository

This package contains the screenshot evidence used in the APA home lab proof documentation. Files are named with clean figure numbers and proof-focused headings so they can be added directly to the repository.

Recommended repo folder:

```text
evidence-library/projects/on-prem-home-lab/screenshots
```

## Screenshot Index

### Figure 1: Initial RDP Connection Failure

- File: `screenshots/figure-01-initial-rdp-connection-failure.png`
- Section: `ws01-troubleshooting`
- Proof: Initial RDP connection failure observed during client access troubleshooting.
- SHA256: `65D5ED79F841CB51F044F1A05185C05AC1271842B0676BC1900B125E84E309DD`

### Figure 2: NLA Failure During Windows 11 Client Troubleshooting

- File: `screenshots/figure-02-nla-failure-windows11-client-troubleshooting.png`
- Section: `ws01-troubleshooting`
- Proof: NLA failure observed during Windows 11 client troubleshooting.
- SHA256: `94F27327B1BF2E0C30EDA831B38B7F49160939403D02BA6E2DEB2E23A5DCF3D4`

### Figure 3: WS01 System Identity and Hardware State

- File: `screenshots/figure-03-ws01-system-about-identity-hardware.png`
- Section: `ws01-baseline`
- Proof: Cropped WS01 System > About proof showing workstation identity and hardware state after installation.
- SHA256: `26A4A69E33CCA925EEC46064307A14D5C02D1A2CB3E9508705242806F049E63E`

### Figure 4: WS01 DNS and DHCP Validation

- File: `screenshots/figure-04-ws01-dns-dhcp-validation.png`
- Section: `ws01-baseline`
- Proof: Cropped DNS and DHCP validation output from WS01 after domain join and DNS registration.
- SHA256: `080AAAB4B0A905A92C651911571655E86D2224344BF069AAB5D9FC0476629F1C`

### Figure 5: Active Directory WS01 OU Placement

- File: `screenshots/figure-05-active-directory-ws01-ou-placement.png`
- Section: `active-directory`
- Proof: Active Directory validation showing WS01 location after OU movement.
- SHA256: `390E466B485DE1BF4CA85F8214F7111FE9D41FECD206CCAC33555333FF45679C`

### Figure 6: WS01 RDP Enablement and Firewall Rules

- File: `screenshots/figure-06-ws01-rdp-enable-firewall-network.png`
- Section: `rdp-validation`
- Proof: Cropped WS01 output showing local RDP enablement, Remote Desktop firewall rules, and network state.
- SHA256: `C8846CCC29D972D61D92D4C55E5F664D1E3CA3A0E9A489D4CE66B2327CF4AD04`

### Figure 7: DC01 to WS01 RDP and DNS Validation

- File: `screenshots/figure-07-dc01-to-ws01-rdp-dns-validation.png`
- Section: `rdp-validation`
- Proof: Cropped final RDP validation from DC01 showing TCP 3389 succeeds and DNS resolves WS01.
- SHA256: `52EDDD8DFD47C594E444A1DD2875BD40947747128D5093862B93E13972015DF8`

### Figure 8: WS01 Proxmox Boot Cleanup

- File: `screenshots/figure-08-ws01-proxmox-boot-cleanup.png`
- Section: `proxmox`
- Proof: Cropped Proxmox output showing WS01 boot cleanup and running status.
- SHA256: `FF85B2D61E149607EA8B4EFF5AB842EA6EF2459985472F418C291219FDE46A7C`

### Figure 9: WS01 Baseline Snapshot Validation

- File: `screenshots/figure-09-ws01-baseline-snapshot-validation.png`
- Section: `backup-snapshot`
- Proof: Cropped Proxmox output showing WS01 baseline snapshot creation and validation.
- SHA256: `8C3C8CD225B3133FF92B3DD9C607BCD55F189B6DA8834BBC719A2FACD7DB840D`

### Figure 10: WS01 Backup Archive Evidence

- File: `screenshots/figure-10-ws01-backup-archive-evidence.png`
- Section: `backup-snapshot`
- Proof: Cropped evidence note excerpt showing the WS01 backup file and 8.9 GB archive.
- SHA256: `43A66DC24E7E1682B07508ADBC6C274C9867AE9C7975DAE139A8AD1DB4137A50`

### Figure 11: Scheduled Backup Job Includes WS01

- File: `screenshots/figure-11-scheduled-backup-job-includes-ws01.png`
- Section: `backup-snapshot`
- Proof: Cropped Proxmox output showing scheduled backup job updated to include VM 300.
- SHA256: `3889A475A9A1E26380B97BD87A52A0AF76B17DE4ECEC57BCF6954E4A9882D810`

### Figure 12: WS01 Snapshot and Backup Evidence Note

- File: `screenshots/figure-12-ws01-snapshot-backup-evidence-note.png`
- Section: `backup-snapshot`
- Proof: Cropped Proxmox evidence note documenting WS01 snapshot, backup file, scheduled job, VM inventory, and storage status.
- SHA256: `AFCF76FDB5580A7D7E42BB1BADD6EA6007BEAD9E32BA09FCD7C8A41D890F3A7D`

### Figure 13: sd.tech IT Share Read Write Validation

- File: `screenshots/figure-13-sdtech-it-share-read-write-validation.png`
- Section: `file-services-gpo-drive-map`
- Proof: WS01 sd.tech validation showing applied GPO, I: mapped drive to \\DC01\IT, and read/write test success.
- SHA256: `339A49CC0F07F37E030F11AEFD7D0009EADF7022910490814D7968B7BC2C6BAD`

### Figure 14: standard.user IT Share Read Only and Write Denial Validation

- File: `screenshots/figure-14-standard-user-it-share-read-only-write-denial.png`
- Section: `file-services-gpo-drive-map`
- Proof: WS01 standard.user validation showing applied GPO, I: mapped drive to \\DC01\IT, read access success, and write denial success.
- SHA256: `27F7745FF4230E41B1B946531246870D5CF56F81E7320727CBD91E5BE283F611`

### Figure 15: DC01 Central Evidence Export Validation

- File: `screenshots/figure-15-dc01-central-evidence-export-validation.png`
- Section: `evidence-export`
- Proof: DC01 evidence export validation showing copied folders and exported file counts for the central evidence package.
- SHA256: `6F04AD70226BB9F16D5850FED88CC6B27067DE3C7EA4F6EAC8A1E90CE6F6242C`

### Figure 16: Final Evidence ZIP Manifest and SHA256 Validation

- File: `screenshots/figure-16-final-evidence-zip-manifest-sha256-validation.png`
- Section: `evidence-export`
- Proof: Final evidence ZIP validation showing manifest counts and SHA256 hash for the exported evidence package.
- SHA256: `D96222651F09ECAE33F45B6280F2F6197E38F5DDD7ABF6278A091AC66C7071D3`

### Figure 17: Documentation Source Hash Validation

- File: `screenshots/figure-17-documentation-source-hash-validation.png`
- Section: `documentation-source`
- Proof: Documentation source staging validation showing proof summary, manifest files, and final ZIP SHA256 verification.
- SHA256: `CE77AD3C0ED5F63DC28492391BDBE7AD99C75F6D79469DBCE4DAEB696997EA98`

## Publication note

These screenshots remain as the reviewed June 12 historical proof set. The June 21 validation evidence is indexed separately in `../validated-2026-06-21/` and is the current primary review path.
