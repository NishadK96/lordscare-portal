[CmdletBinding()]
param([string]$ConfigPath = "")

$ErrorActionPreference = "Stop"
$taskName = "LordsCare Bridge"
$bridgePath = Join-Path $PSScriptRoot "LordsCareBridge.ps1"
if ([string]::IsNullOrWhiteSpace($ConfigPath)) { $ConfigPath = Join-Path $PSScriptRoot "bridge.config.json" }
if (-not (Test-Path -LiteralPath $bridgePath -PathType Leaf)) { throw "LordsCareBridge.ps1 was not found." }
if (-not (Test-Path -LiteralPath $ConfigPath -PathType Leaf)) { throw "Bridge configuration was not found at $ConfigPath" }

$resolvedBridge = (Resolve-Path -LiteralPath $bridgePath).Path
$resolvedConfig = (Resolve-Path -LiteralPath $ConfigPath).Path
$userId = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$resolvedBridge`" -ConfigPath `"$resolvedConfig`""

$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument $arguments -WorkingDirectory $PSScriptRoot
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $userId
$principal = New-ScheduledTaskPrincipal -UserId $userId -LogonType Interactive -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Continuously applies approved LordsCare settings and safely restarts Lords Mobile Bot when required." -Force | Out-Null
Start-ScheduledTask -TaskName $taskName
Write-Host "LordsCare Bridge task was installed and started."
Write-Host "Log: $(Join-Path $PSScriptRoot 'LordsCareBridge.log')"
