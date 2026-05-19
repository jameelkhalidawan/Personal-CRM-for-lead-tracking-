import { create } from 'zustand';
import {
  createActivity,
  deleteActivity,
  fetchAllActivities,
  updateActivity,
} from '../lib/activityApi';
import { getSupabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import { useBusinessStore } from './businessStore';

function applyFilters(items, { search, type }) {
  let list = [...(items ?? [])];
  const q = String(search ?? '').trim().toLowerCase();

  if (q) {
    list = list.filter(
      (a) =>
        a.notes?.toLowerCase().includes(q) ||
        a.business_name?.toLowerCase().includes(q) ||
        a.decision_maker_name?.toLowerCase().includes(q),
    );
  }

  if (type) {
    list = list.filter((a) => a.type === type);
  }

  return list;
}

let activityRealtimeChannel = null;

function refreshBusinessContext(businessId) {
  const store = useBusinessStore.getState();
  const detailId = store.detail?.business?.id;
  if (detailId && detailId === businessId) {
    store.loadBusinessDetail(businessId);
  }
  store.loadBusinesses();
}

export const useActivityStore = create((set, get) => ({
  items: [],
  loading: false,
  saving: false,
  error: null,
  search: '',
  filterType: '',

  getFiltered: () =>
    applyFilters(get().items, {
      search: get().search,
      type: get().filterType,
    }),

  setSearch: (search) => set({ search }),
  setFilterType: (filterType) => set({ filterType }),

  clearError: () => set({ error: null }),

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const items = await fetchAllActivities();
      set({ items, loading: false });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  subscribeRealtime: () => {
    if (activityRealtimeChannel) return;

    try {
      const supabase = getSupabase();
      activityRealtimeChannel = supabase
        .channel('outreachos-activities')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'activities' },
          (payload) => {
            get().loadAll();
            const businessId =
              payload.new?.business_id ?? payload.old?.business_id;
            if (businessId) refreshBusinessContext(businessId);
          },
        )
        .subscribe();
    } catch {
      // Realtime optional
    }
  },

  unsubscribeRealtime: () => {
    if (activityRealtimeChannel) {
      getSupabase().removeChannel(activityRealtimeChannel);
      activityRealtimeChannel = null;
    }
  },

  create: async (businessId, form) => {
    set({ saving: true, error: null });
    try {
      const userId = useAuthStore.getState().user?.id ?? null;
      await createActivity(businessId, form, userId);
      await get().loadAll();
      refreshBusinessContext(businessId);
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
      const userId = useAuthStore.getState().user?.id ?? null;
      await updateActivity(id, businessId, form, userId);
      await get().loadAll();
      refreshBusinessContext(businessId);
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
      await deleteActivity(id);
      await get().loadAll();
      refreshBusinessContext(businessId);
      set({ saving: false });
      return { ok: true };
    } catch (err) {
      set({ saving: false, error: err.message });
      return { ok: false };
    }
  },
}));
