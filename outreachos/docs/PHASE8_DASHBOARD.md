# Phase 8 — Dashboard + pipeline Kanban

**Status:** ✅ Complete

## Goal

- Today’s follow-ups (overdue / due today / coming up)
- 7-column Kanban by business status (drag-and-drop)
- Quick stats bar
- Quick add lead from dashboard

## Prerequisites

- Phases 1–7 complete
- Businesses in Supabase with varied statuses and follow-up dates

## How to open

**Electron:** `npm run dev` → sidebar → **Dashboard** (home)

## Test checklist

### A. Stats bar

- [ ] **Active leads**, **Overdue follow-ups**, **Due today**, **Pipeline value** show correct counts
- [ ] Overdue count turns accent color when &gt; 0

### B. Today’s actions

- [ ] Business with `next_followup_at` in the past → **Overdue** row
- [ ] Follow-up today → **Due today** row
- [ ] Click a card → opens **Businesses** with that business panel

### C. Pipeline Kanban

- [ ] **7 columns** match statuses: New, Contacted, Interested, Proposal Sent, Closed Won, Closed Lost, Not Interested
- [ ] Each business appears in the correct column
- [ ] **Drag** a card to another column → status updates (persists after refresh)
- [ ] **Click** a card → opens business detail panel

### D. Quick add lead

- [ ] **Add lead** (top right) → slide panel → save → new card appears in **New** column

### E. Realtime (optional)

- [ ] Change status on another window → Kanban updates without refresh

## Key files

- `src/pages/DashboardPage.jsx`
- `src/lib/dashboardStats.js`
- `src/components/dashboard/` — StatsBar, FollowUpCards, PipelineKanban
- `src/lib/businessApi.js` — `patchBusinessStatus`
- `src/stores/businessStore.js` — `patchBusinessStatus` (optimistic)
