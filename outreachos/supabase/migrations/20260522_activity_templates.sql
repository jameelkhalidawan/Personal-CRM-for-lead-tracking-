-- Persist template linkage on activities
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.email_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS call_template_id uuid REFERENCES public.call_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS call_script_id text;

CREATE INDEX IF NOT EXISTS idx_activities_template_id ON public.activities (template_id)
  WHERE template_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_call_template_id ON public.activities (call_template_id)
  WHERE call_template_id IS NOT NULL;
