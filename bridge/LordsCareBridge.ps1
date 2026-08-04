[CmdletBinding()]
param([string]$ConfigPath = "")

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($ConfigPath)) { $ConfigPath = Join-Path $PSScriptRoot "bridge.config.json" }

function Write-BridgeLog([string]$Message) {
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
}

function Get-RequiredEnvironment([string]$Name) {
    $value = [Environment]::GetEnvironmentVariable($Name)
    if ([string]::IsNullOrWhiteSpace($value)) { throw "Required environment variable $Name is not configured." }
    return $value.TrimEnd('/')
}

function Test-HasProperty($Object, [string]$Name) {
    return $null -ne $Object -and $Object.PSObject.Properties.Name -contains $Name
}

function Convert-ToBoolean($Value) {
    if ($Value -is [bool]) { return $Value }
    return @("true", "on", "1", "yes", "enabled") -contains ([string]$Value).ToLowerInvariant()
}

function Add-Change($Changes, [string]$Path, $OldValue, $NewValue) {
    if ($OldValue -ne $NewValue) {
        $Changes.Add([ordered]@{ path = $Path; from = $OldValue; to = $NewValue }) | Out-Null
    }
}

function Set-ProtectionValue($Protection, $Changes, [string]$JsonName, $Value) {
    if (-not (Test-HasProperty $Protection $JsonName)) { throw "Lords Bot setting protectionSettings.$JsonName was not found." }
    $oldValue = $Protection.$JsonName
    Add-Change $Changes "/protectionSettings/$JsonName" $oldValue $Value
    $Protection.$JsonName = $Value
}

function Apply-ProtectionRequest($Settings, $Requested, $Config) {
    if (-not (Test-HasProperty $Settings "protectionSettings")) { throw "protectionSettings is missing from settings.json." }
    $protection = $Settings.protectionSettings
    $changes = [System.Collections.ArrayList]::new()
    $booleanMappings = [ordered]@{
        always_shielded = "alwaysOpenShield"
        shield_when_attacked = "openShieldWhenUnderAttack"
        shield_when_scouted = "openShieldWhenScouted"
        shield_when_rallied = "openShieldWhenRallied"
        longer_shields_first = "biggerSheildsFirst"
        always_anti_scout = "alwaysAntiScout"
        anti_scout_when_scouted = "antiScoutWhenScout"
        recall_gatherers_attacked = "recallGatherTroopsWhenUnderAttack"
        recall_gatherers_scouted = "recallGatherTroopsWhenScouted"
        recall_on_tile_conflict = "recallGatherTroopsOnConflict"
        dont_shelter_siege = "dontShelterSiege"
    }

    foreach ($portalName in $booleanMappings.Keys) {
        if (Test-HasProperty $Requested $portalName) {
            Set-ProtectionValue $protection $changes $booleanMappings[$portalName] (Convert-ToBoolean $Requested.$portalName)
        }
    }

    if (Test-HasProperty $Requested "shield_redeploy_minutes") {
        $minutes = [int]$Requested.shield_redeploy_minutes
        if ($minutes -lt 1 -or $minutes -gt 1440) { throw "Shield redeploy threshold is outside the allowed range." }
        Set-ProtectionValue $protection $changes "shieldRedeployTime" $minutes
    }

    if (Test-HasProperty $Requested "shelter_mode") {
        throw "This is an older shelter request. Ask the customer to resubmit using Shelter behavior and Shelter troops."
    }

    if (Test-HasProperty $Requested "shelter_behavior") {
        $name = [string]$Requested.shelter_behavior
        $entry = $Config.ShelterEnums.Behavior.PSObject.Properties[$name]
        if ($null -eq $entry) { throw "Unsupported shelter behavior: $name" }
        Set-ProtectionValue $protection $changes "ShelterType" ([int]$entry.Value)
    }

    if (Test-HasProperty $Requested "shelter_troops") {
        $name = [string]$Requested.shelter_troops
        $entry = $Config.ShelterEnums.Troops.PSObject.Properties[$name]
        if ($null -eq $entry) { throw "Unsupported shelter troop selection: $name" }
        Set-ProtectionValue $protection $changes "AttackShelterType" ([int]$entry.Value)
    }

    if (Test-HasProperty $Requested "shield_mode") {
        switch ([string]$Requested.shield_mode) {
            "always" { Set-ProtectionValue $protection $changes "alwaysOpenShield" $true }
            "under_attack" { Set-ProtectionValue $protection $changes "openShieldWhenUnderAttack" $true }
            "rallied" { Set-ProtectionValue $protection $changes "openShieldWhenRallied" $true }
            "scouted" { Set-ProtectionValue $protection $changes "openShieldWhenScouted" $true }
            default { throw "Legacy shield mode cannot be applied safely. Ask the customer to resubmit the request." }
        }
    }
    return $changes
}

