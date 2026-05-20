import { create } from 'zustand';

const STORAGE_KEY = 'outreachos_preferences';

const DEFAULT_PREFS = {
  theme: 'dark',
  autoStart: false,
  /** serviceId -> template category names (#13) */
  serviceTemplateCategories: {},
};

function readPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function writePrefs(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export const usePreferencesStore = create((set, get) => ({
  ...readPrefs(),
  initialized: false,
  autoStartAvailable: typeof window !== 'undefined' && !!window.electronAPI?.autoLaunch,

  initialize: async () => {
    const prefs = readPrefs();
    applyTheme(prefs.theme);

    let autoStart = prefs.autoStart;
    if (window.electronAPI?.autoLaunch) {
      try {
        const enabled = await window.electronAPI.autoLaunch.isEnabled();
        autoStart = enabled;
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
    if (window.electronAPI?.autoLaunch) {
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
