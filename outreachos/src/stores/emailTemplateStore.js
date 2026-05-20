import { create } from 'zustand';
import { SUGGESTED_CATEGORIES } from '../constants/emailTemplate';
import {
  createEmailTemplate,
  deleteEmailTemplate,
  fetchAllEmailTemplates,
  updateEmailTemplate,
} from '../lib/emailTemplateApi';
import { getSupabase } from '../lib/supabase';

let templateRealtimeChannel = null;

export const useEmailTemplateStore = create((set, get) => ({
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
          t.subject?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q),
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
      const templates = await fetchAllEmailTemplates();
      set({ templates, loading: false });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  subscribeRealtime: () => {
    if (templateRealtimeChannel) return;
    try {
      const supabase = getSupabase();
      templateRealtimeChannel = supabase
        .channel('outreachos-email-templates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'email_templates' },
          () => get().loadAll(),
        )
        .subscribe();
    } catch {
      // optional
    }
  },

  unsubscribeRealtime: () => {
    if (templateRealtimeChannel) {
      getSupabase().removeChannel(templateRealtimeChannel);
      templateRealtimeChannel = null;
    }
  },

  create: async (form) => {
    set({ saving: true, error: null });
    try {
      await createEmailTemplate(form);
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
      await updateEmailTemplate(id, form);
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
      await deleteEmailTemplate(id);
      await get().loadAll();
      set({ saving: false });
      return { ok: true };
    } catch (err) {
      set({ saving: false, error: err.message });
      return { ok: false };
    }
  },
}));
