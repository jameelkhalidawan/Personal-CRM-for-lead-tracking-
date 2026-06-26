# Phase 15 - Scrape Leads Processing UI

## Goal

Add the working scraped-lead processing pipeline:

```text
Fresh -> Follow-up 1 -> Follow-up 2 -> Discard
Fresh / Follow-up 1 / Follow-up 2 -> Captured / Processing
```

Every stage-changing action requires a note.

## Implementation

### Page

`src/pages/ScrapeLeadsProcessingPage.jsx`

- Sidebar route: `Scrape Processing`
- Route: `/scrape-leads-processing`
- Stage tabs:
  - Fresh
  - Follow-up 1
  - Follow-up 2
  - Discard
- Each tab shows a count badge.
- Leads display as cards with:
  - business name
  - email
  - phone
  - website
  - address
  - rating
  - original search keyword/city
- Search filters business name, address, keyword, city, state, email, and phone.
- Clicking a lead opens a `SlidePanel`.

### Detail Panel

The detail panel shows:

- Full lead detail
- Website link
- Rating/review count
- Call script reader using existing Call Scripts templates
- Contact name field for filling `{{contact_name}}`
- Full note history
- Note textarea

Actions:

- `Move to next`
  - Requires note
  - Inserts note with `action = move_to_next`
  - Updates status:
    - `fresh -> followup_1`
    - `followup_1 -> followup_2`
    - `followup_2 -> discard`
- `Captured`
  - Requires note
  - Inserts note with `action = captured`
  - Updates status to `captured_processing`
- Discard tab:
  - No stage actions
  - Allows plain notes with `action = note`
  - Keeps panel open after note save so the new note is visible

### Call Script Reader

Scraped leads do not always include a decision-maker name. The detail panel includes a local `Contact name for script` field so the user can type the person they are calling. The script reader uses existing call templates and fills placeholders such as:

- `{{contact_name}}`
- `{{business_name}}`
- `{{niche}}`
- `{{your_name}}`

For scraped leads:

- `business_name` comes from the scraped business.
- `niche` comes from area served/category, falling back to search keyword.
- `phone_number`, `email`, `website`, and `city` come from scraped lead fields.
- `your_name` comes from the logged-in user's profile/email.
- The script is not rewritten or improved. It displays the saved template exactly as written, only replacing placeholders with relevant values.
- If a call template has multiple script sections, all sections are shown at once with their section names. The user does not manually select individual sections.

### Store/API

`src/lib/scrapedLeadApi.js`

- Fetch processing leads
- Fetch notes
- Add notes
- Update status
- Transition lead with note

`src/stores/scrapedLeadStore.js`

- Loads leads
- Loads notes
- Handles move/capture/plain note actions
- Subscribes to `scraped_leads` and `scraped_lead_notes` realtime changes

### Phase 14 Link

`src/pages/ScrapeLeadsPage.jsx`

- `View results` now opens the processing page.

## Verification Performed

- [x] Production build succeeds with `npm run build`.
- [x] Scraper modules still load.
- [x] Existing Call Scripts templates can be rendered inside Scrape Processing lead detail.

## Self-Test Checklist

- [ ] Sidebar shows `Scrape Processing`.
- [ ] Open `Scrape Processing`; Fresh tab loads newly scraped leads.
- [ ] Stage count badges show the correct number of leads.
- [ ] Search filters by business name, city, keyword, email, phone, or address.
- [ ] Open a Fresh lead; full details and note history are visible.
- [ ] Enter a Contact name and select a call template; rendered script fills contact/business/niche/your-name placeholders.
- [ ] Templates with multiple sections show every section at once with section names.
- [ ] Script wording matches the saved template exactly except placeholder values.
- [ ] Copy button copies the full rendered script.
- [ ] `Move to Follow-up 1` is disabled until a note is entered.
- [ ] Add a note and click `Move to Follow-up 1`; lead disappears from Fresh and appears in Follow-up 1.
- [ ] Note is saved with action tag `Moved stage`.
- [ ] Move from Follow-up 1 to Follow-up 2 with a required note.
- [ ] Move from Follow-up 2 to Discard with a required note.
- [ ] From Fresh, Follow-up 1, or Follow-up 2, add a note and click `Captured`; lead disappears from processing.
- [ ] Discard tab opens lead detail with no move/capture buttons.
- [ ] Add a plain note in Discard; note appears in history and lead stays in Discard.
- [ ] Two windows/users: moving or noting a lead in one window updates the other window.
