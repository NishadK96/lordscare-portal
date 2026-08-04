$ErrorActionPreference = "Stop"
$taskName = "LordsCare Bridge"
if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
    Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "LordsCare Bridge task was removed."
}
else {
    Write-Host "LordsCare Bridge task is not installed."
}
