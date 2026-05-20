const { app } = require('electron');
const fs = require('fs');
const path = require('path');

const PREFS_FILE = 'user-preferences.json';

const DEFAULTS = { autoStart: false };

function getPrefsPath() {
  return path.join(app.getPath('userData'), PREFS_FILE);
}

function readPrefs() {
  const filePath = getPrefsPath();
  if (!fs.existsSync(filePath)) {
    return { ...DEFAULTS };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return { ...DEFAULTS, ...raw };
  } catch {
    return { ...DEFAULTS };
  }
}

function writePrefs(prefs) {
  const filePath = getPrefsPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    JSON.stringify({ ...readPrefs(), ...prefs, updatedAt: Date.now() }, null, 2),
    'utf8',
  );
  return readPrefs();
}

module.exports = { readPrefs, writePrefs };
