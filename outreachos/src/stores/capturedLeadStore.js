import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';
import {
  addScrapedLeadNote,
  CAPTURED_STATUSES,
  fetchScrapedLeadNotes,
  fetchScrapedLeads,
  transitionScrapedLead,
} from '../lib/scrapedLeadApi';
import { useAuthStore } from './authStore';
import { RESUME_EVENT } from '../hooks/useSupabaseKeepAlive';

let capturedRealtimeChannel = null;
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

export const useCapturedLeadStore = create((set, get) => ({
  leads: [],
  notesByLeadId: {},
  loading: false,
  detailLoading: false,
  saving: false,
  error: null,
  success: null,
  search: '',

  setSearch: (search) => set({ search }),
  clearMessage: () => set({ error: null, success: null }),

  getLeadsByStatus: (status) => {
    const { leads, search } = get();
    return applySearch(
      leads.filter((lead) => lead.status === status),
      search,
    );
  },

  getCounts: () => {
    const counts = Object.fromEntries(CAPTURED_STATUSES.map((status) => [status, 0]));
    for (const lead of get().leads) {
      if (counts[lead.status] != null) counts[lead.status] += 1;
    }
    return counts;
  },

  loadLeads: async () => {
    set({ loading: true, error: null });
    try {
      const leads = await fetchScrapedLeads({ statuses: CAPTURED_STATUSES });
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
    if (capturedRealtimeChannel) return;
    try {
      const supabase = getSupabase();
      capturedRealtimeChannel = supabase
        .channel('outreachos-captured-leads')
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
    if (capturedRealtimeChannel) {
      getSupabase().removeChannel(capturedRealtimeChannel);
      capturedRealtimeChannel = null;
    }
    if (resumeUnsubscribe) {
      resumeUnsubscribe();
      resumeUnsubscribe = null;
    }
  },

  markDone: async (lead, note) => {
    if (!lead) return { ok: false };
    set({ saving: true, error: null, success: null });
    try {
      await transitionScrapedLead({
        lead,
        nextStatus: 'captured_done',
        note,
        action: 'marked_done',
        userId: useAuthStore.getState().user?.id ?? null,
      });
      await get().loadLeads();
      await get().loadNotes(lead.id);
      set({ saving: false, success: 'Captured lead marked done.' });
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
