# Phase 12 - Lead Scraping Pipeline Database Schema

## Goal

Add the database foundation for the lead scraping funnel:

- `scrape_jobs` tracks each scrape run.
- `scraped_leads` stores scraped business leads and their current pipeline status.
- `scraped_lead_notes` stores the full note history for every scraped lead.

## Migration

Run this file in Supabase SQL Editor:

```text
supabase/migrations/20260626_lead_scraping_pipeline.sql
```

Run it after the base schema and existing migrations.

## Tables

### `scrape_jobs`

Tracks each scrape job with:

- keyword
- city
- state
- status: `queued`, `running`, `completed`, `failed`
- result count
- error message
- timestamps
- created user

### `scraped_leads`

Tracks each scraped lead with:

- business name
- email, phone, website, address
- area served/category
- rating and review count
- original search keyword/city/state
- current funnel status
- linked scrape job

Allowed statuses:

```text
fresh
followup_1
followup_2
discard
captured_processing
captured_done
```

### `scraped_lead_notes`

Tracks notes across the lead lifecycle.

Allowed actions:

```text
note
move_to_next
captured
marked_done
```

Notes are deleted automatically when their lead is deleted.

## Self-Test Checklist

Use Supabase Table Editor or SQL Editor.

- [ ] All 3 tables are visible in Supabase: `scrape_jobs`, `scraped_leads`, `scraped_lead_notes`.
- [ ] Insert a test scrape job and confirm it succeeds.
- [ ] Insert a test lead with status `fresh` and confirm it succeeds.
- [ ] Insert a note linked to that lead and confirm it succeeds.
- [ ] Delete the test lead and confirm the linked note is cascade-deleted.
- [ ] Try an invalid lead status like `bad_status` and confirm the insert is rejected.
- [ ] Try an unauthenticated insert and confirm RLS rejects it.

## Useful Test SQL

Run while logged in as an authenticated Supabase user/session where applicable.

```sql
insert into public.scrape_jobs (keyword, city, state, status)
values ('dentist', 'Dallas', 'Texas', 'completed')
returning id;
```

Copy the returned `id` into this:

```sql
insert into public.scraped_leads (
  business_name,
  phone_number,
  address,
  search_keyword,
  search_city,
  search_state,
  status,
  scrape_job_id
)
values (
  'Phase 12 Test Lead',
  '555-0100',
  '123 Test Street, Dallas, TX',
  'dentist',
  'Dallas',
  'Texas',
  'fresh',
  '<paste_scrape_job_id_here>'
)
returning id;
```

Copy the returned lead `id` into this:

```sql
insert into public.scraped_lead_notes (lead_id, note, action)
values (
  '<paste_lead_id_here>',
  'Phase 12 test note',
  'note'
);
```

Verify cascade delete:

```sql
delete from public.scraped_leads
where business_name = 'Phase 12 Test Lead';

select *
from public.scraped_lead_notes
where note = 'Phase 12 test note';
```

Expected result: no rows returned.

Verify invalid status is rejected:

```sql
insert into public.scraped_leads (business_name, status)
values ('Invalid Status Test', 'bad_status');
```

Expected result: check constraint error.
