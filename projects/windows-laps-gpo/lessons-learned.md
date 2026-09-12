# Lessons Learned

- Verify `msLAPS-*` schema state before running `Update-LapsADSchema`.
- Use temporary privilege for schema changes and remove it immediately afterward.
- Scope testing to a dedicated OU rather than broad workstation containers.
- Separate LAPS password-read rights from Domain Admin privileges.
- Prefer encrypted password storage and an explicit decryptor group.
- Select the managed account intentionally; LAPS can rotate a disabled account, but that does not make the account usable for recovery.
- Event IDs 10021, 10020, 10018, 10014, and 10004 provide strong operational evidence.
- `gpresult` and GUI RSOP validate complementary layers of Group Policy application.
- Troubleshoot the failing layer from evidence: transport, WMI/RPC, firewall policy source, policy application, and finally LAPS processing.
- Portfolio evidence should show timestamps, source, account, decryption status, and authorization metadata while excluding the password itself.
