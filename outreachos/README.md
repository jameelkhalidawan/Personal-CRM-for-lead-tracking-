# OutreachOS

AI Sales CRM desktop app (Electron + React + Supabase) for Conscious Automation.

## New developer? Start here

**[docs/DEVELOPER_SETUP.md](./docs/DEVELOPER_SETUP.md)** — full guide: Supabase project, database, auth, local dev, Windows installer, team rollout, architecture, and troubleshooting.

**[docs/INSTALL.md](./docs/INSTALL.md)** — shorter guide for IT / team installing the `.exe`.

## Quick start (already have Supabase)

```bash
npm install
cp .env.example .env          # add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
# Run supabase/schema.sql + migrations/20260523_app_settings.sql in SQL Editor
# Set admin password — see DEVELOPER_SETUP.md §5
npm run dev
```

Opens Vite on port 5173 and Electron with hot reload.

## Production build (Windows installer)

```bash
npm run electron:build
```

Output: `release/OutreachOS Setup 0.1.0.exe`

If the build fails because `app.asar` is locked, close OutreachOS and run `npm run electron:build:fresh` (output in `release-build/`).

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/DEVELOPER_SETUP.md](./docs/DEVELOPER_SETUP.md) | **Complete setup for new developers** |
| [docs/INSTALL.md](./docs/INSTALL.md) | Windows install & distribution |
| [docs/README.md](./docs/README.md) | Per-phase setup + test checklists |
| [PHASES.md](./PHASES.md) | Master build plan (11 phases) |
| [PROGRESS.md](./PROGRESS.md) | Feature completion status |

## Stack

- **Electron** — desktop shell, notifications, auto-launch, encrypted session storage
- **React + Vite + Tailwind** — UI
- **Supabase** — Postgres, Auth, RLS
- **Zustand** — client state

## Features (high level)

- Businesses, decision makers, per-contact leads
- Parallel call + email outreach playbook
- Work queue, dashboard metrics, analytics
- Email + call script templates
- Desktop reminders (Electron notifications)
- Admin-protected database connection settings (`app_settings`)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + Electron development |
| `npm run build` | Production frontend build |
| `npm run electron:build` | Windows NSIS installer → `release/` |
| `npm run electron:build:fresh` | Installer → `release-build/` (avoids locked `release/`) |
| `npm run lint` | ESLint |
