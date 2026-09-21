# Evidence Index

| ID | Evidence file | Supports |
|---|---|---|
| E01 | `evidence/screenshots/01-exchange-powershell-validation.png` | PowerShell validation of shared mailbox, distribution group, and external-sender transport rule |
| E02 | `evidence/screenshots/02-exchange-message-trace-sendas-delivered.png` | Shared mailbox Send As functional delivery validation |
| E03 | `evidence/screenshots/03-defender-explorer-external-sender-validation.png` | Defender Explorer visibility of Project 3 messages and external-sender test |
| E04 | `evidence/screenshots/04-ca-policy-scope-update-success.png` | Successful save of corrected external-user Conditional Access scope |
| E05 | `evidence/screenshots/05-post-remediation-myapps-success.png` | Functional post-remediation interactive access |
| E06 | `evidence/screenshots/06-signin-log-pre-post-remediation.png` | Sign-in log showing failed attempts before remediation and successful attempts afterward |
| E07 | `evidence/screenshots/07-signin-success-details.png` | Successful sign-in details, MFA requirement, user and application |
| E08 | `evidence/screenshots/08-conditional-access-evaluation-success.png` | MFA policy succeeds; security-info block policy is Not applied |
| E09 | `evidence/screenshots/09-m365-e5-group-assignment-list.png` | M365 Developer E5 product page showing Project 3 E5 Licensing as Type Group |
| E10 | `evidence/screenshots/10-m365-license-errors-zero.png` | Licensing errors = 0 and members without licenses = 0 |
| E11 | `evidence/screenshots/11-m365-group-apps-services.png` | Apps & services configuration view for the selected licensing group |
| L01 | `evidence/logs/AuditLogs_2026-09-21.csv` | Public sanitized audit-event derivative validating the Conditional Access policy update |
| L02 | `evidence/logs/license-details-output.txt` | Public sanitized summary of effective E5 licenseDetails and relevant service-plan provisioning states |
| C01 | `command-evidence.txt` | Sanitized PowerShell evidence transcribed from validated commands in the project session |

## Recommended portfolio subset

Use E01, E02, E03, E04, E07, and E08 as the primary visible evidence set. Use E09/E10 for licensing administration if licensing is discussed on the project page. L01/L02 are sanitized public derivatives intended for supporting review; tenant-specific identifiers and source IP details are intentionally omitted.
