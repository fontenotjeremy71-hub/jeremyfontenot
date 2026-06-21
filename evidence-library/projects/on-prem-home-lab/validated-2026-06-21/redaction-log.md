# Public evidence review log

Reviewed on June 21, 2026. The raw source archives remain outside the repository.

## Published with redaction

- DHCP screenshot: virtual NIC client identifiers derived from MAC addresses were covered; IP, hostname, lease state, and scope configuration remain visible.
- Linux01 SHA-256 screenshot: the local home-directory path was covered; the archive filename, command context, and SHA-256 digest remain visible.
- Kerberos text: the temporary ticket-cache identifier was replaced with a redaction marker.
- Network excerpt: link-local IPv6 addresses, interface hardware addresses, and unrelated command output were omitted.
- VM summary: virtual MAC addresses, SMBIOS UUIDs, VM generation identifiers, and creation timestamps were omitted.
- pfSense snapshot listing: the upstream administrative-source address was omitted; the snapshot name, timestamp, forwarding target, and validation boundary remain visible.

## Excluded

- Raw chat-image ZIP.
- Raw complete evidence archive.
- Embedded Linux network screenshot containing an unnecessary virtual MAC address.
- Screenshots containing unrelated browser, desktop, or contact content.
- Raw VM configuration exports containing MAC addresses and UUIDs.
- Raw Kerberos output containing a temporary ticket-cache identifier.
- Full Proxmox network dump because it included substantially more interface detail than needed for the public claim.

## Retained technical context

- The generic `C:\Users\Administrator` PowerShell prompt visible in the supplied validation document and selected DC01 screenshots was retained because it provides command context and does not expose the portfolio workstation path, repository checkout, or a personal Windows profile.
- Domain-qualified Linux account and home-directory values were retained where they directly support Active Directory integration and command provenance.

## Claim boundaries

- Backup files and scheduled-job membership are validated; an isolated restore test is outstanding.
- Snapshot presence is validated; snapshots are not represented as independent backups.
- Firewall configuration intent and the isolated bridge are documented; exclusive source restriction was not independently tested in this evidence set.
- The environment has one domain controller and is a personal nonproduction lab.
