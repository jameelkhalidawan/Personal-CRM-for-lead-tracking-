# Phase 17 - Lead Scraping Integration and Polish

## Goal

Confirm and polish the full lead scraping add-on:

```text
Scrape Leads -> Scrape Processing -> Captured Leads
```

## Implementation

### Sidebar Grouping

`src/config/navigation.js`

- Added `NAV_SECTIONS` to group sidebar items.
- Kept `NAV_ITEMS` as a flattened export for compatibility.

`src/components/layout/Sidebar.jsx`

- Renders grouped sidebar sections:
  - Core CRM
  - Lead Scraping
  - Templates

This keeps the three scraping routes visually connected instead of mixing them into the older CRM routes.

### Workflow Links

`src/pages/ScrapeLeadsProcessingPage.jsx`

- Added a `Captured Leads` button in the page header.

`src/pages/CapturedLeadsPage.jsx`

- Added a `Processing` button in the page header.

These links make it easier to move between the two post-scrape workflow screens.

### Final Flow

The final add-on flow is:

1. Scrape Leads
   - Run Google Maps scrape.
   - Save new leads as `fresh`.
   - Show scrape job history.

2. Scrape Processing
   - Fresh -> Follow-up 1 -> Follow-up 2 -> Discard.
   - Capture at any active stage.
   - Required notes on stage changes.
   - Full note history.
   - Full call script reader using saved Call Scripts templates exactly as written.

3. Captured Leads
   - Captured Processing -> Captured Done.
   - Required note for Mark Done.
   - Plain notes allowed after Done.

## Verification Performed

- [x] Production build succeeds with `npm run build`.
- [x] Scraper modules still load.
- [x] Navigation grouping compiles.
- [x] Processing/Captured cross-links compile.

## Self-Test Checklist

- [ ] Sidebar groups show clearly: Core CRM, Lead Scraping, Templates.
- [ ] Scrape Leads, Scrape Processing, and Captured Leads all open from the sidebar.
- [ ] Full lifecycle: scrape -> Fresh -> Follow-up 1 -> Follow-up 2 -> Discard.
- [ ] Notes remain visible across all processing stages.
- [ ] Full lifecycle: scrape -> Fresh -> Captured Processing -> Captured Done.
- [ ] Notes from Fresh/Processing remain visible in Captured Leads.
- [ ] Call script reader shows all sections exactly as saved, with placeholders filled.
- [ ] Processing page header opens Captured Leads.
- [ ] Captured Leads page header opens Processing.
- [ ] Leave the app idle for 10 minutes and confirm data still reloads/fetches.
- [ ] Two windows/users: changes in one window appear in the other.
- [ ] No new console/runtime errors in the scraping flow.

## Known Caveats

- Direct Google Maps scraping may be blocked by Google. Failed jobs are recorded instead of crashing the app.
- Email extraction is best-effort and will not work for every website.
- `npm run lint` still reports pre-existing issues in older app files.
