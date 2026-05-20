-- Primary contact flag on decision makers
ALTER TABLE public.decision_makers
  ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT false;
