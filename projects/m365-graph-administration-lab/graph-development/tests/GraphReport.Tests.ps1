BeforeAll {
    $ReportPath = Join-Path $TestDrive "GraphUsers.json"

    $SampleReport = [PSCustomObject]@{
        Application = "JF-M365-Graph-Development"
        TenantId    = "test-tenant"
        GeneratedAt = (Get-Date).ToUniversalTime().ToString("o")
        UserCount   = 2
        Users       = @(
            [PSCustomObject]@{
                Id                = "user-001"
                DisplayName       = "Test User One"
                UserPrincipalName = "test1@example.invalid"
                AccountEnabled    = $true
            }
            [PSCustomObject]@{
                Id                = "user-002"
                DisplayName       = "Test User Two"
                UserPrincipalName = "test2@example.invalid"
                AccountEnabled    = $true
            }
        )
    }

    $SampleReport |
        ConvertTo-Json -Depth 5 |
        Set-Content -LiteralPath $ReportPath -Encoding utf8

    $Report = Get-Content -LiteralPath $ReportPath -Raw |
        ConvertFrom-Json -ErrorAction Stop
}

Describe "JF-M365-Graph-Development JSON Report" {

    It "Contains the correct application name" {
        $Report.Application |
            Should -Be "JF-M365-Graph-Development"
    }

    It "Contains the expected tenant ID" {
        $Report.TenantId |
            Should -Be "test-tenant"
    }

    It "Contains at least one directory user" {
        @($Report.Users).Count |
            Should -BeGreaterThan 0
    }

    It "Contains matching user counts" {
        $Report.UserCount |
            Should -Be @($Report.Users).Count
    }

    It "Contains a valid generation timestamp" {
        { [datetime]::Parse($Report.GeneratedAt) } |
            Should -Not -Throw
    }
}
