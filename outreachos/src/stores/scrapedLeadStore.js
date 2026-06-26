import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';
import {
  addScrapedLeadNote,
  fetchScrapedLeadNotes,
  fetchScrapedLeads,
  NEXT_STATUS,
  PROCESSING_STATUSES,
  transitionScrapedLead,
} from '../lib/scrapedLeadApi';
import { useAuthStore } from './authStore';
import { RESUME_EVENT } from '../hooks/useSupabaseKeepAlive';

let leadsRealtimeChannel = null;
let resumeUnsubscribe = null;

function applySearch(leads, search) {
  const q = String(search ?? '').trim().toLowerCase();
  if (!q) return leads;
  return leads.filter((lead) =>
    [
      lead.business_name,
      lead.address,
      lead.search_keyword,
      lead.search_city,
      lead.search_state,
      lead.email,
      lead.phone_number,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q)),
  );
}

export const useScrapedLeadStore = create((set, get) => ({
  leads: [],
  notesByLeadId: {},
  loading: false,
  detailLoading: false,
  saving: false,
  error: null,
  success: null,
  search: '',
  jobId: '',

  setSearch: (search) => set({ search }),
  setJobId: (jobId) => set({ jobId }),
  clearMessage: () => set({ error: null, success: null }),

  getLeadsByStatus: (status) => {
    const { leads, search } = get();
    return applySearch(
      leads.filter((lead) => lead.status === status),
      search,
    );
  },

  getCounts: () => {
    const counts = Object.fromEntries(PROCESSING_STATUSES.map((status) => [status, 0]));
    for (const lead of get().leads) {
      if (counts[lead.status] != null) counts[lead.status] += 1;
    }
    return counts;
  },

  loadLeads: async () => {
    set({ loading: true, error: null });
    try {
      const leads = await fetchScrapedLeads({
        statuses: PROCESSING_STATUSES,
        jobId: get().jobId || undefined,
      });
      set({ leads, loading: false });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  loadNotes: async (leadId) => {
    if (!leadId) return;
    set({ detailLoading: true, error: null });
    try {
      const notes = await fetchScrapedLeadNotes(leadId);
      set((state) => ({
        notesByLeadId: { ...state.notesByLeadId, [leadId]: notes },
        detailLoading: false,
      }));
    } catch (err) {
      set({ detailLoading: false, error: err.message });
    }
  },

  subscribeRealtime: () => {
    if (leadsRealtimeChannel) return;
    try {
      const supabase = getSupabase();
      leadsRealtimeChannel = supabase
        .channel('outreachos-scraped-leads-processing')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'scraped_leads' },
          () => get().loadLeads(),
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'scraped_lead_notes' },
          (payload) => {
            const leadId = payload.new?.lead_id ?? payload.old?.lead_id;
            if (leadId) get().loadNotes(leadId);
          },
        )
        .subscribe();
    } catch {
      // Page still works with manual reloads after actions.
    }
    if (!resumeUnsubscribe) {
      const onResume = () => get().loadLeads();
      window.addEventListener(RESUME_EVENT, onResume);
      resumeUnsubscribe = () => window.removeEventListener(RESUME_EVENT, onResume);
    }
  },

  unsubscribeRealtime: () => {
    if (leadsRealtimeChannel) {
      getSupabase().removeChannel(leadsRealtimeChannel);
      leadsRealtimeChannel = null;
    }
    if (resumeUnsubscribe) {
      resumeUnsubscribe();
      resumeUnsubscribe = null;
    }
  },

  moveToNext: async (lead, note) => {
    const nextStatus = NEXT_STATUS[lead?.status];
    if (!lead || !nextStatus) {
      set({ error: 'This lead cannot move to another processing stage.' });
      return { ok: false };
    }
    set({ saving: true, error: null, success: null });
    try {
      await transitionScrapedLead({
        lead,
        nextStatus,
        note,
        action: 'move_to_next',
        userId: useAuthStore.getState().user?.id ?? null,
      });
      await get().loadLeads();
      await get().loadNotes(lead.id);
      set({ saving: false, success: 'Lead moved to the next stage.' });
      return { ok: true };
    } catch (err) {
      set({ saving: false, error: err.message });
      return { ok: false };
    }
  },

  captureLead: async (lead, note) => {
    if (!lead) return { ok: false };
    set({ saving: true, error: null, success: null });
    try {
      await transitionScrapedLead({
        lead,
        nextStatus: 'captured_processing',
        note,
        action: 'captured',
        userId: useAuthStore.getState().user?.id ?? null,
      });
      await get().loadLeads();
      await get().loadNotes(lead.id);
      set({ saving: false, success: 'Moved to Captured / Processing.' });
      return { ok: true };
    } catch (err) {
      set({ saving: false, error: err.message });
      return { ok: false };
    }
  },

  addPlainNote: async (lead, note) => {
    if (!lead) return { ok: false };
    set({ saving: true, error: null, success: null });
    try {
      await addScrapedLeadNote({
        leadId: lead.id,
        note,
        action: 'note',
        userId: useAuthStore.getState().user?.id ?? null,
      });
      await get().loadNotes(lead.id);
      set({ saving: false, success: 'Note added.' });
      return { ok: true };
    } catch (err) {
      set({ saving: false, error: err.message });
      return { ok: false };
    }
  },
}));
