import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';
import { fetchScrapeJobs } from '../lib/scrapeJobApi';
import { onScrapeProgress, startScrapeLeads } from '../lib/scrapeLeadApi';
import { RESUME_EVENT } from '../hooks/useSupabaseKeepAlive';

let jobsRealtimeChannel = null;
let progressUnsubscribe = null;
let resumeUnsubscribe = null;

export const useScrapeJobStore = create((set, get) => ({
  jobs: [],
  loading: false,
  running: false,
  error: null,
  success: null,
  activeRunId: null,
  activeJobId: null,
  progress: null,

  clearMessage: () => set({ error: null, success: null }),

  loadJobs: async () => {
    set({ loading: true, error: null });
    try {
      const jobs = await fetchScrapeJobs();
      set({ jobs, loading: false });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  subscribeRealtime: () => {
    if (jobsRealtimeChannel) return;
    try {
      const supabase = getSupabase();
      jobsRealtimeChannel = supabase
        .channel('outreachos-scrape-jobs')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'scrape_jobs' },
          () => get().loadJobs(),
        )
        .subscribe();
    } catch {
      // Job history still works with manual reload after scrape completion.
    }
    if (!resumeUnsubscribe) {
      const onResume = () => get().loadJobs();
      window.addEventListener(RESUME_EVENT, onResume);
      resumeUnsubscribe = () => window.removeEventListener(RESUME_EVENT, onResume);
    }
  },

  unsubscribeRealtime: () => {
    if (jobsRealtimeChannel) {
      getSupabase().removeChannel(jobsRealtimeChannel);
      jobsRealtimeChannel = null;
    }
    if (progressUnsubscribe) {
      progressUnsubscribe();
      progressUnsubscribe = null;
    }
    if (resumeUnsubscribe) {
      resumeUnsubscribe();
      resumeUnsubscribe = null;
    }
  },

  startScrape: async (form) => {
    if (get().running) {
      set({ error: 'A scrape is already running. Wait for it to finish first.' });
      return { ok: false };
    }

    set({
      running: true,
      error: null,
      success: null,
      progress: { stage: 'starting', message: 'Starting scrape...' },
      activeRunId: null,
      activeJobId: null,
    });

    if (!progressUnsubscribe) {
      progressUnsubscribe = onScrapeProgress((event) => {
        if (event.type === 'job-created') {
          set({ activeJobId: event.jobId });
          get().loadJobs();
          return;
        }

        if (event.type === 'progress') {
          set({ progress: event.progress, activeJobId: event.jobId ?? get().activeJobId });
          return;
        }

        if (event.type === 'complete') {
          const result = event.result ?? {};
          set({
            running: false,
            activeJobId: event.jobId ?? get().activeJobId,
            progress: {
              stage: 'completed',
              message: `Completed: ${result.insertedCount ?? 0} new leads added, ${result.duplicateCount ?? 0} duplicates skipped.`,
              inserted: result.insertedCount ?? 0,
              duplicates: result.duplicateCount ?? 0,
            },
            success: `${result.insertedCount ?? 0} new leads added to Fresh. ${result.duplicateCount ?? 0} duplicates skipped.`,
          });
          get().loadJobs();
          return;
        }

        if (event.type === 'failed') {
          set({
            running: false,
            progress: null,
            error: event.error || 'Scrape failed.',
          });
          get().loadJobs();
        }
      });
    }

    const result = await startScrapeLeads(form);
    if (!result.ok) {
      set({
        running: false,
        progress: null,
        activeRunId: null,
        error: result.error ?? 'Could not start scrape.',
      });
      return { ok: false };
    }

    set({ activeRunId: result.runId });
    return { ok: true, runId: result.runId };
  },
}));
