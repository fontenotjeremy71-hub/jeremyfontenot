# ADM-LT01 — Hybrid Administration Workstation

**Scope:** Personal, nonproduction Microsoft systems administration lab.  
**Status:** Core configuration and read-only service access **validated** from ADM-LT01; ongoing workstation maintenance is separate.  
**Evidence basis:** Interactive PowerShell command outputs supplied during configuration and validation. This public summary omits account identifiers, subscription IDs, internal IP addresses, credentials, VPN client artifacts, and other unnecessary infrastructure identifiers. Raw session transcripts were not committed.

## Skills demonstrated

- Administered on-premises Active Directory Domain Services through a VPN-connected Windows PowerShell workstation using RSAT.
- Queried DNS zones, DHCP scopes, Group Policy objects, and remote Hyper-V inventory.
- Configured Azure PowerShell and authenticated to a Microsoft developer subscription.
- Validated delegated Microsoft Graph organization access and Exchange Online, Teams, and SharePoint Online administration.
- Built a persistent PowerShell 5.1 profile with a custom prompt, administrative module loading, and cloud connection helper functions.

## Validated workflow and outcomes

| Area | Read-only test | Observed outcome |
| --- | --- | --- |
| VPN / connectivity | Remote management TCP checks for DC01 and HVHOST01 | Both reachable on WinRM TCP 5985 |
| Active Directory | `Get-ADDomain`, `Get-ADDomainController -Discover` | Domain details returned; domain controller discovery succeeded after VPN connection |
| DNS | `Get-DnsServerZone` | Seven DNS zones returned |
| DHCP | `Get-DhcpServerv4Scope` | One active lab server scope returned |
| Group Policy | `Get-GPO -All` | Fifteen GPOs returned |
| Hyper-V | `Get-VM -ComputerName` | Remote VM inventory returned; one nested guest was off |
| Azure | `Connect-AzAccount`, `Get-AzSubscription` | Authenticated; developer subscription listed |
| Microsoft Graph | `Connect-MgGraph`, `Get-MgOrganization` | Tenant organization returned in a fresh PowerShell session |
| Exchange Online | `Connect-ExchangeOnline`, `Get-AcceptedDomain` | Three accepted domains returned |
| Teams | `Connect-MicrosoftTeams`, `Get-CsTenant` | Tenant record returned |
| SharePoint Online | `Connect-SPOService -UseSystemBrowser $true`, `Get-SPOTenant`, `Get-SPOSite` | Tenant settings and site titles returned |
| PowerShell profile | Dot-source profile and restart Windows PowerShell | Custom `JF | ADMIN` prompt displayed; initial AD module startup warning eliminated |

## Troubleshooting performed

1. **AD discovery:** Direct queries against DC01 succeeded while automatic discovery initially failed. VPN connectivity and domain-controller DNS discovery were checked; discovery subsequently succeeded after connecting OpenVPN.
2. **Azure module loading:** `Az.Accounts` was installed but blocked by the Windows PowerShell execution policy. Setting `RemoteSigned` for `CurrentUser` enabled the module to load without changing machine-wide policy.
3. **Microsoft Graph dependency collision:** A Graph organization query failed with a missing-method exception after other cloud modules were loaded. The same query succeeded after starting a fresh PowerShell 5.1 session and loading Graph separately.
4. **SharePoint authentication:** Default authentication failed with an MSAL runtime warning. `Connect-SPOService -UseSystemBrowser $true` succeeded and subsequent read-only queries returned tenant and site data.
5. **PowerShell startup:** Eager loading of the AD module produced an AD Web Services default-drive warning. Removing AD from eager startup loading eliminated the warning; AD commands remain available on demand.

## PowerShell administration workflow

The Windows PowerShell 5.1 profile defines convenient functions: `Connect-LabAzure`, `Connect-LabGraph`, `Connect-LabExchange`, `Connect-LabTeams`, and `Connect-LabSharePoint`. The local prompt is branded `JF | ADMIN`. The profile is stored locally under the administrator's Windows PowerShell profile path; no credential material or exported authentication tokens are published here.

Cloud sign-ins are **not** permanent: sessions can expire and require reauthentication. For reliable Graph operation, use a separate PowerShell process from other cloud modules when assembly conflicts occur.

## Scope and limitations

- This is **personal-lab administration**, not proof of production or enterprise service ownership.
- Read-only query success demonstrates connectivity, authentication, and applicable read permissions; it does **not** establish successful write operations, service availability over time, or comprehensive security posture.
- No screenshot archive or machine-generated raw transcript was added to this change. The validation table is a sanitized, conversation-derived evidence summary; a retained redacted transcript and screenshots would strengthen independent auditability.
- This document does not publish VPN usernames, passwords, keys, internal addresses, or privileged account identifiers.
- Existing portfolio project count remains unchanged; this is supporting Home Lab evidence.

## Follow-up

Capture sanitized screenshots or command-output exports from ADM-LT01 and attach them as reviewed evidence if a more durable independent proof package is desired.
