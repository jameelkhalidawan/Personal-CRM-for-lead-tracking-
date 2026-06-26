# OutreachOS Add-on Progress - Lead Scraping Pipeline

> Durable context file for Phases 12-17. Update this after every add-on phase so future agents can recover the exact state quickly.

**Project:** OutreachOS AI Sales CRM Desktop App  
**Add-on:** Lead Scraping Pipeline  
**Last updated:** 2026-06-26  
**Current phase:** Phase 17 complete  
**Current work:** Lead Scraping Pipeline add-on is complete locally; waiting for final user end-to-end verification.  
**Workflow rule:** Complete one phase, stop with a self-test checklist, wait for user to reply `GO`, then continue.

---

## Pipeline Logic

```text
Scraped lead -> Fresh
Fresh -> Move to next -> Follow-up 1
Follow-up 1 -> Move to next -> Follow-up 2
Follow-up 2 -> Move to next -> Discard
Fresh / Follow-up 1 / Follow-up 2 -> Captured -> Captured / Processing
Captured / Processing -> Mark Done -> Captured / Done
```

- A lead only lives in one status at a time.
- Notes accumulate across the lead's whole lifecycle.
- Notes are required when moving to the next stage, capturing, or marking done.
- Discard is terminal/read-only for stage transitions, but plain notes can still be added.
- Captured Done is terminal, but plain notes can still be added.

---

## Phase Status

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 12 | Database schema | Complete - awaiting user test | Migration created for `scrape_jobs`, `scraped_leads`, and `scraped_lead_notes`; test guide added. |
| 13 | Scraper engine | Complete - awaiting user review | Puppeteer worker, Electron IPC bridge, Supabase job/lead writes, progress events. |
| 14 | Scrape Leads UI | Complete - awaiting user test | Sidebar/page, search form with max leads, live progress counters, job history, realtime job refresh. |
| 15 | Scrape Leads Processing UI | Complete - awaiting user test | Fresh/Follow-up/Discard pipeline with required notes, call script reader, note history, capture action, realtime refresh. |
| 16 | Captured Leads UI | Complete - awaiting user test | Processing/Done tabs, Mark Done with required note, full note history, plain notes in Done. |
| 17 | End-to-end integration + polish | Complete - awaiting final user verification | Sidebar grouping, workflow cross-links, final docs/checklist, build verification. |

---

## Files Created / Modified So Far

- `ADDON_PROGRESS.md` - durable add-on context and phase tracker.
- `docs/PHASE12_LEAD_SCRAPING_SCHEMA.md` - Phase 12 setup and self-test guide.
- `docs/PHASE13_SCRAPER_ENGINE.md` - Phase 13 implementation and self-test guide.
- `docs/PHASE14_SCRAPE_LEADS_UI.md` - Phase 14 implementation and self-test guide.
- `docs/PHASE15_SCRAPE_LEADS_PROCESSING.md` - Phase 15 implementation and self-test guide.
- `docs/PHASE16_CAPTURED_LEADS.md` - Phase 16 implementation and self-test guide.
- `docs/PHASE17_LEAD_SCRAPING_INTEGRATION.md` - Phase 17 final integration and test guide.
- `electron/googleMapsScraper.cjs` - Puppeteer Google Maps scraping engine.
- `electron/googleMapsScraper.cjs` - added Chrome executable fallback for Puppeteer browser cache/system Chrome.
- `electron/scrapeWorker.cjs` - background worker that creates jobs, inserts deduped leads, and reports progress.
- `src/lib/scrapeLeadApi.js` - renderer helper for starting scrapes and subscribing to progress.
- `src/lib/scrapeJobApi.js` - Supabase reads for scrape job history.
- `src/lib/scrapedLeadApi.js` - Supabase API helpers for scraped leads, notes, and transitions.
- `src/lib/scrapedLeadApi.js` - added captured status constants.
- `src/stores/scrapeJobStore.js` - scrape form/job/progress state management.
- `src/stores/scrapedLeadStore.js` - processing pipeline state, notes, actions, and realtime subscriptions.
- `src/stores/capturedLeadStore.js` - captured leads state, Mark Done, notes, and realtime subscriptions.
- `src/hooks/useSupabaseKeepAlive.js` - app-level Supabase session keep-alive and resume event dispatch.
- `src/pages/ScrapeLeadsPage.jsx` - Scrape Leads UI page.
- `src/pages/ScrapeLeadsPage.jsx` - added max leads control and clearer live scrape counters.
- `src/pages/ScrapeLeadsProcessingPage.jsx` - Fresh/Follow-up/Discard processing UI.
- `src/pages/ScrapeLeadsProcessingPage.jsx` - added call script reader using existing Call Scripts templates and placeholders.
- `src/pages/ScrapeLeadsProcessingPage.jsx` - script reader now shows all sections at once and only replaces placeholders without rewriting script text.
- `src/pages/CapturedLeadsPage.jsx` - Captured Leads Processing/Done UI.
- `src/config/navigation.js` - added Scrape Leads sidebar item.
- `src/config/navigation.js` - added Scrape Processing sidebar item.
- `src/config/navigation.js` - added Captured Leads sidebar item.
- `src/config/navigation.js` - added grouped sidebar sections for Core CRM, Lead Scraping, and Templates.
- `src/routes/AppRouter.jsx` - added `/scrape-leads`, `/scrape-leads-processing`, and `/captured-leads` routes.
- `src/routes/AppRouter.jsx` - mounted Supabase keep-alive hook for logged-in app sessions.
- `src/components/layout/Sidebar.jsx` - renders grouped sidebar sections.
- `supabase/migrations/20260626_lead_scraping_pipeline.sql` - new Supabase schema migration.
- `electron/main.cjs` - registered scraper IPC and worker lifecycle.
- `electron/main.cjs` - hardened dev startup with workspace-local user data, GPU fallback switches, and startup logs.
- `electron/main.cjs` - moved dev Electron user data to the system temp folder to avoid Vite watch crashes.
- `electron/main.cjs` - removed custom Puppeteer cache override so the worker can use the Chrome installed by `npx puppeteer browsers install chrome`.
- `electron/preload.cjs` - exposed safe scraper bridge to renderer.
- `src/global.d.ts` - added scraper bridge typing.
- `package.json` / `package-lock.json` - added Puppeteer scraper dependencies.
- `package.json` - changed Electron dev wait URL from `127.0.0.1` to `localhost` to match Vite.
- `vite.config.js` - ignored local cache folders from dev file watching.
- `vite.config.js` - made project root explicit to avoid Vite/Rolldown absolute-path build errors on Windows.
- `.gitignore` - ignored local npm/Puppeteer caches.

