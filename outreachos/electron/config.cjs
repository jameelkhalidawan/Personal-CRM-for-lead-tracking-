const { app } = require('electron');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = 'supabase-config.json';

function getConfigPath() {
  return path.join(app.getPath('userData'), CONFIG_FILE);
}

function readConfig() {
  const filePath = getConfigPath();
  if (!fs.existsSync(filePath)) {
    return { url: '', anonKey: '' };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return {
      url: String(raw.url ?? '').trim(),
      anonKey: String(raw.anonKey ?? '').trim(),
    };
  } catch {
    return { url: '', anonKey: '' };
  }
}

function writeConfig({ url, anonKey }) {
  const filePath = getConfigPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        url: String(url ?? '').trim(),
        anonKey: String(anonKey ?? '').trim(),
      },
      null,
      2,
    ),
    'utf8',
  );
  return readConfig();
}

function clearConfig() {
  const filePath = getConfigPath();
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  return { url: '', anonKey: '' };
}

module.exports = {
  readConfig,
  writeConfig,
  clearConfig,
  getConfigPath,
};
