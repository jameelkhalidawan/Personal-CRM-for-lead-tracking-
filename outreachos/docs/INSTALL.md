# Installing OutreachOS (Windows)

OutreachOS is a desktop CRM for Conscious Automation. All machines connect to the **same Supabase project**; each user signs in with their own account.

## For developers (build the installer)

1. Install Node.js 20+ and run `npm install` in `outreachos/`.
2. Copy `.env.example` to `.env` and add your Supabase URL + anon key (embedded at build time so team installers can sign in without a setup screen).
3. Apply database migrations in Supabase SQL Editor (see `supabase/migrations/`).
4. Set the **admin password** (see below) so connection settings can be changed in-app.
5. Build the installer:

```bash
npm run electron:build
```

6. Share only `release/OutreachOS Setup 0.1.0.exe` with the team (not the whole `release/` folder).

## For team members (install on a PC)

1. Run the installer from `release/`.
2. Sign in or register with your email (no Supabase keys to enter on first launch if the installer was built with `.env`).
3. **Settings → Startup** — turn on **Launch OutreachOS when Windows starts** if you want the app after reboot (required once per PC; preference is saved on that machine).
4. Optional: **Settings → Database connection (admin)** — only if your admin gave you the admin password to view or change the project URL/key.

## Database setup (admin, once per project)

Run these SQL files in order in the Supabase SQL Editor:

1. `supabase/schema.sql` (full schema + seeds) — or run migrations:
2. `20260519_lead_processing.sql`
3. `20260520_outreach_channel.sql`
4. `20260521_call_templates.sql`
5. `20260522_activity_templates.sql`
6. `20260523_app_settings.sql` — admin password + optional connection overrides

### Admin password (required for connection settings UI)

After migration `20260523_app_settings.sql`, set a password hash in SQL Editor (replace `YourSecurePassword`):

```sql
UPDATE public.app_settings
SET admin_password_hash = crypt('YourSecurePassword', gen_salt('bf'))
WHERE id = 1;
```

To change the admin password later:

```sql
UPDATE public.app_settings
SET admin_password_hash = crypt('NewPassword', gen_salt('bf'))
WHERE id = 1;
```

Team members use this password in **Settings → Database connection (admin)** to unlock, view, or save URL/anon key. Values are stored in the `app_settings` table in Supabase, **not** in a local file on each PC.

### Optional: store connection overrides in the database

If you leave `supabase_url` and `supabase_anon_key` NULL, the app uses the credentials baked into the installer build. To override for all users after they sign in, set them in SQL (or via the admin UI after login):

```sql
UPDATE public.app_settings
SET
  supabase_url = 'https://your-project.supabase.co',
  supabase_anon_key = 'your-anon-key'
WHERE id = 1;
```

## Where data is stored

| Data | Location |
|------|----------|
| Supabase URL + anon key (optional override) | Supabase `app_settings` table (admin password) |
| Bootstrap anon key (installer only) | Embedded in the built `.exe` — needed to reach Supabase before login; not shown in Settings |
| Login session | `%APPDATA%/OutreachOS/` (encrypted auth storage) |
| Launch on Windows startup | `%APPDATA%/OutreachOS/user-preferences.json` + Windows startup registry |
| Theme / outreach timing | Browser local storage on that PC |

The **service role secret** must never be pasted into OutreachOS. Only the anon/publishable key.

## Troubleshooting

- **Blank screen after install** — Re-run installer or allow the app in Windows SmartScreen.
- **Could not connect** — Admin: check `app_settings` overrides or rebuild installer with correct `.env`.
- **Missing table errors** — Run migrations; use Settings → Database to see which table failed.
- **Auto-launch not working** — Open the app → **Settings → Startup** → enable the checkbox once. Restart Windows to verify. The setting must be turned on on each PC (it is not synced from Supabase).
- **Admin connection locked** — Run the admin password SQL above; migration `20260523` must be applied.
- **Dev mode** — `npm run dev` with `.env` in the project folder.

## Updating the app

Install a newer build over the existing install. User data in `%APPDATA%/OutreachOS/` is preserved. Re-enable **Startup** if auto-launch stops working after a major path change.