---

## Known Issues / TODOs

- User still needs to run/confirm the Phase 12 migration in Supabase SQL Editor before live scraping will save rows.
- Final user end-to-end verification still needed.
- Idle recovery was added before Phase 17; user should verify the app still fetches after 10 minutes idle.
- Direct Google Maps scraping can be blocked or CAPTCHA'd; Phase 13 records failures in `scrape_jobs`.
- `npm run lint` fails due to pre-existing lint issues across the app, unrelated to the new scraper files.
- If Electron opens then immediately closes, check for Vite watcher errors. Dev user data now lives outside the project to avoid locked-file crashes.
- If scraping says Chrome cannot be found, run `npx puppeteer browsers install chrome` and restart `npm run dev`; the worker now uses the normal Puppeteer cache.

---

## Context Snapshot

```text
=== OUTREACHOS CONTEXT SNAPSHOT ===
Project: OutreachOS AI Sales CRM Desktop App
Add-on: Lead Scraping Pipeline (Phases 12-17)
Current phase completed: 17 locally, pending final user verification
Current phase in progress: none - waiting for GO
Next phase: none - add-on phases 12-17 complete
Files created/modified so far: ADDON_PROGRESS.md, docs/PHASE12_LEAD_SCRAPING_SCHEMA.md, docs/PHASE13_SCRAPER_ENGINE.md, docs/PHASE14_SCRAPE_LEADS_UI.md, docs/PHASE15_SCRAPE_LEADS_PROCESSING.md, docs/PHASE16_CAPTURED_LEADS.md, docs/PHASE17_LEAD_SCRAPING_INTEGRATION.md, supabase/migrations/20260626_lead_scraping_pipeline.sql, electron/googleMapsScraper.cjs, electron/scrapeWorker.cjs, electron/main.cjs, electron/preload.cjs, src/global.d.ts, src/hooks/useSupabaseKeepAlive.js, src/lib/scrapeLeadApi.js, src/lib/scrapeJobApi.js, src/lib/scrapedLeadApi.js, src/stores/scrapeJobStore.js, src/stores/scrapedLeadStore.js, src/stores/capturedLeadStore.js, src/pages/ScrapeLeadsPage.jsx, src/pages/ScrapeLeadsProcessingPage.jsx, src/pages/CapturedLeadsPage.jsx, src/config/navigation.js, src/components/layout/Sidebar.jsx, src/routes/AppRouter.jsx, package.json, package-lock.json, .gitignore, vite.config.js, docs/README.md, PROGRESS.md
Known issues / TODOs: Final user E2E verification remains; direct Google Maps scraping can be blocked; npm lint has pre-existing failures.
Last thing done: Completed Phase 17 final integration with grouped sidebar navigation and workflow cross-links.
===================================
```
