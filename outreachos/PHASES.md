# OutreachOS — Master Phase Plan

> **Source of truth for scope:** This file mirrors the original build prompt.  
> **Day-to-day status:** See [PROGRESS.md](./PROGRESS.md) (what’s done, in progress, next).  
> **Per-phase setup + tests:** See [docs/README.md](./docs/README.md).

**App:** OutreachOS — AI Sales CRM (Electron + React + Supabase)  
**Rule:** One phase at a time. Agent stops after each phase; you reply **GO** to continue.

---

## Tech stack (fixed)

| Layer | Technology |
|-------|------------|
| Desktop | Electron |
| Frontend | React 18+ / Vite |
| Styling | Tailwind CSS v3 + custom UI components |
| State | Zustand |
| Backend | Supabase (free tier) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Notifications | Electron Notification API |
| Auto-start | electron-auto-launch |
| Packaging | electron-builder |

---

## Phase overview

| Phase | Name | Doc | Status |
|-------|------|-----|--------|
| 1 | Project scaffold + Supabase setup | [docs/PHASE1_SCAFFOLD.md](./docs/PHASE1_SCAFFOLD.md) | ✅ |
| 2 | Auth + session persistence | [docs/PHASE2_SUPABASE_AUTH.md](./docs/PHASE2_SUPABASE_AUTH.md) | ✅ |
| 3 | Database schema (SQL + RLS + seeds) | [docs/PHASE3_DATABASE.md](./docs/PHASE3_DATABASE.md) | ✅ |
| 4 | UI design system + layout shell | [docs/PHASE4_UI_SHELL.md](./docs/PHASE4_UI_SHELL.md) | ✅ |
| 5 | Business management | [docs/PHASE5_BUSINESSES.md](./docs/PHASE5_BUSINESSES.md) | ✅ |
| 6 | Decision makers | [docs/PHASE6_DECISION_MAKERS.md](./docs/PHASE6_DECISION_MAKERS.md) | ⬜ |
| 7 | Activities timeline | [docs/PHASE7_ACTIVITIES.md](./docs/PHASE7_ACTIVITIES.md) | ✅ |
| 8 | Dashboard + pipeline Kanban | [docs/PHASE8_DASHBOARD.md](./docs/PHASE8_DASHBOARD.md) | ✅ |
| 9 | Reminders + notifications | [docs/PHASE9_REMINDERS.md](./docs/PHASE9_REMINDERS.md) | ⬜ |
| 10 | Email templates + settings + auto-start | [docs/PHASE10_SETTINGS.md](./docs/PHASE10_SETTINGS.md) | ⬜ |
| 11 | Build, package, distribution | [docs/PHASE11_DISTRIBUTION.md](./docs/PHASE11_DISTRIBUTION.md) | ⬜ |

---

## Phase 1 — Project scaffold + Supabase setup

**Goal:** Running Electron + React + Tailwind app connected to Supabase.

- Vite + React + Electron dev workflow
- Tailwind design tokens
- `.env` for Supabase URL + publishable key
- Live connection test

---

## Phase 2 — Auth + session persistence

**Goal:** Register once, auto-login on restart; logout clears session.

- Register / Login screens
- Zustand auth store
- Session in Electron `safeStorage` (encrypted)
- Inline errors (no alert boxes)

---

## Phase 3 — Database schema

**Goal:** All 7 tables, RLS, indexes, seed data.

- Tables: `businesses`, `decision_makers`, `services`, `business_services`, `activities`, `email_templates`, `reminder_settings`
- RLS: authenticated full access
- Seeds: 4 services, 6 email template shells

---

## Phase 4 — UI design system + layout shell

**Goal:** Premium app shell with sidebar and reusable components.

- Fixed sidebar (240px), 6 routes
- Components: Button, Input, Textarea, Select, Badge, Card, SlidePanel, Modal, EmptyState, SearchInput, LoadingSpinner
- Placeholder pages per nav item

---

## Phase 5 — Business management

**Goal:** Full CRUD, search, filter, sort, detail panel, realtime.

- Business list table
- Add / edit / delete (confirm modal)
- Service multi-select via `business_services`
- Realtime on `businesses` + `business_services`

---

## Phase 6 — Decision makers

**Goal:** Multiple contacts per business; global list page.

- CRUD embedded in business detail + Decision Makers nav page
- Preferred contact method + social fields

---

## Phase 7 — Activities timeline

**Goal:** Log interactions; update `last_contacted_at`; realtime.

- Activity types (email, call, meeting, etc.)
- Per-business timeline + global Activities page

---

## Phase 8 — Dashboard + pipeline

**Goal:** Today’s actions, Kanban by status, quick stats.

- 7-column drag-and-drop pipeline
- Follow-up cards, quick add lead

---

## Phase 9 — Reminder + notification system

**Goal:** Desktop notifications for due follow-ups (universal + per-user settings).

- Electron scheduler
- `reminder_settings` table

---

## Phase 10 — Email templates + settings + auto-start

**Goal:** Template library, full settings page, light mode, auto-start on boot.

- Email templates CRUD
- Appearance, reminders, auto-start toggles

---

## Phase 11 — Build, package, distribution

**Goal:** Windows installer + README for multi-machine setup.

- `electron-builder` NSIS
- Secure env handling in packaged app

---

## Agent workflow (every phase)

1. Read `PROGRESS.md` + relevant `docs/PHASE{N}_*.md`
2. Print header: `[OutreachOS | Phase N/11 | Last: …]`
3. Implement **only** that phase
4. Update `PROGRESS.md` + phase doc test checklist
5. Stop with: **PHASE N COMPLETE** + test checklist + **CONTEXT SNAPSHOT**

---

## CONTEXT SNAPSHOT (paste into new chats)

```
=== OUTREACHOS CONTEXT SNAPSHOT ===
Read: outreachos/PHASES.md + outreachos/PROGRESS.md
Location: d:\Conscious Automation\CRM\outreachos
Current phase completed: 5
Next phase: 6 — Decision makers
===================================
```
