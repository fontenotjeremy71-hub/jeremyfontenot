BeforeAll {
    . "$(Join-Path $PSScriptRoot "..\src\Export-JFGraphUsers.ps1")"
}

Describe "Export-JFGraphUsers Function" {

    It "Rejects an unauthenticated Microsoft Graph session" {

        Mock Get-MgContext { return $null }

        {
            Export-JFGraphUsers
        } | Should -Throw "*Microsoft Graph is not connected*"
    }

    It "Rejects a session without User.Read.All permission" {

        Mock Get-MgContext {
            [PSCustomObject]@{
                TenantId = "test-tenant"
                Scopes   = @("User.Read")
            }
        }

        {
            Export-JFGraphUsers
        } | Should -Throw "*requires User.Read.All*"
    }
}

Describe "Export-JFGraphUsers Successful Export" {

    BeforeAll {
        . "$(Join-Path $PSScriptRoot "..\src\Export-JFGraphUsers.ps1")"
    }

    BeforeEach {
        Mock Get-MgContext {
            [PSCustomObject]@{
                TenantId = "test-tenant"
                Scopes   = @("User.Read", "User.Read.All")
            }
        }

        Mock Get-MgUser {
            @(
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
    }

    It "Exports two mocked users successfully" {

        $OutputPath = Join-Path $TestDrive "GraphUsers.json"

        $Result = Export-JFGraphUsers -OutputPath $OutputPath

        $Result.Status | Should -Be "Success"
        $Result.UserCount | Should -Be 2

        Test-Path $OutputPath | Should -BeTrue

        $Json = Get-Content $OutputPath -Raw |
            ConvertFrom-Json

        $Json.UserCount | Should -Be 2
        @($Json.Users).Count | Should -Be 2
        $Json.TenantId | Should -Be "test-tenant"

        Should -Invoke Get-MgUser -Exactly -Times 1
    }
}
