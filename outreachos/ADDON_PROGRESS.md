# OutreachOS Add-on Progress - Lead Scraping Pipeline

> Durable context file for Phases 12-17. Update this after every add-on phase so future agents can recover the exact state quickly.

**Project:** OutreachOS AI Sales CRM Desktop App  
**Add-on:** Lead Scraping Pipeline  
**Last updated:** 2026-06-26  
**Current phase:** Phase 12 complete - waiting for user self-test  
**Current work:** Waiting for the user to run the Phase 12 migration/test checklist, then reply `GO` to start Phase 13.  
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
| 13 | Scraper engine | Not started | Puppeteer/Electron IPC/Supabase job pipeline. |
| 14 | Scrape Leads UI | Not started | Input form, progress, job history. |
| 15 | Scrape Leads Processing UI | Not started | Fresh/Follow-up/Discard pipeline with required notes. |
| 16 | Captured Leads UI | Not started | Processing/Done pipeline with note history. |
| 17 | End-to-end integration + polish | Not started | Full lifecycle tests, realtime, visual polish. |

---

## Files Created / Modified So Far

- `ADDON_PROGRESS.md` - durable add-on context and phase tracker.
- `docs/PHASE12_LEAD_SCRAPING_SCHEMA.md` - Phase 12 setup and self-test guide.
- `supabase/migrations/20260626_lead_scraping_pipeline.sql` - new Supabase schema migration.

---

## Known Issues / TODOs

- User still needs to run the Phase 12 migration in Supabase SQL Editor.
- Phase 12 self-tests still need to be completed by the user before Phase 13.
- Phase 13 will require new dependencies and careful handling because direct Google Maps scraping can be blocked or CAPTCHA'd.

---

## Context Snapshot

```text
=== OUTREACHOS CONTEXT SNAPSHOT ===
Project: OutreachOS AI Sales CRM Desktop App
Add-on: Lead Scraping Pipeline (Phases 12-17)
Current phase completed: 12 locally, pending user Supabase self-test
Current phase in progress: none - waiting for GO
Next phase: 13 after user tests Phase 12 and replies GO
Files created/modified so far: ADDON_PROGRESS.md, docs/PHASE12_LEAD_SCRAPING_SCHEMA.md, supabase/migrations/20260626_lead_scraping_pipeline.sql
Known issues / TODOs: User must run migration and self-test Phase 12 in Supabase before Phase 13.
Last thing done: Added the Phase 12 schema migration, test guide, and durable add-on progress file.
===================================
```
