-- Admin-protected app connection settings (singleton row)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.app_settings (
  id                  int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  supabase_url        text,
  supabase_anon_key   text,
  admin_password_hash text
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- No direct client access — use RPCs only
REVOKE ALL ON public.app_settings FROM authenticated, anon;
GRANT SELECT, UPDATE ON public.app_settings TO service_role;

INSERT INTO public.app_settings (id, supabase_url, supabase_anon_key, admin_password_hash)
VALUES (1, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Verify admin password (hash set manually in Supabase SQL Editor)
CREATE OR REPLACE FUNCTION public.verify_admin_password(p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT admin_password_hash INTO stored_hash FROM app_settings WHERE id = 1;
  IF stored_hash IS NULL OR stored_hash = '' OR p_password IS NULL OR p_password = '' THEN
    RETURN false;
  END IF;
  RETURN stored_hash = crypt(p_password, stored_hash);
END;
$$;

-- Read connection overrides (authenticated team members only)
CREATE OR REPLACE FUNCTION public.get_app_connection_settings()
RETURNS TABLE (supabase_url text, supabase_anon_key text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'authenticated' THEN
    RETURN;
  END IF;
  RETURN QUERY
    SELECT s.supabase_url, s.supabase_anon_key
    FROM app_settings s
    WHERE s.id = 1;
END;
$$;

-- Update connection (admin password required)
CREATE OR REPLACE FUNCTION public.update_app_connection_settings(
  p_password text,
  p_url text,
  p_anon_key text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'authenticated' THEN
    RETURN false;
  END IF;
  IF NOT public.verify_admin_password(p_password) THEN
    RETURN false;
  END IF;
  UPDATE app_settings
  SET
    supabase_url = NULLIF(trim(p_url), ''),
    supabase_anon_key = NULLIF(trim(p_anon_key), ''),
    updated_at = now()
  WHERE id = 1;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_admin_password(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_connection_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_app_connection_settings(text, text, text) TO authenticated;
