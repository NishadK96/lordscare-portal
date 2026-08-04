# LordsCare Windows Bridge

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

Set `RunOnce` to `false` for continuous polling. Keep `RequireLordsBotStopped` enabled until a verified account-reload mechanism is added.
