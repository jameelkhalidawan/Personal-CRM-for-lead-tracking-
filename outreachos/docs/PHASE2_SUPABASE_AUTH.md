# Phase 2 — Auth + session persistence

**Status:** ✅ Complete

## Goal

Register once, auto-login on restart, logout clears session (Electron `safeStorage`).

## Supabase setup (one-time)

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

## Test checklist

- [ ] **Register** new email → lands on **Dashboard**
- [ ] **Close app completely** → reopen → **Dashboard** (no login)
- [ ] **Log out** (Settings) → reopen → **Login** screen
- [ ] **Wrong password** → red inline error (no popup alert)
- [ ] **Duplicate email** on register → inline error
- [ ] Session survives **PC restart** (while still logged in)

## Key files

- `src/stores/authStore.js`
- `src/pages/Login.jsx`, `src/pages/Register.jsx`
- `electron/authStorage.cjs`
- `src/lib/authStorage.js`
