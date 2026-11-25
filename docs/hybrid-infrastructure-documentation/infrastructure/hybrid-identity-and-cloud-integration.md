# Hybrid Identity and Cloud Integration

## Scope

I use the lab to document hybrid infrastructure management, but I separate the evidence by platform and observed state.

## Active Directory to Linux

Linux01 is the clearest direct domain-integration implementation. Evidence supports realmd configuration for `ad.jeremyfontenot.online`, SSSD as the identity client, Kerberos configuration, and AD identity lookup. I remediated an SSSD responder/socket conflict and validated a new AD-authenticated SSH session on Linux01.

## Azure Arc

HVHOST01 and VMM01 are represented as Azure Arc connected machines in the personal lab. Public evidence supports:

- HVHOST01 Connected status
- Connected Machine agent version 1.67.03504.3207
- Automatic upgrade enabled
- Arc services running on HVHOST01
- Successful TCP 443 connectivity to `gbl.his.arc.azure.com`
- VMM01 Connected status
- VMM01 SQL Server 2022 resource in connected mode
- SQL Windows Agent extension provisioned successfully
- DPS and metrics upload status OK
- Automatic backups disabled

The direct VMM01 credential was rejected for a remote PowerShell collection. I preserve that access boundary and do not claim that local service, SQL, or telemetry state was directly re-read in that collection.

## Windows Admin Center

Windows Admin Center evidence shows HVHOST01 and VMM01 as Arc-connected systems. The public evidence separates Windows and Azure signed-in contexts and removes account identifiers.

## System Center Virtual Machine Manager

SCVMM 2022 evidence supports:

- SCVMM installation completed
- HVHOST01 managed with host status OK
- APP01 discovered
- APP01 remote start
- APP01 VM Viewer session

The evidence does not establish live migration, clustering, high availability, Storage Spaces Direct, or direct Proxmox management through SCVMM.

## Claim Boundaries

I do not claim Microsoft Entra Connect synchronization, production Microsoft 365 administration, tenant ownership, Exchange mail flow, Intune fleet management, or completed Microsoft 365 Graph administration unless separate direct evidence supports it. Azure resource state is limited to the public captured context.

## Evidence

- [Azure Arc public evidence](../../../evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/evidence/azure-arc-validation-public.txt)
- [Azure Arc evidence manifest](../../../evidence-library/projects/on-prem-home-lab/azure-arc-hybrid-management/evidence-manifest.json)
- [SCVMM evidence manifest](../../../evidence-library/projects/on-prem-home-lab/scvmm-2022/evidence-manifest.json)
- [Linux01 domain integration](../../../evidence-library/projects/on-prem-home-lab/current-validated-state/direct-evidence/linux01-system-network-domain-validation.md)
