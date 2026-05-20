import { create } from 'zustand';
import { fetchReminderSettings, upsertReminderSettings } from '../lib/reminderApi';
import {
  buildNotificationPayload,
  getBusinessesToNotify,
  markReminderSent,
} from '../lib/reminderChecker';
import { showReminderNotification } from '../lib/reminderNotifier';
import { fetchAllBusinesses } from '../lib/businessApi';

export const useReminderStore = create((set, get) => ({
  settings: null,
  loading: false,
  saving: false,
  error: null,
  lastCheckAt: null,

  clearError: () => set({ error: null }),

  loadSettings: async (userId) => {
    if (!userId) return;
    set({ loading: true, error: null });
    try {
      const settings = await fetchReminderSettings(userId);
      set({ settings, loading: false });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  saveSettings: async (userId, form) => {
    set({ saving: true, error: null });
    try {
      const settings = await upsertReminderSettings(userId, form);
      set({ settings, saving: false });
      return { ok: true };
    } catch (err) {
      set({ saving: false, error: err.message });
      return { ok: false };
    }
  },

  runReminderCheck: async () => {
    const { settings } = get();
    if (!settings?.universal_enabled) return { notified: 0 };

    try {
      const businesses = await fetchAllBusinesses();
      const pending = getBusinessesToNotify(businesses, settings);
      let notified = 0;

      for (const item of pending) {
        const payload = buildNotificationPayload(item);
        const shown = await showReminderNotification(payload);
        if (shown) {
          markReminderSent(item.dedupeKey);
          notified += 1;
        }
      }

      set({ lastCheckAt: new Date().toISOString() });
      return { notified };
    } catch (err) {
      set({ error: err.message });
      return { notified: 0 };
    }
  },
}));
