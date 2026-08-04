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
3. Map each portal account reference or bot-slot reference to its real Lords Bot `settings.json` path.
4. Confirm the shelter enum values against one controlled Lords Bot account before disabling dry-run mode.
5. Store credentials as Windows user environment variables, never in the configuration file:

   ```powershell
   [Environment]::SetEnvironmentVariable("LORDSCARE_SUPABASE_URL", "https://YOUR_PROJECT.supabase.co", "User")
   [Environment]::SetEnvironmentVariable("LORDSCARE_SUPABASE_SECRET_KEY", "YOUR_SERVER_SECRET", "User")
   ```

6. Open a new PowerShell window and run:

   ```powershell
   PowerShell.exe -ExecutionPolicy Bypass -File .\LordsCareBridge.ps1
   ```

7. Inspect the generated `dry-run` patch reports. They contain only changed paths and values, not full account settings.
8. After verification, stop Lords Bot, set `DryRun` to `false`, and run the bridge again.

Set `RunOnce` to `false` for continuous polling. Keep `RequireLordsBotStopped` enabled until a verified account-reload mechanism is added.
