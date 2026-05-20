import { create } from 'zustand';
import { DEFAULT_OUTREACH_TIMING } from '../constants/outreachTiming';
import { mergeOutreachTiming } from '../lib/outreachTiming';

const STORAGE_KEY = 'outreachos_preferences';

const DEFAULT_PREFS = {
  theme: 'dark',
  autoStart: false,
  /** serviceId -> template category names (#13) */
  serviceTemplateCategories: {},
  outreachTiming: { ...DEFAULT_OUTREACH_TIMING },
};

function readPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFS,
      ...parsed,
      outreachTiming: mergeOutreachTiming(parsed.outreachTiming),
      serviceTemplateCategories: parsed.serviceTemplateCategories ?? {},
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function writePrefs(prefs) {
  const payload = { ...prefs, updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

let storageSyncAttached = false;

function attachStorageSync(set) {
  if (storageSyncAttached || typeof window === 'undefined') return;
  storageSyncAttached = true;

  const sync = () => {
    const prefs = readPrefs();
    applyTheme(prefs.theme);
    set({
      theme: prefs.theme,
      autoStart: prefs.autoStart,
      outreachTiming: prefs.outreachTiming,
      serviceTemplateCategories: prefs.serviceTemplateCategories,
    });
  };

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) sync();
  });
  window.addEventListener('focus', sync);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export const usePreferencesStore = create((set, get) => ({
  ...readPrefs(),
  initialized: false,
  timingSaveMessage: null,
  autoStartAvailable: typeof window !== 'undefined' && !!window.electronAPI?.autoLaunch,

  syncFromStorage: () => {
    const prefs = readPrefs();
    applyTheme(prefs.theme);
    set({
      theme: prefs.theme,
      autoStart: prefs.autoStart,
      outreachTiming: prefs.outreachTiming,
      serviceTemplateCategories: prefs.serviceTemplateCategories,
    });
  },

  initialize: async () => {
    attachStorageSync(set);
    const prefs = readPrefs();
    applyTheme(prefs.theme);

    let autoStart = prefs.autoStart;
    if (window.electronAPI?.userPrefs) {
      try {
        const electronPrefs = await window.electronAPI.userPrefs.get();
        autoStart = Boolean(electronPrefs?.autoStart);
      } catch {
        // keep stored value
      }
    } else if (window.electronAPI?.autoLaunch) {
      try {
        autoStart = await window.electronAPI.autoLaunch.isEnabled();
      } catch {
        // keep stored value
      }
    }

    const next = { ...prefs, autoStart };
    writePrefs(next);
    set({ ...next, initialized: true });
  },

  setTheme: (theme) => {
    applyTheme(theme);
    const next = { ...readPrefs(), theme };
    writePrefs(next);
    set({ theme });
  },

  setAutoStart: async (autoStart) => {
    if (window.electronAPI?.userPrefs) {
      await window.electronAPI.userPrefs.set({ autoStart });
    } else if (window.electronAPI?.autoLaunch) {
      await window.electronAPI.autoLaunch.setEnabled(autoStart);
    }
    const next = { ...readPrefs(), autoStart };
    writePrefs(next);
    set({ autoStart });
  },

  setServiceTemplateCategories: (serviceTemplateCategories) => {
    const next = { ...readPrefs(), serviceTemplateCategories };
    writePrefs(next);
    set({ serviceTemplateCategories });
  },

  getOutreachTiming: () => mergeOutreachTiming(get().outreachTiming),

  setOutreachTiming: (partial) => {
    const outreachTiming = mergeOutreachTiming({
      ...readPrefs().outreachTiming,
      ...partial,
    });
    const next = { ...readPrefs(), outreachTiming };
    writePrefs(next);
    set({ outreachTiming });
  },

  setOutreachTimingField: (key, value) => {
    const num = Math.max(0, Math.min(30, Number(value) || 0));
    get().setOutreachTiming({ [key]: num });
  },

  /** Save full timing object — use from Settings Save button for reliable cross-tab sync */
  saveOutreachTiming: (outreachTiming) => {
    const merged = mergeOutreachTiming(outreachTiming);
    const next = { ...readPrefs(), outreachTiming: merged };
    writePrefs(next);
    set({ outreachTiming: merged, timingSaveMessage: 'saved' });
    setTimeout(() => {
      if (get().timingSaveMessage === 'saved') {
        set({ timingSaveMessage: null });
      }
    }, 3000);
  },

  setServiceCategories: (serviceId, categories) => {
    const current = readPrefs().serviceTemplateCategories ?? {};
    const next = {
      ...readPrefs(),
      serviceTemplateCategories: {
        ...current,
        [serviceId]: categories,
      },
    };
    writePrefs(next);
    set({ serviceTemplateCategories: next.serviceTemplateCategories });
  },
}));
