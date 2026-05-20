# Phase 3 — Database schema

**Status:** ✅ Complete (SQL in repo — you run once in Supabase)

## Goal

Core tables, RLS policies, indexes, seed data (4 services, 6 email templates, 2 call templates). For admin connection settings, also run `migrations/20260523_app_settings.sql` — see [DEVELOPER_SETUP.md](./DEVELOPER_SETUP.md).

All CRM tables live in Supabase PostgreSQL. The app does not create them automatically — you run the SQL once in the dashboard.

## Step 1 — Open SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open **your** company project
3. Click **SQL Editor** → **New query**

## Step 2 — Run the schema

1. Open `outreachos/supabase/schema.sql` in this repo
2. Copy the **entire file**
3. Paste into the SQL Editor
4. Click **Run** (or Ctrl+Enter)

You should see **Success** and a results table at the bottom with row counts, e.g.:

| table_name        | rows |
|-------------------|------|
| services          | 4    |
| email_templates   | 6    |
| businesses        | 0    |
| …                 | 0    |

## Step 3 — Confirm in Table Editor

**Table Editor** should list at least:

- `businesses`, `decision_makers`, `services`, `business_services`
- `activities`, `email_templates`, `call_templates`, `reminder_settings`

`services` → 4 rows  
`email_templates` → 6 rows  
`call_templates` → 2 rows (after current `schema.sql`)  

Optional: `app_settings` (after migration `20260523_app_settings.sql`)

## Step 4 — Test authenticated insert (Table Editor)

1. Stay logged into OutreachOS on your machine (valid session)
2. In Supabase **Table Editor** → `businesses` → **Insert row**
3. Set `business_name` = `Test Lead Co`, `status` = `new` → Save

This uses the dashboard (service role), so it always works. To test **RLS from the app**, use the test below after Phase 5, or:

## Step 5 — Test RLS (optional SQL)

Run in SQL Editor **while thinking about policies**:

- Requests with the **anon/publishable** key and **no** user JWT should be blocked on inserts.
- Your logged-in app sends the user JWT — inserts work (Phase 5 will do this from the UI).

Quick check from SQL Editor as postgres (bypasses RLS) — just confirms schema:

```sql
SELECT id, business_name, status FROM public.businesses LIMIT 5;
```

## Step 6 — Test cascade delete

In Table Editor:

1. Note a `business_id` from a test business (or insert one)
2. Insert a `decision_makers` row linked to that `business_id`
3. Delete the **business** row
4. Confirm the **decision_maker** row is gone (CASCADE)

## Test checklist (summary)

- [ ] All **7 tables** in Table Editor
- [ ] **services** = 4 rows, **email_templates** = 6 rows
- [ ] Insert test **business** in Table Editor succeeds
- [ ] Delete business **cascades** to `decision_makers`
- [ ] Dashboard (app) **Database** card shows green verification when logged in

## Key file

- `supabase/schema.sql`

## Troubleshooting

| Error | Fix |
|-------|-----|
| `relation already exists` | Tables already created; skip or drop tables in dev only |
| `policy already exists` | Script drops policies first; re-run full script |
| `permission denied for schema auth` | Normal if not using service role; auth.users FK is valid on Supabase hosted |

## Re-run / reset (dev only)

To wipe and start over (destructive):

```sql
DROP TABLE IF EXISTS public.reminder_settings CASCADE;
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.business_services CASCADE;
DROP TABLE IF EXISTS public.decision_makers CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;
```

Then run `schema.sql` again.
