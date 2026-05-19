/**
 * Supabase-compatible async storage backed by Electron safeStorage (IPC).
 * Falls back to localStorage when running in browser-only dev.
 */

const memoryFallback = new Map();

function useElectronStorage() {
  return typeof window !== 'undefined' && window.electronAPI?.authStorage;
}

export const electronAuthStorage = {
  getItem: async (key) => {
    if (useElectronStorage()) {
      return window.electronAPI.authStorage.getItem(key);
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return memoryFallback.get(key) ?? null;
  },
  setItem: async (key, value) => {
    if (useElectronStorage()) {
      await window.electronAPI.authStorage.setItem(key, value);
      return;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
    memoryFallback.set(key, value);
  },
  removeItem: async (key) => {
    if (useElectronStorage()) {
      await window.electronAPI.authStorage.removeItem(key);
      return;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
    memoryFallback.delete(key);
  },
};

export async function clearElectronAuthStorage() {
  if (useElectronStorage()) {
    await window.electronAPI.authStorage.clear();
    return;
  }
  if (typeof localStorage !== 'undefined') {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith('sb-'),
    );
    keys.forEach((k) => localStorage.removeItem(k));
    return;
  }
  memoryFallback.clear();
}

export async function getAuthFlags() {
  if (window.electronAPI?.authFlags) {
    return window.electronAPI.authFlags.get();
  }
  return {
    hasEverLoggedIn: localStorage.getItem('outreachos_has_ever_logged_in') === 'true',
  };
}

export async function setAuthFlags(flags) {
  if (window.electronAPI?.authFlags) {
    await window.electronAPI.authFlags.set(flags);
    return;
  }
  localStorage.setItem(
    'outreachos_has_ever_logged_in',
    flags.hasEverLoggedIn ? 'true' : 'false',
  );
}
