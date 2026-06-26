import { useEffect } from 'react';
import { getSupabase } from '../lib/supabase';

const RESUME_EVENT = 'outreachos:resume';
const KEEP_ALIVE_MS = 4 * 60 * 1000;
const REFRESH_WINDOW_MS = 5 * 60 * 1000;

async function refreshSessionIfNeeded() {
  try {
    const supabase = getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.expires_at) {
      window.dispatchEvent(new CustomEvent(RESUME_EVENT));
      return;
    }

    const expiresMs = session.expires_at * 1000;
    if (expiresMs - Date.now() <= REFRESH_WINDOW_MS) {
      await supabase.auth.refreshSession();
    }

    window.dispatchEvent(new CustomEvent(RESUME_EVENT));
  } catch (error) {
    console.warn('[OutreachOS] Supabase keep-alive failed:', error);
  }
}

export function useSupabaseKeepAlive() {
  useEffect(() => {
    const onResume = () => {
      if (document.visibilityState === 'hidden') return;
      refreshSessionIfNeeded();
    };

    const interval = window.setInterval(refreshSessionIfNeeded, KEEP_ALIVE_MS);
    window.addEventListener('focus', onResume);
    window.addEventListener('online', onResume);
    document.addEventListener('visibilitychange', onResume);

    refreshSessionIfNeeded();

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onResume);
      window.removeEventListener('online', onResume);
      document.removeEventListener('visibilitychange', onResume);
    };
  }, []);
}

export { RESUME_EVENT };