function Invoke-Supabase([string]$Method, [string]$Path, $Body = $null) {
    $headers = @{ apikey = $script:ApiKey; Prefer = "return=minimal" }
    if ($script:ApiKey.StartsWith("eyJ")) { $headers.Authorization = "Bearer $($script:ApiKey)" }
    $arguments = @{ Method = $Method; Uri = "$($script:SupabaseUrl)/rest/v1/$Path"; Headers = $headers }
    if ($null -ne $Body) {
        $arguments.ContentType = "application/json"
        $arguments.Body = ($Body | ConvertTo-Json -Depth 30 -Compress)
    }
    return Invoke-RestMethod @arguments
}

function Add-AccountIndexEntry($Index, [string]$Key, [string]$SettingsPath) {
    if ([string]::IsNullOrWhiteSpace($Key)) { return }
    $normalized = $Key.Replace('\', '/').Trim('/').ToLowerInvariant()
    if (-not $Index.ContainsKey($normalized)) { $Index[$normalized] = [System.Collections.ArrayList]::new() }
    if (-not $Index[$normalized].Contains($SettingsPath)) { $Index[$normalized].Add($SettingsPath) | Out-Null }
}

function Get-AccountIndex($Config) {
    $index = @{}
    $fileName = if ([string]::IsNullOrWhiteSpace($Config.SettingsFileName)) { "settings.json" } else { [string]$Config.SettingsFileName }
    foreach ($root in @($Config.AccountRoots)) {
        $expandedRoot = [Environment]::ExpandEnvironmentVariables([string]$root)
        if (-not (Test-Path -LiteralPath $expandedRoot -PathType Container)) {
            Write-BridgeLog "Account root was not found: $expandedRoot"
            continue
        }
        $rootPath = (Resolve-Path -LiteralPath $expandedRoot).Path.TrimEnd('\', '/')
        foreach ($file in Get-ChildItem -LiteralPath $rootPath -Filter $fileName -File -Recurse -ErrorAction SilentlyContinue) {
            $relativeDirectory = $file.Directory.FullName.Substring($rootPath.Length).TrimStart('\', '/')
            Add-AccountIndexEntry $index $file.Directory.Name $file.FullName
            Add-AccountIndexEntry $index $relativeDirectory $file.FullName
        }
    }
    Write-BridgeLog "Discovered $(@($index.Values | ForEach-Object { $_ } | Select-Object -Unique).Count) Lords Bot settings files."
    return $index
}

function Resolve-SettingsPath($Request, $Config) {
    $account = $Request.game_accounts
    $references = @($account.bot_slot_reference, $account.account_reference) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
    foreach ($reference in $references) {
        $entry = if ($null -ne $Config.Accounts) { $Config.Accounts.PSObject.Properties[[string]$reference] } else { $null }
        if ($null -ne $entry) { return [string]$entry.Value.SettingsPath }
        $key = ([string]$reference).Replace('\', '/').Trim('/').ToLowerInvariant()
        $matches = @($script:AccountIndex[$key])
        if ($matches.Count -eq 1) { return [string]$matches[0] }
        if ($matches.Count -gt 1) { throw "Multiple local account folders match '$reference'. Add an explicit Accounts override." }
    }
    throw "No local account folder matches $($account.display_name). Set its bot slot reference to the folder name or relative folder path."
}

function Assert-LordsBotStopped($Config) {
    if ($Config.DryRun -or -not $Config.RequireLordsBotStopped) { return }
    foreach ($processName in $Config.BlockedProcessNames) {
        if (Get-Process -Name $processName -ErrorAction SilentlyContinue) { throw "Lords Bot is running. Stop it before applying configuration files." }
    }
}

function Write-DryRunReport($Request, $Changes, $Config) {
    $folder = Join-Path $PSScriptRoot ([string]$Config.DryRunOutputDirectory)
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    $report = [ordered]@{ request_id = $Request.id; account = $Request.game_accounts.display_name; generated_at = (Get-Date).ToUniversalTime().ToString("o"); changes = $Changes }
    $path = Join-Path $folder "$($Request.id).patch.json"
    [IO.File]::WriteAllText($path, ($report | ConvertTo-Json -Depth 30), (New-Object Text.UTF8Encoding($false)))
    Write-BridgeLog "Dry run created $path"
}

function Write-SettingsAtomically([string]$SettingsPath, $Settings, [string]$RequestId) {
    if (-not (Test-Path -LiteralPath $SettingsPath -PathType Leaf)) { throw "settings.json was not found at the configured path." }
    $backupDirectory = Join-Path (Split-Path -Parent $SettingsPath) ".lordscare-backups"
    New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
    $backupPath = Join-Path $backupDirectory "$(Get-Date -Format 'yyyyMMdd-HHmmss')-$RequestId.settings.json"
    $temporaryPath = "$SettingsPath.lordscare.tmp"
    [IO.File]::WriteAllText($temporaryPath, ($Settings | ConvertTo-Json -Depth 100), (New-Object Text.UTF8Encoding($false)))
    $null = Get-Content -LiteralPath $temporaryPath -Raw | ConvertFrom-Json
    [IO.File]::Replace($temporaryPath, $SettingsPath, $backupPath, $true)
    return $backupPath
}

function Record-Audit([string]$Action, [string]$RequestId, $Details) {
    Invoke-Supabase "POST" "audit_log" @{ actor_id = $null; action = $Action; entity_type = "bot_setting_request"; entity_id = $RequestId; details = $Details } | Out-Null
}

function Process-Request($Request, $Config) {
    $settingsPath = Resolve-SettingsPath $Request $Config
    if (-not (Test-Path -LiteralPath $settingsPath -PathType Leaf)) { throw "The mapped settings file does not exist." }
    $settings = Get-Content -LiteralPath $settingsPath -Raw | ConvertFrom-Json
    $category = [string]$Request.requested_settings.settings_category
    if ($category -ne "protection") { throw "Category '$category' is not supported by this bridge version." }
    $changes = Apply-ProtectionRequest $settings $Request.requested_settings $Config

    if ($Config.DryRun) { Write-DryRunReport $Request $changes $Config; return }

    Assert-LordsBotStopped $Config
    $backupPath = Write-SettingsAtomically $settingsPath $settings ([string]$Request.id)
    $note = "Applied automatically by LordsCare Bridge at $((Get-Date).ToUniversalTime().ToString('u'))."
    Invoke-Supabase "PATCH" "bot_setting_requests?id=eq.$($Request.id)&status=eq.approved" @{ status = "applied"; applied_at = (Get-Date).ToUniversalTime().ToString("o"); admin_note = $note } | Out-Null
    Record-Audit "settings_request_applied_by_bridge" ([string]$Request.id) @{ account_id = $Request.game_account_id; category = $category; changed_paths = @($changes | ForEach-Object { $_.path }); backup_file = (Split-Path -Leaf $backupPath) }
    Write-BridgeLog "Applied request $($Request.id) to $($Request.game_accounts.display_name)."
}

if (-not (Test-Path -LiteralPath $ConfigPath -PathType Leaf)) { throw "Bridge configuration was not found at $ConfigPath" }
$config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
$script:SupabaseUrl = Get-RequiredEnvironment "LORDSCARE_SUPABASE_URL"
$script:ApiKey = [Environment]::GetEnvironmentVariable("LORDSCARE_SUPABASE_SECRET_KEY")
if ([string]::IsNullOrWhiteSpace($script:ApiKey)) { $script:ApiKey = [Environment]::GetEnvironmentVariable("LORDSCARE_SUPABASE_SERVICE_ROLE_KEY") }
if ([string]::IsNullOrWhiteSpace($script:ApiKey)) { throw "LORDSCARE_SUPABASE_SECRET_KEY is not configured." }
$script:AccountIndex = Get-AccountIndex $config

do {
    try {
        $select = [Uri]::EscapeDataString("id,game_account_id,requested_settings,game_accounts!inner(account_reference,bot_slot_reference,display_name)")
        $rawRequests = Invoke-Supabase "GET" "bot_setting_requests?status=eq.approved&select=$select&order=created_at.asc&limit=20"
        $requests = @($rawRequests)
        # Windows PowerShell 5.1 can preserve a JSON root array as one nested
        # pipeline item. Flatten that wrapper so every request is processed
        # independently instead of projecting all request properties together.
        while ($requests.Count -eq 1 -and $requests[0] -is [System.Array]) {
            $requests = @($requests[0])
        }
        if ($requests.Count -eq 0) { Write-BridgeLog "No approved requests are waiting." }
        else { Write-BridgeLog "Processing $($requests.Count) approved request(s)." }
        foreach ($request in $requests) {
            try { Process-Request $request $config }
            catch {
                Write-BridgeLog "Request $($request.id) was not applied: $($_.Exception.Message)"
                try { Record-Audit "settings_request_bridge_failed" ([string]$request.id) @{ account_id = $request.game_account_id; error = $_.Exception.Message } } catch { Write-BridgeLog "Could not record the failure audit event." }
            }
        }
    }
    catch { Write-BridgeLog "Bridge poll failed: $($_.Exception.Message)" }
    if (-not $config.RunOnce) { Start-Sleep -Seconds ([int]$config.PollSeconds) }
} while (-not $config.RunOnce)
