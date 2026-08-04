# LordsCare Windows Bridge v3

The bridge reads approved LordsCare requests from Supabase and applies an allowlisted set of changes to the matching Lords Bot `settings.json` file.

## Safety defaults

- Dry-run mode is enabled by default.
- Full account settings are never uploaded to Supabase.
- Only approved requests are read.
- This first version changes only known protection keys.
- Old ambiguous shelter requests are refused and must be resubmitted.
- Live writes require Lords Bot to be stopped.
- Every live write uses atomic replacement and creates a timestamped backup.
- A request is marked `applied` only after a successful settings-file write.
- Continuous mode can batch supported requests, gracefully close only
  `LordsMobileBot.exe`, apply the batch, and restart the bot.
- Automatic cycles have a configurable minimum restart interval to avoid
  repeatedly interrupting managed accounts.
- A single-instance lock prevents duplicate background workers.
- If the bot cannot restart, a persistent flag makes the next poll retry startup.

## Windows setup

1. Copy this `bridge` folder to the Windows VPS.
2. Copy `bridge.config.example.json` to `bridge.config.json`.
3. Set `AccountRoots` to the Lords Bot `config` folder. The standard desktop example is `%USERPROFILE%\Desktop\LordsBot-Release\config`; Windows environment variables are expanded automatically.
4. The bridge scans every numeric account folder and its `settings.json` automatically. In LordsCare, set each account's **Bot slot reference** to the exact numeric folder name, such as `458747971`. This is entered while assigning the account to its customer; no per-account bridge configuration is required.
5. Use the optional `Accounts` object only when duplicate folder names or an unusual layout require a manual override.
6. Confirm the shelter enum values against one controlled Lords Bot account before disabling dry-run mode.
7. Store credentials as Windows user environment variables, never in the configuration file:

   ```powershell
   [Environment]::SetEnvironmentVariable("LORDSCARE_SUPABASE_URL", "https://YOUR_PROJECT.supabase.co", "User")
   [Environment]::SetEnvironmentVariable("LORDSCARE_SUPABASE_SECRET_KEY", "YOUR_SERVER_SECRET", "User")
   ```

8. Open a new PowerShell window and run:

   ```powershell
   PowerShell.exe -ExecutionPolicy Bypass -File .\LordsCareBridge.ps1
   ```

9. Inspect the generated `dry-run` patch reports. They contain only changed paths and values, not full account settings.
10. After verification, stop Lords Bot, set `DryRun` to `false`, and run the bridge again.

## Automatic mode for this VPS

The included `bridge.config.v3.json` is prepared for:

```text
C:\Users\Administrator\Desktop\LordsBot-Release\LordsMobileBot.exe
C:\Users\Administrator\Desktop\LordsBot-Release\config
```

It polls every 30 seconds and batches supported requests, with no more than one
automatic Lords Bot restart every 15 minutes. It first sends a normal Windows
close request to Lords Bot and waits 45 seconds. Forced termination is disabled.
The G Lords Panel processes are not stopped.

To enable it:

1. Rename the current `bridge.config.json` as a backup.
2. Copy `bridge.config.v3.json` to `bridge.config.json`.
3. Confirm the Supabase user environment variables are still present.
4. From an Administrator Command Prompt, run:

   ```bat
   powershell.exe -ExecutionPolicy Bypass -File "C:\LordsCare-Windows-Bridge\Install-LordsCareBridgeTask.ps1" -ConfigPath "C:\LordsCare-Windows-Bridge\bridge.config.json"
   ```

The task starts immediately and at every Administrator logon. It runs only in
that interactive user session so it can close and restart the desktop bot.
Operational messages are appended to `LordsCareBridge.log`.

To remove the task:

```bat
powershell.exe -ExecutionPolicy Bypass -File "C:\LordsCare-Windows-Bridge\Uninstall-LordsCareBridgeTask.ps1"
```

Only the Protection category is currently supported. Unsupported requests stay
approved and are logged once per bridge process; they do not trigger a restart.
