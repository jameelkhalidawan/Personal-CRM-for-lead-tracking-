# Phase 9 — Reminder + notification system

**Status:** ✅ Complete

## Goal

- Background scheduler while app is running
- Desktop notifications for upcoming and overdue follow-ups
- Per-user `reminder_settings` in Supabase
- Click notification → open business in app

## Prerequisites

- Phases 1–8 complete
- Run app via **Electron** (`npm run dev`) for native Windows notifications
- Businesses with `next_followup_at` set

## How it works

| Setting | Effect |
|---------|--------|
| Enable desktop reminders | Master on/off |
| Check frequency | How often to scan (15 / 30 / 60 min) |
| Advance notice | Notify before follow-up (30 / 60 / 120 min) |
| Overdue alerts | Notify when follow-up date has passed |

Each business + follow-up time is notified **once** (deduped in local storage until follow-up changes or you run **Check now**).

## Test checklist

### A. Settings

- [ ] **Settings** → **Follow-up reminders** card loads
- [ ] Toggle options, change intervals → **Save reminders** → refresh app → settings persist
- [ ] **Test notification** → Windows toast appears
- [ ] Click test notification → app focuses (business not required)

### B. Upcoming follow-up

- [ ] Set a business `next_followup_at` to **~45 minutes from now**
- [ ] Settings: advance notice = **1 hour**, reminders enabled
- [ ] Click **Check now** → notification for that business
- [ ] Click notification → **Businesses** opens with that business panel

### C. Overdue

- [ ] Set `next_followup_at` in the **past**
- [ ] **Check now** (clears dedupe) → **Overdue: [name]** notification
- [ ] Overdue alerts disabled → no overdue notification

### D. Scheduler

- [ ] Leave app open; after check interval, new due follow-ups trigger without manual check
- [ ] Disable reminders → no new notifications

### E. Electron vs browser

- [ ] `npm run dev` (Electron): native notifications
- [ ] Browser-only: may need to allow notification permission in the site settings

## Key files

- `electron/main.cjs` — native `Notification` + click → navigate
- `electron/preload.cjs` — `reminders.notify`, `onOpenBusiness`
- `src/hooks/useReminderScheduler.js`
- `src/lib/reminderChecker.js`, `src/lib/reminderNotifier.js`
- `src/stores/reminderStore.js`
- `src/components/settings/ReminderSettingsCard.jsx`

## Known limitations

- Reminders run only while the app is open (full background service is Phase 10+ auto-start)
- Re-notify same follow-up only after **Check now** (clears dedupe) or if follow-up date changes
