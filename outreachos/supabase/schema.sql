-- =============================================================================
-- OutreachOS — Phase 3 Database Schema
-- Run once in Supabase Dashboard → SQL Editor → New query → Run
-- Project: https://supabase.com/dashboard/project/_/sql
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Helper: auto-update updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- businesses
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.businesses (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  business_name     text NOT NULL,
  niche             text,
  business_email    text,
  website_url       text,
  linkedin_url      text,
  phone_number      text,
  city              text,
  state             text,
  country           text,
  problem_notes     text,
  lead_source       text,
  status            text NOT NULL DEFAULT 'new'
    CHECK (status IN (
      'new', 'contacted', 'interested', 'proposal_sent',
      'closed_won', 'closed_lost', 'not_interested'
    )),
  priority          text DEFAULT 'medium'
    CHECK (priority IN ('high', 'medium', 'low')),
  estimated_value   numeric,
  last_contacted_at timestamptz,
  next_followup_at  timestamptz
);

DROP TRIGGER IF EXISTS businesses_set_updated_at ON public.businesses;
CREATE TRIGGER businesses_set_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- decision_makers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.decision_makers (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at              timestamptz NOT NULL DEFAULT now(),
  business_id             uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name                    text NOT NULL,
  role                    text,
  email                   text,
  phone_number            text,
  linkedin_url            text,
  instagram_handle        text,
  facebook_url            text,
  twitter_handle          text,
  notes                   text,
  problem_notes           text,
  preferred_contact       text
    CHECK (preferred_contact IS NULL OR preferred_contact IN (
      'email', 'phone', 'linkedin', 'whatsapp', 'instagram', 'twitter'
    )),
  is_primary              boolean NOT NULL DEFAULT false,
  last_contacted_at       timestamptz,
  next_followup_at        timestamptz
);

-- -----------------------------------------------------------------------------
-- services
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  description   text,
  is_active     boolean NOT NULL DEFAULT true
);

-- -----------------------------------------------------------------------------
-- business_services (junction)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_services (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  service_id   uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  UNIQUE (business_id, service_id)
);

-- -----------------------------------------------------------------------------
-- activities
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activities (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  business_id         uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  decision_maker_id   uuid REFERENCES public.decision_makers(id) ON DELETE SET NULL,
  performed_by        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type                text NOT NULL
    CHECK (type IN (
      'cold_email', 'followup_email', 'call', 'whatsapp', 'meeting',
      'proposal', 'interested', 'closed', 'note'
    )),
  notes               text,
  followup_at         timestamptz,
  outreach_channel    text CHECK (outreach_channel IS NULL OR outreach_channel IN ('phone', 'email'))
);

-- -----------------------------------------------------------------------------
-- email_templates
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  name        text NOT NULL,
  subject     text,
  body        text,
  category    text
);

-- -----------------------------------------------------------------------------
-- call_templates (multiple scripts per template, JSON array)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.call_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  name        text NOT NULL,
  category    text,
  scripts     jsonb NOT NULL DEFAULT '[]'::jsonb
);

