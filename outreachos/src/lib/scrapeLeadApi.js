import { getRuntimeSupabaseConfig } from './runtimeConfig';
import { getSupabase } from './supabase';

export function onScrapeProgress(callback) {
  if (!window.electronAPI?.scraper?.onProgress) {
    return () => {};
  }
  return window.electronAPI.scraper.onProgress(callback);
}

export async function startScrapeLeads({ keyword, city, state, maxResults = 30 }) {
  if (!window.electronAPI?.scraper?.start) {
    return {
      ok: false,
      error: 'Lead scraping is only available in the OutreachOS desktop app.',
    };
  }

  const config = getRuntimeSupabaseConfig();
  const supabase = getSupabase();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!session?.access_token) {
    return { ok: false, error: 'You must be signed in before starting a scrape.' };
  }

  return window.electronAPI.scraper.start({
    keyword,
    city,
    state,
    maxResults,
    supabaseUrl: config.url,
    supabaseAnonKey: config.anonKey,
    accessToken: session.access_token,
    userId: session.user?.id ?? null,
  });
}
