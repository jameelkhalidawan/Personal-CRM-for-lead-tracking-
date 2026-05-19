const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const authStorage = require('./authStorage.cjs');

const isDev = !app.isPackaged;
const VITE_DEV_SERVER_URL = 'http://localhost:5173';

function registerAuthIpc() {
  ipcMain.handle('auth-storage:get', (_event, key) => {
    return authStorage.getItem(key);
  });

  ipcMain.handle('auth-storage:set', (_event, key, value) => {
    authStorage.setItem(key, value);
    return true;
  });

  ipcMain.handle('auth-storage:remove', (_event, key) => {
    authStorage.removeItem(key);
    return true;
  });

  ipcMain.handle('auth-storage:clear', () => {
    authStorage.clearAll();
    return true;
  });

  ipcMain.handle('auth-flags:get', () => {
    return authStorage.getFlags();
  });

  ipcMain.handle('auth-flags:set', (_event, flags) => {
    authStorage.setFlags(flags);
    return true;
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0A0A0F',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  registerAuthIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
