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
});
