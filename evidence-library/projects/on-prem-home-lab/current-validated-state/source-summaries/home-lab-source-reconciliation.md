# Home Lab Source Reconciliation Evidence

- Timestamp: `2026-06-26T01:26:06.6980689-05:00`
- Source workstation: `DESKTOP-MR3F9A1`
- Operations repository: `C:\Users\jeremy\Documents\projects\jeremy-homelab-ops`
- Portfolio repository: `C:\Users\jeremy\Documents\projects\jeremyfontenot`
- Deployed page inspected: `https://jeremyfontenot.online/on-prem-home-lab.html`
- Infrastructure changes made: `0`

## Current Command/API Evidence

| Component | Result |
|---|---|
| Proxmox version | `9.2.3` |
| VM 100 | `pfsense-fw`, running, vmbr0 and vmbr1 |
| VM 200 | `dc01`, running, vmbr1 |
| VM 300 | `ws01`, running, vmbr1, guest agent disabled |
| VM 400 | `linux01`, running, vmbr1, `tag=30`, QEMU guest agent responding |
| Backup storage | `backup-hdd`, path `/mnt/pve/backup-hdd`, active |
| Backup job | `backup-critical-lab-vms`, enabled, `sun 02:00`, snapshot, zstd, VMs `100,200,300,400` |
| Linux01 DNS | `linux01.ad.jeremyfontenot.online` resolves to `10.10.30.20` |
| Linux01 PTR | `10.10.30.20` resolves to `linux01.ad.jeremyfontenot.online` |
| VPN path | DC01 DNS TCP 53 and RDP TCP 3389 reachable |
| Expected block | DC01 SMB TCP 445 and pfSense WAN direct RDP TCP 3389 timed out |

## Conflicts

| Component | Higher-precedence current value | Lower-precedence conflicting value | Classification | Action |
|---|---|---|---|---|
| Linux01 IP | `10.10.30.20/24` | Deployed website and June 21 evidence show `10.10.20.20/24` | Stale deployed/historical value | Operations docs now treat `10.10.20.20` as historical |
| Linux01 VLAN | Proxmox config has `tag=30` | Deployed website omits VLAN 30 current state | Stale deployed value | Operations docs use current Proxmox metadata |
| Restore status | June 24 DOCX records isolated restore checks for VM 500 and 600 | June 21 redaction log says restore outstanding | Historical difference | Recovery docs distinguish June 21 historical limitation from June 24 documentation |
| Backup storage | Proxmox API shows `backup-hdd` at `/mnt/pve/backup-hdd` | Older prompt/doc values mention `backup-nvme` | Stale or inconclusive historical value | Operations docs use `backup-hdd` and flag `backup-nvme` as stale unless rename evidence is found |

## Claim Boundary

Current Proxmox API output and current DNS/RDP checks are treated as current observed state. Portfolio and DOCX records are retained as documentation evidence where live command output cannot validate guest internals from this client path. Historical evidence is not rewritten.
