# Phase 7 — Activities timeline

**Status:** ✅ Complete

## Goal

- Log activities per business (cold email, call, meeting, note, etc.)
- **Intelligent outreach playbook** — auto-suggested next steps per lead
- Full timeline in business detail + global **Activities** page
- Update `last_contacted_at` (and optional follow-up dates) when logging
- Realtime on `activities` table

## Outreach playbook rules

| If available | Sequence |
|--------------|----------|
| Phone (business or contact) | First call → follow-up call |
| Email (business or contact) | First email → follow-up 1 → follow-up 2 |
| Both | Phone steps first, then email steps |

- **Suggested next** pre-fills activity type, notes, follow-up date, and contact when possible
- **Quick outcomes** (got response, meeting, proposal, closed) pause the cold sequence and update pipeline status

## Prerequisites

- Phases 1–6 complete
- At least one business (contacts optional)

## How to open

**Electron:** `npm run dev` → **Businesses** → business detail → **Log activity**, or sidebar → **Activities**

## Test checklist

### A. Outreach playbook

- [ ] Business with **phone** shows: First call → Follow-up call (checkmarks as you log)
- [ ] Business with **email** shows: First email → 2 follow-ups
- [ ] Business with **both** shows phone steps then email steps
- [ ] **Suggested next** highlights the correct step; **Log [step]** opens pre-filled form
- [ ] **Got response** / **Meeting booked** etc. log in one click and update status

### B. Log activity from business

- [ ] Open a business → **Log suggested** or playbook **Log** → nested panel opens pre-filled
- [ ] Choose type (e.g. **Call**), add notes, optional contact, optional **Next follow-up**
- [ ] **Log activity** → panel closes → entry appears in **Activity timeline**
- [ ] Business **Last contacted** updates (close/reopen panel or check table sort)

### B. Contact + follow-up dates

- [ ] Log activity with a **Contact** selected → that contact’s dates update in Supabase (optional check)
- [ ] Log with **Next follow-up** set → business **Next follow-up** updates in detail panel

### C. View / edit / delete

- [ ] Click timeline entry → view panel with type badge, notes, dates
- [ ] **Edit** → change type or notes → **Save changes**
- [ ] **Delete** → confirm → entry removed from timeline

### D. Global Activities page

- [ ] Sidebar → **Activities** → table lists all logs
- [ ] **Search** filters notes, business name, contact name
- [ ] **Type** filter narrows to one activity type
- [ ] Row click → detail → **Open business** opens Businesses with that panel

### E. Regression

- [ ] Decision makers still work
- [ ] No console errors when stacking activity + business panels

### F. Realtime (optional)

- [ ] With `activities` replication enabled, new log on one window appears on another

## Known limitations (later phases)

- Deleting an activity does **not** roll back `last_contacted_at` already written
- Dashboard Kanban is Phase 8

## Key files

- `src/lib/activityApi.js` — CRUD + touch business/DM dates on create
- `src/stores/activityStore.js`
- `src/components/activities/`
- `src/pages/ActivitiesPage.jsx`
- `src/components/businesses/BusinessDetailPanel.jsx`
