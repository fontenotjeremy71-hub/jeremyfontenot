# Active Directory Service Desk Delegation Validation

Captured: 2026-09-05

Classification: sanitized public personal-lab evidence

## Preservation and derivative relationship

This public file is a sanitized presentation derivative. The first captured evidence is retained byte-for-byte in [`source-original/`](./source-original/README.md). The derivative preserves the validated tasks, results, scope, and limitations while omitting unnecessary raw directory identifiers.

## Purpose

This evidence records a least-privilege Active Directory delegation exercise in the personal nonproduction `ad.jeremyfontenot.online` lab. The goal was to allow a Service Desk security group to perform bounded user-support and group-membership tasks without Domain Admin rights.

## Delegated principal

- Security group: `JFAD\GG-ServiceDesk`
- Validation account: `JFAD\sd.tech`
- Scope: `OU=Service Desk,OU=Users,OU=JFAD,DC=ad,DC=jeremyfontenot,DC=online`

## Validated user-support rights

The Service Desk OU ACL was configured with explicit, non-inherited rights that apply to descendant user objects:

- Reset Password extended right
- Write `lockoutTime` for account unlock
- Write `pwdLastSet` for force-password-change-at-next-logon

The validation account successfully:

- reset the password of a separate test user;
- unlocked a deliberately locked test user; and
- set the test user to change password at next logon.

A negative-control test confirmed that the same account could **not** disable the test account and received `Insufficient access rights to perform the operation`.

## Validated group-membership delegation

`JFAD\GG-ServiceDesk` was granted explicit `WriteProperty` permission on only the `member` attribute of `GG-RDP-Allowed`.

An Active Directory schema lookup confirmed that the ACL object type used for this delegation maps to the LDAP `member` attribute. The raw schema identifier is intentionally omitted from the public derivative because the attribute-name mapping is sufficient to support the bounded claim.

The validation account successfully added and removed a test user from `GG-RDP-Allowed`.

A negative-control test confirmed it could **not** add the same test user to `GG-Lab-Admins` and received `Insufficient access rights to perform the operation`.

## Result

**PASS — bounded least-privilege Service Desk delegation was configured and functionally validated.**

The evidence supports a personal-lab claim of scoped Active Directory delegation for common Service Desk operations. It does not claim enterprise directory ownership, production change authority, privileged-access-management deployment, or organization-wide RBAC governance.

## Evidence files

- [Public validation summary](./validation-public.txt)
- [Evidence manifest](./evidence-manifest.json)
- [Public presentation page](./index.html)
