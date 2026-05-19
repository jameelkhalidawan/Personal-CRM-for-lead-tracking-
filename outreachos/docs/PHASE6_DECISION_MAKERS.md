# Phase 6 — Decision makers

**Status:** ✅ Complete

## Goal

Multiple contacts per business with full CRUD, preferred contact method, social fields, embedded in business detail, and a global **Decision Makers** page.

## Prerequisites

- Phases 1–5 complete
- Phase 3 SQL applied (`supabase/schema.sql`)
- At least one business in the database

## How to open

**Electron:** `npm run dev` → sidebar → **Decision Makers** or **Businesses** → row → detail panel

**Browser:** `http://localhost:5173/#/decision-makers` (must be logged in)

## Test checklist

### A. Business detail — add contact

- [ ] Open **Businesses** → click a row → detail panel
- [ ] **Add decision maker** → nested panel opens (stacked on the right, higher z-index)
- [ ] Fill **Name** (required), role, email, **Preferred contact** (e.g. LinkedIn)
- [ ] **Add contact** → nested panel closes → contact appears in list with preferred icon
- [ ] Full fields saved: open contact again and verify social URLs, notes, dates

### B. Business detail — view / edit / delete

- [ ] Click a contact in the list → view panel with all fields
- [ ] **Edit** → change name or preferred contact → **Save changes** → list updates
- [ ] **Delete** → confirm modal → contact removed from list
- [ ] **Cancel** with unsaved edits → discard confirm dialog

### C. Global Decision Makers page

- [ ] Sidebar → **Decision Makers** → table loads (name, business, role, email, preferred, next follow-up)
- [ ] **Search** filters by name, role, email, or business name
- [ ] Click a row → detail panel → **Open business** navigates to Businesses and opens that business panel
- [ ] Edit and delete work from this page too

### D. Regression

- [ ] Businesses page still loads (no black screen)
- [ ] Business edit/delete still work
- [ ] Console has no errors when opening/closing nested panels

### E. Realtime (optional)

- [ ] With replication enabled on `decision_makers`, add a contact on one window → list updates on another

## Known limitations (later phases)

- **Log activity** on business detail remains Phase 7
- WhatsApp is a preferred-contact icon only (no separate phone field for WhatsApp)

## Key files

- `src/lib/decisionMakerApi.js`
- `src/stores/decisionMakerStore.js`
- `src/constants/decisionMaker.js`
- `src/components/decisionMakers/` — form, panel, table, icons
- `src/pages/DecisionMakersPage.jsx`
- `src/components/businesses/BusinessDetailPanel.jsx` — embedded list + add
