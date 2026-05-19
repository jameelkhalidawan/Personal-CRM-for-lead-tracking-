# OutreachOS — Build Progress

> **Purpose:** Single source of truth for what is done, in progress, and remaining.  
> **For agents:** Read this file at the start of every session before writing code. Update it at the end of every phase.

**Last updated:** 2026-05-19  
**Current phase:** 1 complete → waiting for **GO** to start Phase 2  
**App version:** 0.1.0

---

## Quick status

| Phase | Name | Status |
|-------|------|--------|
| 1 | Project scaffold + Supabase setup | ✅ **Complete** |
| 2 | Auth + session persistence | ⬜ Not started |
| 3 | Database schema (SQL + RLS + seeds) | ⬜ Not started |
| 4 | UI design system + layout shell | ⬜ Not started |
| 5 | Business management | ⬜ Not started |
| 6 | Decision makers | ⬜ Not started |
| 7 | Activities timeline | ⬜ Not started |
| 8 | Dashboard + pipeline Kanban | ⬜ Not started |
| 9 | Reminder + notification system | ⬜ Not started |
| 10 | Email templates + settings + auto-start | ⬜ Not started |
| 11 | Build, package, distribution | ⬜ Not started |

**In progress right now:** Nothing (blocked on user **GO** for Phase 2).

---

## Project config

| Item | Value |
|------|--------|
| **Workspace** | `d:\Conscious Automation\CRM\outreachos` |
| **Stack** | Electron + React 19 + Vite 8 + Tailwind v3 + Zustand + Supabase |
| **Supabase project** | `kkjbkbwongnwgtkviepa.supabase.co` |
| **Env file** | `.env` (gitignored) — copy from `.env.example` |
| **Dev command** | `npm run dev` |
| **Build command** | `npm run build` |

### Supabase credentials (do not commit secrets)

- `VITE_SUPABASE_URL` — set in local `.env`
- `VITE_SUPABASE_ANON_KEY` — publishable key (`sb_publishable_…`) — set in local `.env`
- **Verified:** Live HTTP check to `/auth/v1/health` succeeds (Auth v2.189.0)

---

## Phase 1 — Complete ✅

### Delivered

- [x] Vite + React app in `outreachos/`
- [x] Electron main + preload (`electron/main.cjs`, `electron/preload.cjs`)
- [x] Tailwind v3 with OutreachOS color palette (`tailwind.config.js`)
- [x] Inter font via Google Fonts (`src/index.css`)
- [x] Supabase client + **live** connection test (`src/lib/supabase.js`)
- [x] Phase 1 placeholder UI (`src/App.jsx`) — Hello OutreachOS + connection status
- [x] `.env.example` + `.env` in `.gitignore`
- [x] `npm run dev` — Vite + Electron concurrently
- [x] `npm run build` — production React build works

### Phase 1 manual tests

| Test | Status |
|------|--------|
| `npm run dev` opens Electron window | User confirmed |
| Shows "Hello OutreachOS" | User confirmed |
| Purple Tailwind accent bar visible | User confirmed |
| Supabase live connection (not just .env check) | User confirmed — green message with Auth version |
| `.env` not committed | Confirm with `git status` |

### Phase 1 key files

```
electron/main.cjs
electron/preload.cjs
src/App.jsx
src/lib/supabase.js
src/index.css
src/main.jsx
src/global.d.ts
tailwind.config.js
postcss.config.js
vite.config.js
package.json
.env.example
.gitignore
```

### Phase 1 notes / fixes applied

- Supabase client is **lazy** (app does not crash if `.env` missing).
- Connection test uses real `fetch` to `{url}/auth/v1/health` with API key (not `getSession()` only).
- Publishable keys (`sb_publishable_…`) work; REST `/rest/v1/` root rejects publishable keys — health endpoint used instead.

---

## Phase 2 — Auth + session persistence ⬜

**Goal:** Register once, auto-login on restart, logout clears session.

### Planned work

- [ ] Enable email/password in Supabase Auth dashboard
- [ ] Register screen (name, email, password, confirm)
- [ ] Login screen
- [ ] Store session in Electron `safeStorage`
- [ ] App start: restore session → Dashboard if valid
- [ ] Logout: clear storage → Login on next start
- [ ] Zustand auth store
- [ ] Inline error messages (no alert boxes)

### Blocked by

- User must reply **GO** to begin Phase 2.

---

## Phases 3–11 — Not started ⬜

See the master build plan in the initial OutreachOS agent prompt for full specs per phase.

| Phase | One-line goal |
|-------|----------------|
| 3 | All 7 tables, RLS, indexes, seed services + email templates |
| 4 | Sidebar layout, routes, Button/Input/Card/SlidePanel/Modal/etc. |
| 5 | Businesses CRUD, search, filter, realtime |
| 6 | Decision makers per business + global list |
| 7 | Activity log + timeline + realtime |
| 8 | Dashboard: today’s actions, Kanban, stats |
| 9 | Electron notification scheduler + reminder_settings |
| 10 | Email templates page, settings, auto-start, light mode |
| 11 | electron-builder installer + README |

---

## Files not created yet (by design)

```
src/stores/          — Zustand stores (Phase 2+)
src/components/      — UI library (Phase 4+)
src/pages/           — Dashboard, Businesses, etc. (Phase 4+)
supabase/schema.sql  — optional; SQL run in Supabase dashboard (Phase 3)
```

---

## Known issues / TODOs

- [ ] User to confirm `git status` does not list `.env`
- [ ] `src/App.css` — leftover from Vite template; unused (safe to delete in Phase 4 cleanup)
- [ ] shadcn/ui not installed until Phase 4
- [ ] No database tables in Supabase yet (Phase 3)

---

## Agent instructions

1. Read this file first in every new chat.
2. Print context header: `[OutreachOS | Phase N/11 | Last: …]`
3. Only implement the **current** phase; stop after phase completes.
4. End each phase with: test checklist + update this file + ask user to reply **GO**.
5. Never commit `.env` or secret keys.

---

## CONTEXT SNAPSHOT (paste into new chats)

```
=== OUTREACHOS CONTEXT SNAPSHOT ===
Project: OutreachOS AI Sales CRM Desktop App
Read first: outreachos/PROGRESS.md
Location: d:\Conscious Automation\CRM\outreachos
Tech stack: Electron + React 19 + Vite 8 + Tailwind v3 + Zustand + Supabase
Supabase: kkjbkbwongnwgtkviepa.supabase.co (publishable key in .env)
Current phase completed: 1
In progress: none — waiting for GO on Phase 2
Next phase: 2 — Auth + safeStorage session persistence
Last thing done: PROGRESS.md created; Phase 1 scaffold + live Supabase connection test
===================================
```
