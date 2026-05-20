# Installing OutreachOS (Windows)

OutreachOS is a desktop CRM for Conscious Automation. All machines connect to the **same Supabase project**; each user signs in with their own account.

## For developers (build the installer)

1. Install Node.js 20+ and run `npm install` in `outreachos/`.
2. Copy `.env.example` to `.env` and add your Supabase URL + anon key (used when building, optional if installers use first-run setup).
3. Apply database migrations in Supabase SQL Editor (see `supabase/migrations/`).
4. Build the installer:

```bash
npm run electron:build
```

5. Find the installer under `release/` (e.g. `OutreachOS Setup 0.1.0.exe`).

## For team members (install on a PC)

1. Run the installer from `release/`.
2. On first launch, enter the **Supabase project URL** and **anon key** (get these from your admin or Supabase dashboard → Project Settings → API).
3. Sign in or register with your email.
4. Optional: Settings → Startup → launch on Windows boot (for reminders).

## Database setup (admin, once per project)

Run these SQL files in order in the Supabase SQL Editor:

1. `supabase/schema.sql` (full schema + seeds) — or run migrations:
2. `20260519_lead_processing.sql`
3. `20260520_outreach_channel.sql`
4. `20260521_call_templates.sql`
5. `20260522_activity_templates.sql`

In the app: **Settings → Database → Check database** should show all tables OK.

## Where config is stored

| Data | Location |
|------|----------|
| Supabase URL + anon key | `%APPDATA%/OutreachOS/supabase-config.json` (per PC) |
| Login session | Encrypted file in `%APPDATA%/OutreachOS/` |
| Theme / preferences | Local storage |

The **service role secret** must never be pasted into OutreachOS. Only the anon/publishable key.

## Troubleshooting

- **Blank screen after install** — Re-run installer or check Windows blocked the app; allow in SmartScreen if needed.
- **Could not connect** — Verify URL ends with `.supabase.co` and key is the anon key.
- **Missing table errors** — Run migrations in Supabase; use Settings → Database to see which table failed.
- **Dev mode** — `npm run dev` with `.env` in the project folder (Vite embeds env at build time for production builds).

## Updating the app

Install a newer build over the existing install. User data in `%APPDATA%/OutreachOS/` is preserved.
