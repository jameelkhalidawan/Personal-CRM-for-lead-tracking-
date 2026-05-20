-- Track which outreach channel (call vs email) an activity belongs to
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS outreach_channel text
    CHECK (outreach_channel IS NULL OR outreach_channel IN ('phone', 'email'));

CREATE INDEX IF NOT EXISTS idx_activities_outreach_channel
  ON public.activities (outreach_channel)
  WHERE outreach_channel IS NOT NULL;
