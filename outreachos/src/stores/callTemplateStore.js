import { create } from 'zustand';
import { SUGGESTED_CATEGORIES } from '../constants/callTemplate';
import {
  createCallTemplate,
  deleteCallTemplate,
  fetchAllCallTemplates,
  updateCallTemplate,
} from '../lib/callTemplateApi';
import { getSupabase } from '../lib/supabase';

let callTemplateRealtimeChannel = null;

export const useCallTemplateStore = create((set, get) => ({
  templates: [],
  loading: false,
  saving: false,
  error: null,
  search: '',
  filterCategory: '',

  setSearch: (search) => set({ search }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  clearError: () => set({ error: null }),

  getCategories: () => {
    const fromTemplates = get()
      .templates.map((t) => t.category)
      .filter(Boolean);
    return [...new Set([...SUGGESTED_CATEGORIES, ...fromTemplates])].sort((a, b) =>
      a.localeCompare(b),
    );
  },

  getFiltered: () => {
    const { templates, search, filterCategory } = get();
    let list = [...templates];
    const q = String(search ?? '').trim().toLowerCase();

    if (q) {
      list = list.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          (t.scripts ?? []).some(
            (s) =>
              s.label?.toLowerCase().includes(q) || s.body?.toLowerCase().includes(q),
          ),
      );
    }

    if (filterCategory) {
      list = list.filter((t) => t.category === filterCategory);
    }

    return list;
  },

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const templates = await fetchAllCallTemplates();
      set({ templates, loading: false });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  subscribeRealtime: () => {
    if (callTemplateRealtimeChannel) return;
    try {
      const supabase = getSupabase();
      callTemplateRealtimeChannel = supabase
        .channel('outreachos-call-templates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'call_templates' },
          () => get().loadAll(),
        )
        .subscribe();
    } catch {
      // optional
    }
  },

  unsubscribeRealtime: () => {
    if (callTemplateRealtimeChannel) {
      getSupabase().removeChannel(callTemplateRealtimeChannel);
      callTemplateRealtimeChannel = null;
    }
  },

  create: async (form) => {
    set({ saving: true, error: null });
    try {
      await createCallTemplate(form);
      await get().loadAll();
      set({ saving: false });
      return { ok: true };
    } catch (err) {
      set({ saving: false, error: err.message });
      return { ok: false };
    }
  },

  update: async (id, form) => {
    set({ saving: true, error: null });
    try {
      await updateCallTemplate(id, form);
      await get().loadAll();
      set({ saving: false });
      return { ok: true };
    } catch (err) {
      set({ saving: false, error: err.message });
      return { ok: false };
    }
  },

  remove: async (id) => {
    set({ saving: true, error: null });
    try {
      await deleteCallTemplate(id);
      await get().loadAll();
      set({ saving: false });
      return { ok: true };
    } catch (err) {
      set({ saving: false, error: err.message });
      return { ok: false };
    }
  },
}));
