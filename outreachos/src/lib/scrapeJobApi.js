import { getSupabase } from './supabase';

export async function fetchScrapeJobs() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('scrape_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}
