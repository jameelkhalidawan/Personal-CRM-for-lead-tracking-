# Phase 11 — Build, package, distribution

**Status:** ✅ Complete

## Goal

- `npm run electron:build` → Windows NSIS installer
- README / INSTALL guide for additional PCs (shared Supabase, per-machine login)
- Secure handling of env in packaged app (runtime config in userData, not service role)

## What shipped

- **electron/config.cjs** — Supabase URL + anon key in `%APPDATA%/OutreachOS/supabase-config.json`
- **First-run setup** — `SupabaseSetupPage` when no config (packaged or dev without .env)
- **Settings → Supabase connection** — update / test connection on Electron
- **electron-builder** — NSIS installer, desktop shortcut, INSTALL.md bundled
- **Runtime config** — `bootstrapRuntimeConfig()` before auth; dev still uses `.env`

## Build the installer

```bash
cd outreachos
npm install
# optional: .env for bake-in at build time
npm run electron:build
```

Installer: `release/OutreachOS Setup 0.1.0.exe`

## Test checklist

- [ ] `npm run build` succeeds
- [ ] `npm run electron:build` produces `release/*.exe`
- [ ] Install on a clean PC (or VM)
- [ ] First launch shows Supabase setup → save → login works
- [ ] Settings → Supabase connection shows saved URL (key masked)
- [ ] Settings → Database → Check database passes (after migrations)
- [ ] Reminders + auto-start still work in installed app
- [ ] `INSTALL.md` in install folder (`resources/INSTALL.md`)

## Notes

- Add `build/icon.ico` for branded installer icons (optional; build works without)
- Anon key in installer is acceptable; never ship service role key
- HashRouter + `base: './'` required for `loadFile` in production
