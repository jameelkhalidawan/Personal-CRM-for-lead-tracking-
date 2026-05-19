import { create } from 'zustand';
import {
  createDecisionMaker,
  deleteDecisionMaker,
  fetchAllDecisionMakers,
  fetchDecisionMaker,
  updateDecisionMaker,
} from '../lib/decisionMakerApi';
import { getSupabase } from '../lib/supabase';
import { useBusinessStore } from './businessStore';

function applySearch(items, search) {
  const q = String(search ?? '').trim().toLowerCase();
  if (!q) return items ?? [];
  return (items ?? []).filter(
    (dm) =>
      dm.name?.toLowerCase().includes(q) ||
      dm.role?.toLowerCase().includes(q) ||
      dm.email?.toLowerCase().includes(q) ||
      dm.business_name?.toLowerCase().includes(q),
  );
}

let dmRealtimeChannel = null;

function refreshBusinessDetail(businessId) {
  const detailId = useBusinessStore.getState().detail?.business?.id;
  if (detailId && detailId === businessId) {
    useBusinessStore.getState().loadBusinessDetail(businessId);
  }
}

export const useDecisionMakerStore = create((set, get) => ({
  items: [],
  loading: false,
  saving: false,
  error: null,
  search: '',

  selected: null,
  selectedLoading: false,

  getFiltered: () => applySearch(get().items, get().search),

  setSearch: (search) => set({ search }),

  clearError: () => set({ error: null }),

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const items = await fetchAllDecisionMakers();
      set({ items, loading: false });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  loadOne: async (id) => {
    set({ selectedLoading: true, error: null });
    try {
      const selected = await fetchDecisionMaker(id);
      set({ selected, selectedLoading: false });
    } catch (err) {
      set({ selectedLoading: false, error: err.message });
    }
  },

  clearSelected: () => set({ selected: null }),

  subscribeRealtime: () => {
    if (dmRealtimeChannel) return;

    try {
      const supabase = getSupabase();
      dmRealtimeChannel = supabase
        .channel('outreachos-decision-makers')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'decision_makers' },
          () => {
            get().loadAll();
            const detailId = useBusinessStore.getState().detail?.business?.id;
            if (detailId) {
              refreshBusinessDetail(detailId);
            }
          },
        )
        .subscribe();
    } catch {
      // Realtime optional
    }
  },

  unsubscribeRealtime: () => {
    if (dmRealtimeChannel) {
      getSupabase().removeChannel(dmRealtimeChannel);
      dmRealtimeChannel = null;
    }
  },

  create: async (businessId, form) => {
    set({ saving: true, error: null });
    try {
      await createDecisionMaker(businessId, form);
      await get().loadAll();
      refreshBusinessDetail(businessId);
      set({ saving: false });
      return { ok: true };
    } catch (err) {
      set({ saving: false, error: err.message });
      return { ok: false };
    }
  },

  update: async (id, businessId, form) => {
    set({ saving: true, error: null });
    try {
      await updateDecisionMaker(id, businessId, form);
      await get().loadAll();
      refreshBusinessDetail(businessId);
      set({ saving: false });
      return { ok: true };
    } catch (err) {
      set({ saving: false, error: err.message });
      return { ok: false };
    }
  },

  remove: async (id, businessId) => {
    set({ saving: true, error: null });
    try {
      await deleteDecisionMaker(id);
      await get().loadAll();
      refreshBusinessDetail(businessId);
      set({ saving: false });
      return { ok: true };
    } catch (err) {
      set({ saving: false, error: err.message });
      return { ok: false };
    }
  },
}));
