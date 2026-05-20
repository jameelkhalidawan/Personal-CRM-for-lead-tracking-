const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  authStorage: {
    getItem: (key) => ipcRenderer.invoke('auth-storage:get', key),
    setItem: (key, value) => ipcRenderer.invoke('auth-storage:set', key, value),
    removeItem: (key) => ipcRenderer.invoke('auth-storage:remove', key),
    clear: () => ipcRenderer.invoke('auth-storage:clear'),
  },
  authFlags: {
    get: () => ipcRenderer.invoke('auth-flags:get'),
    set: (flags) => ipcRenderer.invoke('auth-flags:set', flags),
  },
  autoLaunch: {
    isEnabled: () => ipcRenderer.invoke('auto-launch:get'),
    setEnabled: (enabled) => ipcRenderer.invoke('auto-launch:set', enabled),
  },
  userPrefs: {
    get: () => ipcRenderer.invoke('user-prefs:get'),
    set: (partial) => ipcRenderer.invoke('user-prefs:set', partial),
  },
  appConfig: {
    get: () => ipcRenderer.invoke('app-config:get'),
    set: (payload) => ipcRenderer.invoke('app-config:set', payload),
    clear: () => ipcRenderer.invoke('app-config:clear'),
  },
  reminders: {
    notify: (payload) => ipcRenderer.invoke('reminders:notify', payload),
    onOpenBusiness: (callback) => {
      const handler = (_event, businessId) => callback(businessId);
      ipcRenderer.on('reminders:open-business', handler);
      return () => ipcRenderer.removeListener('reminders:open-business', handler);
    },
  },
});