-- -----------------------------------------------------------------------------
-- reminder_settings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reminder_settings (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  universal_enabled     boolean NOT NULL DEFAULT true,
  check_interval_mins   int NOT NULL DEFAULT 30
    CHECK (check_interval_mins IN (15, 30, 60)),
  advance_notice_mins   int NOT NULL DEFAULT 60
    CHECK (advance_notice_mins IN (30, 60, 120)),
  overdue_alerts        boolean NOT NULL DEFAULT true,
  UNIQUE (user_id)
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses (status);
CREATE INDEX IF NOT EXISTS idx_businesses_priority ON public.businesses (priority);
CREATE INDEX IF NOT EXISTS idx_businesses_next_followup_at ON public.businesses (next_followup_at);
CREATE INDEX IF NOT EXISTS idx_businesses_last_contacted_at ON public.businesses (last_contacted_at);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON public.businesses (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_decision_makers_business_id ON public.decision_makers (business_id);
CREATE INDEX IF NOT EXISTS idx_decision_makers_name ON public.decision_makers (name);

CREATE INDEX IF NOT EXISTS idx_business_services_business_id ON public.business_services (business_id);
CREATE INDEX IF NOT EXISTS idx_business_services_service_id ON public.business_services (service_id);

CREATE INDEX IF NOT EXISTS idx_activities_business_id ON public.activities (business_id);
CREATE INDEX IF NOT EXISTS idx_activities_followup_at ON public.activities (followup_at);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities (type);
CREATE INDEX IF NOT EXISTS idx_activities_outreach_channel ON public.activities (outreach_channel)
  WHERE outreach_channel IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_performed_by ON public.activities (performed_by);

CREATE INDEX IF NOT EXISTS idx_email_templates_category ON public.email_templates (category);
CREATE INDEX IF NOT EXISTS idx_call_templates_category ON public.call_templates (category);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_makers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running (safe for dev)
DROP POLICY IF EXISTS "authenticated full access" ON public.businesses;
DROP POLICY IF EXISTS "authenticated full access" ON public.decision_makers;
DROP POLICY IF EXISTS "authenticated full access" ON public.services;
DROP POLICY IF EXISTS "authenticated full access" ON public.business_services;
DROP POLICY IF EXISTS "authenticated full access" ON public.activities;
DROP POLICY IF EXISTS "authenticated full access" ON public.email_templates;
DROP POLICY IF EXISTS "authenticated full access" ON public.call_templates;
DROP POLICY IF EXISTS "authenticated full access" ON public.reminder_settings;

CREATE POLICY "authenticated full access" ON public.businesses
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated full access" ON public.decision_makers
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated full access" ON public.services
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated full access" ON public.business_services
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated full access" ON public.activities
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated full access" ON public.email_templates
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated full access" ON public.call_templates
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated full access" ON public.reminder_settings
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- Seed: services (idempotent by name)
-- -----------------------------------------------------------------------------
INSERT INTO public.services (name, description, is_active)
SELECT v.name, v.description, true
FROM (VALUES
  ('AI Voice Agent', 'AI-powered voice agents for inbound and outbound calls'),
  ('Chatbot', 'Custom chatbots for web and messaging platforms'),
  ('Website Redesign', 'Modern, conversion-focused website redesigns'),
  ('AI Automation', 'Workflow automation using AI and integrations')
) AS v(name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.services s WHERE s.name = v.name
);

-- -----------------------------------------------------------------------------
-- Seed: email_templates (shells — body filled by user later)
-- -----------------------------------------------------------------------------
INSERT INTO public.email_templates (name, subject, body, category)
SELECT v.name, v.subject, v.body, v.category
FROM (VALUES
  ('AI Voice Agent — Initial Pitch', 'Quick idea for {{business_name}}', '', 'AI Voice Agent'),
  ('Chatbot — Initial Pitch', 'Automate support at {{business_name}}', '', 'Chatbot'),
  ('Website Redesign — Initial Pitch', 'Your website could convert better', '', 'Website Redesign'),
  ('Follow-up #1 — General', 'Following up', '', 'Follow-up'),
  ('Follow-up #2 — Value Add', 'One more thought', '', 'Follow-up'),
  ('Proposal Follow-up', 'Did you get a chance to review?', '', 'Proposal')
) AS v(name, subject, body, category)
WHERE NOT EXISTS (
  SELECT 1 FROM public.email_templates t WHERE t.name = v.name
);

-- -----------------------------------------------------------------------------
-- Seed: call_templates (starter scripts — edit in app)
-- -----------------------------------------------------------------------------
INSERT INTO public.call_templates (name, category, scripts)
SELECT v.name, v.category, v.scripts::jsonb
FROM (VALUES
  (
    'AI Voice Agent — Cold call',
    'AI Voice Agent',
    '[{"id":"1","label":"Opening","body":"Hi {{decision_maker_name}}, this is {{your_name}} from Conscious Automation. I help {{niche}} businesses like {{business_name}} automate phone follow-ups with AI voice agents — do you have 30 seconds?"},{"id":"2","label":"Value pitch","body":"We set up an AI agent that answers and calls back so your team does not miss leads. For {{business_name}} that usually means faster response without hiring."},{"id":"3","label":"Close / next step","body":"Would it make sense to book a 15-minute call this week to see if it fits {{business_name}}?"}]'
  ),
  (
    'General — Cold call',
    'General',
    '[{"id":"1","label":"Opening","body":"Hi {{decision_maker_name}}, it is {{your_name}} — I am reaching out about {{business_name}}. Is now a bad time?"},{"id":"2","label":"Follow-up ask","body":"No worries if busy — when should I try you again?"}]'
  )
) AS v(name, category, scripts)
WHERE NOT EXISTS (
  SELECT 1 FROM public.call_templates t WHERE t.name = v.name
);

-- -----------------------------------------------------------------------------
-- Verify (optional — shows counts in SQL Editor results)
-- -----------------------------------------------------------------------------
SELECT 'businesses' AS table_name, count(*)::int AS rows FROM public.businesses
UNION ALL SELECT 'decision_makers', count(*)::int FROM public.decision_makers
UNION ALL SELECT 'services', count(*)::int FROM public.services
UNION ALL SELECT 'business_services', count(*)::int FROM public.business_services
UNION ALL SELECT 'activities', count(*)::int FROM public.activities
UNION ALL SELECT 'email_templates', count(*)::int FROM public.email_templates
UNION ALL SELECT 'call_templates', count(*)::int FROM public.call_templates
UNION ALL SELECT 'reminder_settings', count(*)::int FROM public.reminder_settings;
