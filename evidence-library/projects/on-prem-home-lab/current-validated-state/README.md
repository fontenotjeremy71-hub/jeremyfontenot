# Current Validated State

This public evidence folder summarizes reviewer-safe records from the private home-lab operations repository without exposing private repository links. Public claims use stable classifications instead of date-based proof labels.

## Document

- Title: Jeremy Fontenot’s On-Premises Home Lab Documentation
- Filename: `Jeremy-Fontenot-On-Premises-Home-Lab-Documentation.docx`
- Download description: Download the Professional Home Lab Documentation (.docx)
- SHA-256: `D7E81A06DCFBD2E91EB8F52A02BDC795AC5B7084A70F343233F1104CCD297BDB`

## Source Commits

- Website source commit at generation: `effdbeb0ed8d632a0b0c93328cd593cf85c3eb46`
- Home-lab source commit: `3d42a4808a6a0607d78f4f4e7fd1e71783729a6b`

## Supported Public Claims

- Personal nonproduction lab hosted on Dell PowerEdge R710 with Proxmox VE 9.2.3.
- pfSense, DC01, WS01, and Linux01 are the primary lab VMs described by current records.
- Linux01 current supported placement is VLAN 30 at `10.10.30.20/24`; older `10.10.20.x` Linux01 evidence is historical.
- DC01 evidence supports AD DS, DNS, DHCP, Group Policy, and FSMO role review where linked.
- Backup job visibility is supported; recurring disaster-recovery assurance, RTO, and RPO are not claimed.
- Linux01 SSSD remediation is documented as remediated and validated in the personal lab.

## Limitations

Personal lab evidence does not represent employer production administration, client infrastructure ownership, enterprise scale, guaranteed uptime, or full security assurance. Timeout observations remain timeout observations.
