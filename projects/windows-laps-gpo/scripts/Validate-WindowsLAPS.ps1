# Portfolio-safe Windows LAPS validation script
# Does not display the managed password.

param(
    [string]$ComputerName = "WS01"
)

Write-Host "=== Windows LAPS Validation: $ComputerName ==="

Write-Host "`n[1] AD computer and LAPS attribute presence"
Get-ADComputer $ComputerName `
    -Properties msLAPS-PasswordExpirationTime,msLAPS-EncryptedPassword |
Select-Object Name,
    msLAPS-PasswordExpirationTime,
    @{N='EncryptedPasswordPresent';E={[bool]$_.'msLAPS-EncryptedPassword'}}

Write-Host "`n[2] LAPS password metadata"
Get-LapsADPassword -Identity $ComputerName |
Select-Object ComputerName,
    Account,
    PasswordUpdateTime,
    ExpirationTimestamp,
    Source,
    DecryptionStatus,
    AuthorizedDecryptor

Write-Host "`n[3] LAPS OU extended rights"
Find-LapsADExtendedRights `
    -Identity "OU=LAPS-Test,OU=Workstations,OU=JFAD,DC=ad,DC=jeremyfontenot,DC=online"
