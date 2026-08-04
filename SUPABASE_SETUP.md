# Connect LordsCare to Supabase

1. Create a new Supabase project.
2. Open the SQL editor and run `supabase/migrations/001_lordscare_portal.sql`.
3. In Authentication, create the owner's user account. Copy that user's UUID and run the final `update profiles ... role = 'admin'` statement shown at the bottom of the migration.
4. Copy `.env.example` to `.env.local` and add the project URL, publishable key and secret key from Supabase Project Settings → API. The secret key is used only by the protected server endpoint that invites customers.
5. Create customer users from the Supabase dashboard. Add their subscriptions and game-account records from the LordsCare admin area as that workflow is connected.

Security rules:

- Never put the Supabase service-role key in the browser or in `NEXT_PUBLIC_...` variables.
- Never store Lords Mobile passwords, OTP codes, recovery codes or session tokens in these tables.
- Keep row-level security enabled. Customers can only read their own records and create settings requests for their own listed accounts.
- Enable MFA for the owner's Supabase account before production use.
