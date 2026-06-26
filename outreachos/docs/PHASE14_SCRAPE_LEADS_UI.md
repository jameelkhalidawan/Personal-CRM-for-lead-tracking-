# Phase 14 - Scrape Leads UI

## Goal

Add the first user-facing lead scraping screen:

- Sidebar item: `Scrape Leads`
- Search form: keyword, city, state, max leads
- Live query preview
- Start button with validation and running state
- Progress updates from the Electron scraper engine
- Job history loaded from Supabase
- Live job refresh through Supabase Realtime

## Implementation

### Page

`src/pages/ScrapeLeadsPage.jsx`

- Uses existing `PageHeader`, `Card`, `Input`, `Button`, `EmptyState`, and `TableSkeleton`.
- Shows the search preview as:

```text
Will search: dentist in Dallas, Texas
```

- Blocks empty submissions.
- Validates max leads from 1 to 100.
- Blocks a second scrape while one is already running.
- Shows inline success/error banners because OutreachOS does not currently have a toast system.
- Shows current progress events from Phase 13 as live counter tiles: found, opened, saved, duplicates.
- Shows the latest 50 scrape jobs.

### Store

`src/stores/scrapeJobStore.js`

- Loads scrape jobs.
- Subscribes to `scrape_jobs` realtime updates.
- Starts a scrape through the Phase 13 Electron bridge.
- Listens to scraper progress events.
- Tracks running/error/success/progress state.

### API

`src/lib/scrapeJobApi.js`

- Reads `scrape_jobs` from Supabase.

### Navigation

- `src/config/navigation.js` adds `Scrape Leads`.
- `src/routes/AppRouter.jsx` adds `/scrape-leads`.

## Notes

- `View results` is present in the job table but disabled until Phase 15 creates the Scrape Leads Processing page.
- The UI intentionally allows one scrape at a time. Queuing is not implemented.
- Direct Google Maps scraping can be blocked; failures should appear as failed jobs with an error message.

## Verification Performed

- [x] Production build succeeds with `npm run build`.
- [x] Scraper modules still load without syntax errors.
- [x] Vite config now has an explicit root to avoid Windows absolute-path build issues after the dependency refresh.
- [x] Max leads control added and passed through to the scraper engine.

## Self-Test Checklist

- [ ] Open the app with `npm run dev`.
- [ ] Sidebar shows `Scrape Leads`.
- [ ] Click `Scrape Leads`; page opens without console/runtime errors.
- [ ] Empty fields keep the Start button disabled.
- [ ] Fill only some fields; validation prevents starting.
- [ ] Fill keyword/city/state; query preview updates correctly.
- [ ] Set Max leads to a small number like `5`; scrape should stop after trying about that many listings.
- [ ] Invalid Max leads values like `0`, blank, or above `100` keep Start disabled.
- [ ] Start a valid scrape; button changes to `Scraping...`.
- [ ] Live progress counters update while scraping: Found, Opened, Saved, Duplicates.
- [ ] Starting a second scrape while one is running is blocked.
- [ ] On completion, success banner confirms new leads and duplicates skipped.
- [ ] `scrape_jobs` history table shows the completed job.
- [ ] Supabase `scraped_leads` rows created by the job have `status = fresh`.
- [ ] If Google/network blocks the scrape, the page shows an error and the job is marked `failed`.
