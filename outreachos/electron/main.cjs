const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const authStorage = require('./authStorage.cjs');
const autoLaunch = require('./autoLaunch.cjs');
const appConfig = require('./config.cjs');
const userPrefs = require('./userPrefs.cjs');

const isDev = !app.isPackaged;
const VITE_DEV_SERVER_URL = 'http://localhost:5173';

let mainWindow = null;

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

function registerAutoLaunchIpc() {
  ipcMain.handle('auto-launch:get', () => autoLaunch.isEnabled());
  ipcMain.handle('auto-launch:set', (_event, enabled) => autoLaunch.setEnabled(enabled));
}

function registerUserPrefsIpc() {
  ipcMain.handle('user-prefs:get', () => userPrefs.readPrefs());
  ipcMain.handle('user-prefs:set', async (_event, partial) => {
    const next = userPrefs.writePrefs(partial ?? {});
    if (Object.prototype.hasOwnProperty.call(partial ?? {}, 'autoStart')) {
      await autoLaunch.setEnabled(Boolean(partial.autoStart));
    }
    return next;
  });
}

/** Re-apply Windows startup registration from persisted preference (survives reinstall path fixes). */
async function applyStoredAutoLaunch() {
  try {
    const prefs = userPrefs.readPrefs();
    if (prefs.autoStart) {
      await autoLaunch.setEnabled(true);
    }
  } catch (err) {
    console.error('[OutreachOS] auto-launch sync failed:', err);
  }
}

function registerConfigIpc() {
  ipcMain.handle('app-config:get', () => appConfig.readConfig());
  ipcMain.handle('app-config:set', (_event, payload) =>
    appConfig.writeConfig(payload ?? {}),
  );
  ipcMain.handle('app-config:clear', () => appConfig.clearConfig());
}

function registerReminderIpc() {
  ipcMain.handle('reminders:notify', (_event, { title, body, businessId }) => {
    if (!Notification.isSupported()) {
      return { ok: false, reason: 'not_supported' };
    }

    const notification = new Notification({
      title: title || 'OutreachOS',
      body: body || '',
      silent: false,
    });

    notification.on('click', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
        if (businessId) {
          mainWindow.webContents.send('reminders:open-business', businessId);
        }
      }
    });

    notification.show();
    return { ok: true };
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  registerAuthIpc();
  registerConfigIpc();
  registerReminderIpc();
  registerAutoLaunchIpc();
  registerUserPrefsIpc();
  await applyStoredAutoLaunch();
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
