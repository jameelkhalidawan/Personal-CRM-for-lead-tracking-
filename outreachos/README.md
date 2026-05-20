# OutreachOS

AI Sales CRM desktop app (Electron + React + Supabase) for Conscious Automation.

## Documentation

- [PHASES.md](./PHASES.md) — master build plan (11 phases)
- [PROGRESS.md](./PROGRESS.md) — live status (done / next)
- [docs/README.md](./docs/README.md) — per-phase setup + test checklists
- [docs/INSTALL.md](./docs/INSTALL.md) — **Windows install & distribution**

## Development

```bash
npm install
cp .env.example .env   # Supabase URL + anon key
# Run supabase/schema.sql + migrations in Supabase SQL Editor
npm run dev
```

Opens Vite on port 5173 and Electron with hot reload.

## Production build (Windows installer)

```bash
npm run electron:build
```

Output: `release/OutreachOS Setup *.exe`

- Packaged apps can use baked-in env from build time **or** first-run Supabase setup (stored per machine).
- See [docs/INSTALL.md](./docs/INSTALL.md) for team rollout.

## Features (high level)

- Businesses, decision makers, per-contact leads
- Parallel call + email outreach playbook
- Work queue, dashboard metrics, analytics
- Email + call script templates
- Desktop reminders (Electron notifications)
