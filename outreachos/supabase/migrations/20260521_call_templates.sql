-- Call script templates (run once in Supabase SQL Editor)
CREATE TABLE IF NOT EXISTS public.call_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  name        text NOT NULL,
  category    text,
  scripts     jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_call_templates_category ON public.call_templates (category);

ALTER TABLE public.call_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated full access" ON public.call_templates;
CREATE POLICY "authenticated full access" ON public.call_templates
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Optional starter templates
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
