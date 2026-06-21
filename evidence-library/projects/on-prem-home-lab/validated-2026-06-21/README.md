# Validated On-Premises Home Lab Evidence — June 21, 2026

This curated public set supports the [On-Prem Home Lab case study](../../../../on-prem-home-lab.html) with reviewed command output, screenshots, integrity records, and the APA-formatted Word validation document.

## Validation status

- Status: validated within the limits documented below
- Collection and validation date: June 21, 2026
- Environment: personal nonproduction home lab
- Physical host: one Dell PowerEdge R710
- Hypervisor: Proxmox VE
- Primary VMs: pfSense VM 100, DC01 VM 200, WS01 VM 300, and Linux01 VM 400

## Primary document

- Title: On-Premises Home Lab Infrastructure Validation
- Public file: `../jeremy-fontenot-on-premises-home-lab-validation-2026-06-21.docx`
- Size: 1,400,031 bytes
- SHA-256: `03a605517e2a6ebeb805b7e0f74bd1ec06c664debbdb39b99e09aecc62e4845a`

## Archive integrity

- Complete evidence archive SHA-256: `e8a5a40a6960557383ccb152af2da71053e50382d8287d632b9ed5ad85cb7060`
- Embedded Linux01 archive SHA-256: `5c1eff369a0055338808a93c025847cc5997db4f04614a56ede33b43f9e9b8db`

## Evidence categories

- Proxmox host, storage, bridge, VM, all-four-VM snapshot, and scheduled-backup validation
- Windows Server 2022, Active Directory, DNS, DHCP, and Group Policy screenshots
- Linux01 system, DNS, SSSD, Kerberos, SSH, UFW, sudo, guest-agent, and backup records
- Evidence packaging, SCP transfer, and SHA-256 verification

The machine-readable `manifest.json`, reviewer-oriented `manifest.csv`, sanitized text files, and captioned screenshots provide the public review path.

## Limitations

- Archive presence does not prove a successful application-level restore.
- Snapshot presence is not an independent backup.
- Exclusive firewall-source restriction was not independently tested.
- The lab uses one domain controller and is not designed for production availability.

See [redaction-log.md](redaction-log.md) for exclusions and privacy decisions.
