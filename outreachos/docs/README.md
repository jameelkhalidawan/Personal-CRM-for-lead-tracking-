# OutreachOS — Documentation

## Start here

| Document | Who it's for |
|----------|----------------|
| **[DEVELOPER_SETUP.md](./DEVELOPER_SETUP.md)** | **New developers** — full company setup (Supabase, DB, auth, dev, build, deploy) |
| **[INSTALL.md](./INSTALL.md)** | **IT / team** — install the Windows `.exe`, migrations, admin password |
| **[../README.md](../README.md)** | Repo overview and quick commands |

## Phase guides (implementation + test checklists)

Built in 11 phases. Use these when working on or verifying a specific area.

| Doc | Phase | Topic |
|-----|-------|--------|
| [PHASE1_SCAFFOLD.md](./PHASE1_SCAFFOLD.md) | 1 | Scaffold + tooling |
| [PHASE2_SUPABASE_AUTH.md](./PHASE2_SUPABASE_AUTH.md) | 2 | Auth + session |
| [PHASE3_DATABASE.md](./PHASE3_DATABASE.md) | 3 | Database SQL |
| [PHASE4_UI_SHELL.md](./PHASE4_UI_SHELL.md) | 4 | UI shell + components |
| [PHASE5_BUSINESSES.md](./PHASE5_BUSINESSES.md) | 5 | Businesses CRUD |
| [PHASE5_REALTIME.md](./PHASE5_REALTIME.md) | 5b | Realtime (optional) |
| [PHASE6_DECISION_MAKERS.md](./PHASE6_DECISION_MAKERS.md) | 6 | Decision makers |
| [PHASE7_ACTIVITIES.md](./PHASE7_ACTIVITIES.md) | 7 | Activities |
| [PHASE8_DASHBOARD.md](./PHASE8_DASHBOARD.md) | 8 | Dashboard / Kanban |
| [PHASE9_REMINDERS.md](./PHASE9_REMINDERS.md) | 9 | Notifications |
| [PHASE10_SETTINGS.md](./PHASE10_SETTINGS.md) | 10 | Templates + settings |
| [PHASE11_DISTRIBUTION.md](./PHASE11_DISTRIBUTION.md) | 11 | Installer + distribution |

**Also:** [../PHASES.md](../PHASES.md) (master plan) · [../PROGRESS.md](../PROGRESS.md) (status)

## Database files

| Path | When to run |
|------|-------------|
| `../supabase/schema.sql` | New Supabase project (once) |
| `../supabase/migrations/*.sql` | Upgrades or if schema predates a feature |
| `../supabase/verify-rls.md` | Optional RLS verification notes |

**Required for admin connection UI:** `migrations/20260523_app_settings.sql` + admin password SQL (see DEVELOPER_SETUP.md §5).
