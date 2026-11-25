# Virtualization Architecture

## Proxmox Host

I use Proxmox VE as the primary virtualization platform. The read-only inventory validates the platform version and the running state of the primary virtual machines.

| VMID | Hostname | Operating system or role | Recorded state |
|---|---|---|---|
| 100 | pfsense-fw | pfSense firewall and routing | Running |
| 200 | dc01 | Windows Server 2022 domain controller | Running |
| 300 | ws01 | Windows 10 Pro domain client | Running |
| 400 | linux01 | Ubuntu 26.04 LTS | Running |

The inventory also records each VM's bridge placement, vCPU, memory, disk allocation, and guest-agent state. The guest agents for pfsense-fw, dc01, and ws01 are not configured or responding in that captured object; Linux01 has a responding configured guest agent.

## Nested or Management Platforms

Repository evidence separately documents:

- HVHOST01, a Windows host used with Hyper-V and Azure Arc.
- VMM01, a Windows management system with System Center Virtual Machine Manager and Azure integration.
- APP01, a Windows application system with storage expansion evidence.
- MACVM01, a macOS virtual-machine identity and network integration case.

I treat these as evidence-backed subsystems. I do not infer that they are part of every primary inventory capture unless the relevant evidence supports that relationship.

## Virtual Lifecycle Administration

My work includes VM inventory review, snapshot review, backup job review, isolated restore testing, network isolation, guest validation, and cleanup. A restore exercise is not equivalent to an ongoing restore program.

## Guest Validation Boundary

The Proxmox inventory establishes VM configuration and running state at the time of capture. It does not by itself prove guest service health, firewall policy, domain health, or the success of every backup task.

## Evidence

- [Proxmox platform inventory](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-platform-inventory.md)
- [Proxmox backup configuration](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-backup-configuration.md)
- [Restore validation](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/proxmox-restore-validation.md)
