import { create } from 'zustand';
import {
  createBusiness,
  deleteBusiness,
  fetchAllBusinesses,
  fetchBusinessDetail,
  fetchServices,
  updateBusiness,
  patchBusinessStatus,
} from '../lib/businessApi';
import { getSupabase } from '../lib/supabase';

const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };

function applyFilters(businesses, { search, status, priority, serviceIds }) {
  let list = [...(businesses ?? [])];

  if ((search ?? '').trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (b) =>
        b.business_name?.toLowerCase().includes(q) ||
        b.niche?.toLowerCase().includes(q) ||
        b.business_email?.toLowerCase().includes(q),
    );
  }

  if (status) {
    list = list.filter((b) => b.status === status);
  }

  if (priority) {
    list = list.filter((b) => b.priority === priority);
  }

  if ((serviceIds ?? []).length > 0) {
    list = list.filter((b) =>
      b.services?.some((s) => serviceIds.includes(s.id)),
    );
  }

  return list;
}

function applySort(list, sortBy) {
  const sorted = [...list];

  switch (sortBy) {
    case 'last_contacted_desc':
      sorted.sort((a, b) => {
        const ta = a.last_contacted_at ? new Date(a.last_contacted_at).getTime() : 0;
        const tb = b.last_contacted_at ? new Date(b.last_contacted_at).getTime() : 0;
        return tb - ta;
      });
      break;
    case 'next_followup_asc':
      sorted.sort((a, b) => {
        const ta = a.next_followup_at
          ? new Date(a.next_followup_at).getTime()
          : Infinity;
        const tb = b.next_followup_at
          ? new Date(b.next_followup_at).getTime()
          : Infinity;
        return ta - tb;
      });
      break;
    case 'priority_desc':
      sorted.sort(
        (a, b) =>
          (PRIORITY_RANK[b.priority] ?? 0) - (PRIORITY_RANK[a.priority] ?? 0),
      );
      break;
    case 'estimated_value_desc':
      sorted.sort(
        (a, b) => (Number(b.estimated_value) || 0) - (Number(a.estimated_value) || 0),
      );
      break;
    case 'created_at_desc':
    default:
      sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }

  return sorted;
}

let realtimeChannel = null;

export const useBusinessStore = create((set, get) => ({
  businesses: [],
  services: [],
  loading: false,
  saving: false,
  error: null,

  search: '',
  filterStatus: '',
  filterPriority: '',
  filterServiceIds: [],
  sortBy: 'created_at_desc',

  detail: null,
  detailLoading: false,

  getFilteredBusinesses: () => {
    const { businesses, search, filterStatus, filterPriority, filterServiceIds, sortBy } =
      get();
    const filtered = applyFilters(businesses, {
      search,
      status: filterStatus,
      priority: filterPriority,
      serviceIds: filterServiceIds,
    });
    return applySort(filtered, sortBy);
  },

  setSearch: (search) => set({ search }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setFilterPriority: (filterPriority) => set({ filterPriority }),
  setFilterServiceIds: (filterServiceIds) => set({ filterServiceIds }),
  setSortBy: (sortBy) => set({ sortBy }),

  toggleServiceFilter: (serviceId) => {
    const current = get().filterServiceIds;
    const next = current.includes(serviceId)
      ? current.filter((id) => id !== serviceId)
      : [...current, serviceId];
    set({ filterServiceIds: next });
  },

  clearError: () => set({ error: null }),

  loadServices: async () => {
    try {
      const services = await fetchServices();
      set({ services });
    } catch (err) {
      set({ error: err.message });
    }
  },

  loadBusinesses: async () => {
    set({ loading: true, error: null });
    try {
      const businesses = await fetchAllBusinesses();
      set({ businesses, loading: false });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  loadBusinessDetail: async (businessId) => {
    set({ detailLoading: true, error: null });
    try {
      const detail = await fetchBusinessDetail(businessId);
      set({ detail, detailLoading: false });
    } catch (err) {
      set({ detailLoading: false, error: err.message });
    }
  },

  subscribeRealtime: () => {
    if (realtimeChannel) return;

    try {
      const supabase = getSupabase();
      realtimeChannel = supabase
      .channel('outreachos-businesses')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'businesses' },
        () => {
          get().loadBusinesses();
          const detailId = get().detail?.business?.id;
          if (detailId) {
            get().loadBusinessDetail(detailId);
          }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'business_services' },
        () => {
          get().loadBusinesses();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'decision_makers' },
        () => {
          const detailId = get().detail?.business?.id;
          if (detailId) {
            get().loadBusinessDetail(detailId);
          }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        (payload) => {
          get().loadBusinesses();
          const detailId = get().detail?.business?.id;
          const changedId =
            payload.new?.business_id ?? payload.old?.business_id;
          if (detailId && changedId === detailId) {
            get().loadBusinessDetail(detailId);
          }
        },
      )
      .subscribe();
    } catch {
      // Realtime optional — app works without it
    }
  },

  unsubscribeRealtime: () => {
    if (realtimeChannel) {
      getSupabase().removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  },

  createBusiness: async (form) => {
    set({ saving: true, error: null });
    try {
      await createBusiness(form);
      await get().loadBusinesses();
      set({ saving: false });
      return { ok: true };
    } catch (err) {
      set({ saving: false, error: err.message });
      return { ok: false };
    }
  },

  patchBusinessStatus: async (id, status) => {
    const prev = get().businesses;
    set({
      businesses: prev.map((b) => (b.id === id ? { ...b, status } : b)),
      error: null,
    });
    try {
      await patchBusinessStatus(id, status);
      return { ok: true };
    } catch (err) {
      set({ businesses: prev, error: err.message });
      await get().loadBusinesses();
      return { ok: false };
    }
  },

  updateBusiness: async (id, form) => {
    set({ saving: true, error: null });
    try {
      await updateBusiness(id, form);
      await get().loadBusinesses();
      await get().loadBusinessDetail(id);
      set({ saving: false });
      return { ok: true };
    } catch (err) {
      set({ saving: false, error: err.message });
      return { ok: false };
    }
  },

  deleteBusiness: async (id) => {
    set({ saving: true, error: null });
    try {
      await deleteBusiness(id);
      set({ detail: null, saving: false });
      await get().loadBusinesses();
      return { ok: true };
    } catch (err) {
      set({ saving: false, error: err.message });
      return { ok: false };
    }
  },
}));
