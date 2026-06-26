-- =============================================================================
-- OutreachOS - Add-on Phase 12: Lead Scraping Pipeline schema
-- Run in Supabase SQL Editor after the base schema and existing migrations.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- scrape_jobs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scrape_jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword         text NOT NULL,
  city            text NOT NULL,
  state           text NOT NULL,
  status          text NOT NULL DEFAULT 'queued'
                    CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  results_count   int DEFAULT 0,
  error_message   text,
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz DEFAULT now(),
  created_by      uuid REFERENCES auth.users(id)
);

-- -----------------------------------------------------------------------------
-- scraped_leads
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scraped_leads (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         timestamptz DEFAULT now(),
  business_name      text NOT NULL,
  email              text,
  phone_number       text,
  website            text,
  address            text,
  area_served        text,
  rating             numeric,
  total_reviews      int,
  search_keyword     text,
  search_city        text,
  search_state       text,
  status             text NOT NULL DEFAULT 'fresh'
                       CHECK (
                         status IN (
                           'fresh',
                           'followup_1',
                           'followup_2',
                           'discard',
                           'captured_processing',
                           'captured_done'
                         )
                       ),
  status_updated_at  timestamptz DEFAULT now(),
  scrape_job_id      uuid REFERENCES public.scrape_jobs(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- scraped_lead_notes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scraped_lead_notes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id      uuid REFERENCES public.scraped_leads(id) ON DELETE CASCADE,
  note         text NOT NULL,
  action       text CHECK (
                 action IN ('note', 'move_to_next', 'captured', 'marked_done')
               ),
  created_at   timestamptz DEFAULT now(),
  created_by   uuid REFERENCES auth.users(id)
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_status
  ON public.scrape_jobs(status);

CREATE INDEX IF NOT EXISTS idx_scrape_jobs_created_at
  ON public.scrape_jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scraped_leads_status
  ON public.scraped_leads(status);

CREATE INDEX IF NOT EXISTS idx_scraped_leads_scrape_job_id
  ON public.scraped_leads(scrape_job_id);

CREATE INDEX IF NOT EXISTS idx_scraped_leads_search
  ON public.scraped_leads(search_keyword, search_city, search_state);

CREATE INDEX IF NOT EXISTS idx_scraped_lead_notes_lead_id
  ON public.scraped_lead_notes(lead_id);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_lead_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated full access" ON public.scrape_jobs;
DROP POLICY IF EXISTS "authenticated full access" ON public.scraped_leads;
DROP POLICY IF EXISTS "authenticated full access" ON public.scraped_lead_notes;

CREATE POLICY "authenticated full access" ON public.scrape_jobs
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated full access" ON public.scraped_leads
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated full access" ON public.scraped_lead_notes
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
