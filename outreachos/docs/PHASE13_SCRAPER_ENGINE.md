# Phase 13 - Scraper Engine

## Goal

Add the non-UI engine for Google Maps lead scraping:

- Run scraping outside the React renderer so the app stays responsive.
- Create/update `scrape_jobs` rows.
- Insert new `scraped_leads` rows with `status = 'fresh'`.
- Skip duplicates using business name plus address, or business name plus phone when address is missing.
- Emit progress events back to the renderer for Phase 14 UI.
- Mark failed jobs as `failed` instead of crashing the app.

## Implementation

### Electron worker

`electron/scrapeWorker.cjs`

- Receives scrape input from Electron main through child-process IPC.
- Creates the `scrape_jobs` row with `status = 'running'`.
- Calls the Google Maps scraper.
- Inserts deduped leads into Supabase.
- Updates the job to `completed` or `failed`.

### Google Maps scraper

`electron/googleMapsScraper.cjs`

- Uses `puppeteer-extra`, `puppeteer-extra-plugin-stealth`, and `puppeteer`.
- Builds searches as:

```text
{keyword} in {city}, {state}
```

- Opens Google Maps results.
- Scrolls the result feed to collect listing links.
- Opens each listing detail page.
- Extracts best-effort:
  - business name
  - phone
  - website
  - address
  - category/area served
  - rating
  - review count
- Checks the business website, `/contact`, `/contact-us`, and `/about` for a best-effort email address.

### Electron bridge

`electron/main.cjs`

- Adds `scraper:start`.
- Runs one scrape at a time.
- Starts the worker process.
- Forwards progress/completion/failure messages to the renderer.

`electron/preload.cjs`

- Exposes:

```js
window.electronAPI.scraper.start(payload)
window.electronAPI.scraper.onProgress(callback)
```

### Renderer helper

`src/lib/scrapeLeadApi.js`

- Reads the active Supabase runtime config.
- Gets the current Supabase Auth session.
- Sends URL, anon key, access token, and user ID to Electron for authenticated RLS-safe inserts.

## Verification Performed

- [x] Installed scraper dependencies.
- [x] Production frontend build succeeds with `npm run build`.
- [x] Scraper modules load without syntax errors.
- [x] Updated dev runner to wait on `http://localhost:5173`, matching the Vite URL Electron loads.
- [x] Moved Electron dev user data outside the project so Vite does not crash while watching locked Electron temp files.
- [ ] Full live scrape test still needs to be performed from Phase 14 UI or a temporary manual harness.

## Known Caveats

- Direct Google Maps scraping can be blocked by CAPTCHA or unusual traffic checks. The worker catches this and marks the job as failed.
- Email discovery is best-effort and will not work for every website.
- Only one scrape is allowed at a time for now. Phase 14 UI should show this clearly.
- `npm run lint` currently fails because of pre-existing app lint issues outside the Phase 13 changes.
- Dev mode uses a temp-folder Electron user data directory and disables hardware acceleration to avoid Windows cache/GPU startup failures in restricted environments.

## Self-Test Checklist

After Phase 14 adds the UI, run these tests from the app:

- [ ] Run a scrape for `dentist` in `Dallas`, `Texas`; app does not freeze.
- [ ] Progress events update during the scrape.
- [ ] A `scrape_jobs` row is created with `status = running`.
- [ ] On success, the job changes to `completed`.
- [ ] `results_count` equals the number of newly inserted leads.
- [ ] New leads appear in `scraped_leads` with `status = fresh`.
- [ ] Business name/address/rating/review count are captured for most results.
- [ ] Phone and website are captured when Google Maps provides them.
- [ ] Email appears for some leads with discoverable website emails, but blanks are acceptable.
- [ ] Running the same scrape twice skips duplicates.
- [ ] Starting a second scrape while one is running is blocked.
- [ ] If Google blocks the scrape or network fails, the job becomes `failed` with `error_message`.

## Manual Developer Harness Idea

If you need to test before Phase 14 UI exists, create a short temporary renderer button or console call that imports:

```js
import { startScrapeLeads, onScrapeProgress } from './src/lib/scrapeLeadApi';
```

Then call:

```js
onScrapeProgress(console.log);
startScrapeLeads({
  keyword: 'dentist',
  city: 'Dallas',
  state: 'Texas',
  maxResults: 10,
});
```
