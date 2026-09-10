param(
    [string]$User = "cloudsync.test01",
    [string]$Group = "GG-CloudSync-Test",
    [string]$CloudSyncOU = "OU=Cloud Sync,OU=JFAD,DC=ad,DC=jeremyfontenot,DC=online"
)

Write-Host "=== Cloud Sync AD Validation ==="

Write-Host "`n[User]"
Get-ADUser -Identity $User `
    -Properties UserPrincipalName,Enabled,Department,PasswordLastSet,PasswordNeverExpires,ObjectGUID,DistinguishedName |
    Select-Object Name,SamAccountName,UserPrincipalName,Enabled,Department,PasswordLastSet,PasswordNeverExpires,ObjectGUID,DistinguishedName

Write-Host "`n[Group]"
Get-ADGroup -Identity $Group `
    -Properties GroupScope,GroupCategory,DistinguishedName,ObjectGUID |
    Select-Object Name,SamAccountName,GroupScope,GroupCategory,ObjectGUID,DistinguishedName

Write-Host "`n[Group Members]"
Get-ADGroupMember -Identity $Group |
    Select-Object Name,SamAccountName,ObjectClass

Write-Host "`n[Cloud Sync OU Contents]"
Get-ADObject -SearchBase $CloudSyncOU -SearchScope OneLevel -Filter * |
    Select-Object Name,ObjectClass,DistinguishedName
