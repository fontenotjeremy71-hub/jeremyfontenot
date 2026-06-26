# Current Validated State

This public evidence folder summarizes reviewer-safe records from the private home-lab operations repository without exposing private repository links. Public claims use stable classifications instead of month-based proof labels.

## Source Commits

- Website source commit at audit start: `a95259d90717695acebf8840d740fde178adda8a`
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
