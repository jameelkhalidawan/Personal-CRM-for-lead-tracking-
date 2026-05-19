# Phase 2 — Supabase Auth setup

Enable email/password auth before registering in the app.

## Steps

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **Providers** → **Email**.
3. Ensure **Email** is enabled.
4. For a personal desktop app (recommended): turn **OFF** “Confirm email” so sign-up logs you in immediately.
5. Save.

## Optional

- **Authentication** → **Users** — view registered users after sign-up.
- Minimum password length in Supabase should be ≤ 6 if you use short passwords (default is often 6).

## Session storage

Sessions are stored encrypted via Electron `safeStorage` in:

`%APPDATA%\outreachos\` (Windows) — files `secure-auth-storage.json` and `auth-flags.json`.

Logout clears the encrypted session; next launch shows the Login screen.
