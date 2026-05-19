# OutreachOS — Build Progress

> **Purpose:** Single source of truth for what is done, in progress, and remaining.  
> **For agents:** Read this file at the start of every session before writing code. Update it at the end of every phase.

**Last updated:** 2026-05-19  
**Current phase:** 3 — SQL ready; **you must run `schema.sql` in Supabase** → then verify  
**App version:** 0.1.0

---

## Quick status

| Phase | Name | Status |
|-------|------|--------|
| 1 | Project scaffold + Supabase setup | ✅ **Complete** |
| 2 | Auth + session persistence | ✅ **Complete** (user verified login) |
| 3 | Database schema (SQL + RLS + seeds) | 🟡 **SQL delivered** — run in Supabase dashboard |
| 4 | UI design system + layout shell | ⬜ Not started |
| 5 | Business management | ⬜ Not started |
| 6 | Decision makers | ⬜ Not started |
| 7 | Activities timeline | ⬜ Not started |
| 8 | Dashboard + pipeline Kanban | ⬜ Not started |
| 9 | Reminder + notification system | ⬜ Not started |
| 10 | Email templates + settings + auto-start | ⬜ Not started |
| 11 | Build, package, distribution | ⬜ Not started |

**In progress:** Phase 3 — waiting for you to run `supabase/schema.sql` and confirm Dashboard shows green database check.

---

## Project config

| Item | Value |
|------|--------|
| **Workspace** | `d:\Conscious Automation\CRM\outreachos` |
| **Supabase project** | `kkjbkbwongnwgtkviepa.supabase.co` |
| **Dev command** | `npm run dev` |

---

## Phase 3 — Database schema 🟡

### Delivered (in repo)

- [x] Full SQL: `supabase/schema.sql` (7 tables, FKs, CHECKs, indexes, RLS, seeds)
- [x] Setup guide: `docs/PHASE3_DATABASE.md`
- [x] RLS notes: `supabase/verify-rls.md`
- [x] App-side verify: `src/lib/dbCheck.js` + Dashboard “Database (Phase 3)” panel

### Tables

| Table | Purpose |
|-------|---------|
| `businesses` | Leads / companies |
| `decision_makers` | Contacts per business |
| `services` | Offerings (4 seeded) |
| `business_services` | Business ↔ service junction |
| `activities` | Timeline / follow-ups |
| `email_templates` | Shared templates (6 seeded) |
| `reminder_settings` | Per-user notification prefs |

### Your action required

1. Supabase Dashboard → **SQL Editor**
2. Paste & run entire `supabase/schema.sql`
3. `npm run dev` → Dashboard should show **services: 4 rows**, **email_templates: 6 rows**

### Phase 3 manual tests

| Test | Status |
|------|--------|
| All 7 tables in Table Editor | ⬜ User |
| `services` has 4 rows | ⬜ User |
| `email_templates` has 6 rows | ⬜ User |
| Insert test business in Table Editor | ⬜ User |
| Insert decision_maker → delete business → DM cascades | ⬜ User |
| Dashboard green “Database schema verified” | ⬜ User |
| Unauthenticated API insert blocked (RLS) | ⬜ Optional until Phase 5 |

---

## Phase 1–2 — Complete ✅

See git history / earlier sections. Auth + Electron scaffold working.

---

## Phases 4–11 — Not started ⬜

| Phase | Goal |
|-------|------|
| 4 | Sidebar, routes, shared UI components |
| 5 | Businesses CRUD + realtime |
| 6 | Decision makers |
| 7 | Activities timeline |
| 8 | Real dashboard + Kanban |
| 9 | Desktop notifications |
| 10 | Templates + settings + auto-start |
| 11 | Installer + README |

---

## Known issues / TODOs

- [ ] Run `supabase/schema.sql` in Supabase (required to complete Phase 3)
- [ ] Mark Phase 2 tests complete in checklist if not already

---

## CONTEXT SNAPSHOT

```
=== OUTREACHOS CONTEXT SNAPSHOT ===
Read first: outreachos/PROGRESS.md
Current phase: 3 (SQL in repo — user runs schema.sql in Supabase)
Next after Phase 3 verified: Phase 4 — UI shell + sidebar
Files added: supabase/schema.sql, docs/PHASE3_DATABASE.md, src/lib/dbCheck.js
Last thing done: Full DB schema + seeds + Dashboard table verification UI
===================================
```
