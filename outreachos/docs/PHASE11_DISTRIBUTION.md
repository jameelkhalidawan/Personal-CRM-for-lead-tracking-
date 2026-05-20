# Phase 11 — Build, package, distribution

**Status:** ✅ Complete

## Goal

- `npm run electron:build` → Windows NSIS installer
- Team rollout with shared Supabase, per-user login
- Secure env handling (baked bootstrap key + optional DB overrides behind admin password)

## What shipped

- **electron-builder** — NSIS installer, desktop shortcut, `INSTALL.md` bundled
- **Runtime config** — `bootstrapRuntimeConfig()` uses build-time `.env`; optional overrides from `app_settings` after login
- **Settings → Database connection (admin)** — password verified via Supabase RPC; URL/key stored in DB, not local JSON
- **Settings → Startup** — Windows auto-launch via `electron-auto-launch` + `user-preferences.json` in `%APPDATA%/OutreachOS/`
- **Encrypted session** — `electron/authStorage.cjs` + `safeStorage`
- **HashRouter** + Vite `base: './'` for production `loadFile`

Legacy (no longer used for team installs): `electron/config.cjs` local `supabase-config.json`, `SupabaseSetupPage` first-run flow.

## Build the installer

See **[DEVELOPER_SETUP.md](./DEVELOPER_SETUP.md)** §9.

```bash
cd outreachos
npm install
# .env required for baked-in Supabase credentials
npm run electron:build
```

Installer: `release/OutreachOS Setup 0.1.0.exe`

Fallback if `release/` is locked: `npm run electron:build:fresh` → `release-build/`.

## Test checklist

- [ ] `npm run build` succeeds
- [ ] `npm run electron:build` produces `release/*.exe`
- [ ] Install on a clean PC (or VM)
- [ ] Sign in works (installer built with `.env`)
- [ ] Settings → Database → Check database passes (after migrations)
- [ ] Settings → Database connection (admin) unlocks with admin password
- [ ] Settings → Startup enables Windows auto-launch
- [ ] Reminders fire in installed app
- [ ] `resources/INSTALL.md` present in install folder

## Notes

- Add `build/icon.ico` for branded installer icons (optional)
- Anon key in installer is expected for client apps; never ship **service role**
- Share only the `.exe` to the team, not `win-unpacked/`
