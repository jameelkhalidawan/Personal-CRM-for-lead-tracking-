# Phase 16 - Captured Leads UI

## Goal

Add a dedicated page for scraped leads that were captured out of the processing funnel:

```text
captured_processing -> captured_done
```

## Implementation

### Page

`src/pages/CapturedLeadsPage.jsx`

- Sidebar route: `Captured Leads`
- Route: `/captured-leads`
- Tabs:
  - Processing
  - Done
- Each tab has a count badge.
- Captured leads display as cards with:
  - business name
  - email
  - phone
  - website
  - address
  - original search keyword/city
- Search filters captured leads by business name, city, keyword, address, phone, or email.
- Clicking a lead opens a `SlidePanel`.

### Detail Panel

The detail panel shows:

- Full lead detail
- Website link
- Rating/review count
- Full note history, including notes from Fresh/Follow-up stages
- Note textarea

Actions:

- Processing tab:
  - `Mark Done`
  - Requires note
  - Inserts note with `action = marked_done`
  - Updates status to `captured_done`
- Done tab:
  - Terminal status
  - Allows plain notes with `action = note`
  - Status does not change

### Store/API

`src/stores/capturedLeadStore.js`

- Loads `captured_processing` and `captured_done` leads.
- Loads notes.
- Marks leads done.
- Adds plain notes.
- Subscribes to realtime updates on `scraped_leads` and `scraped_lead_notes`.

`src/lib/scrapedLeadApi.js`

- Adds `CAPTURED_STATUSES`.

## Verification Performed

- [x] Production build succeeds with `npm run build`.
- [x] Scraper modules still load.

## Self-Test Checklist

- [ ] Sidebar shows `Captured Leads`.
- [ ] A lead captured from Scrape Processing appears in Captured Leads / Processing.
- [ ] Processing and Done count badges are correct.
- [ ] Search filters captured leads correctly.
- [ ] Open a captured lead; full detail and full note history are visible.
- [ ] Notes from Fresh/Follow-up stages are still visible.
- [ ] `Mark Done` is disabled until a note is entered.
- [ ] Add note and click `Mark Done`; lead moves from Processing to Done.
- [ ] Done tab shows the lead with full note history.
- [ ] Add a plain note in Done; note appears and status stays Done.
- [ ] Two windows/users: marking done or adding notes in one window updates the other window.
