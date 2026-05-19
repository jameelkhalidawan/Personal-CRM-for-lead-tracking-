# Phase 5 — Business management

**Status:** ✅ Complete (includes black-screen bugfix for closed detail panel)

## Goal

Full CRUD for businesses: list, search, filter, sort, detail panel, services linkage, realtime.

## Prerequisites

- Phases 1–4 complete
- Phase 3 SQL applied (`supabase/schema.sql`)
- Logged into the app

## How to open

**Recommended:** Electron via `npm run dev` → sidebar → **Businesses**

**Browser:** `http://localhost:5173/#/businesses` — only works if you are **logged in** in that browser (session in localStorage). If not logged in, you see Login (dark screen), not Businesses.

## Test checklist (do in order)

### A. Page loads (regression — black screen fix)

- [ ] Go to **Businesses** — page shows header “Businesses”, **Add business** button, search bar, filters (not a blank black screen)
- [ ] DevTools Console (F12) has **no** `Cannot read properties of null (reading 'business')`

### B. Empty state

- [ ] With no businesses: message **“No businesses yet”** + **Add business** action

### C. Add business

- [ ] Click **Add business** → slide panel from right
- [ ] Fill **Business name** (required), niche, email, status, priority
- [ ] Check one or more **Interested services** (AI Voice Agent, etc.)
- [ ] Set optional dates (Last contacted / Next follow-up)
- [ ] **Add business** → panel closes → row appears in table
- [ ] Service pills show on the row

### D. Search & filters

- [ ] **Search** by business name → list filters as you type (debounced ~300ms)
- [ ] **Status** filter → e.g. “Interested” only shows matching rows
- [ ] **Priority** filter → e.g. “High” only
- [ ] **Service** pill filter → toggle “Chatbot” → only businesses with that service
- [ ] **Sort by** → change to “Next Follow-up” or “Estimated Value” → order changes
- [ ] Clear filters → all matching businesses return

### E. Detail panel (view)

- [ ] Click a **row** → panel opens with correct name, status/priority badges
- [ ] Fields match what you saved (email, niche, notes, etc.)
- [ ] **Decision makers** section shows “None yet” or existing DMs
- [ ] **Recent activities** shows “None yet” or last 3

### F. Edit

- [ ] **Edit** → form with current values
- [ ] Change name or status → **Save changes** → panel closes or returns to view; **table updates**
- [ ] **Cancel** with unsaved changes → confirm discard dialog

### G. Delete

- [ ] **Delete** → confirm modal → **Delete** → business removed from list

### H. Realtime (optional, two machines or two windows)

- [ ] Enable replication: [PHASE5_REALTIME.md](./PHASE5_REALTIME.md)
- [ ] Edit a business on computer A → list updates on computer B without refresh

## Known limitations (later phases)

- **Log activity** button disabled until Phase 7
- Full dashboard Kanban is Phase 8

## Key files

- `src/pages/BusinessesPage.jsx`
- `src/stores/businessStore.js`
- `src/lib/businessApi.js`
- `src/components/businesses/*`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Black page on Businesses | Pull latest code (detail panel null fix). Hard refresh Ctrl+Shift+R |
| Login instead of Businesses in browser | Sign in in browser or use Electron app |
| “relation businesses does not exist” | Run `supabase/schema.sql` in Supabase SQL Editor |
| RLS / permission errors | Logged in? RLS requires authenticated user |
