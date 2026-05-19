const { app, safeStorage } = require('electron');
const fs = require('fs');
const path = require('path');

const STORAGE_FILE = 'secure-auth-storage.json';
const FLAGS_FILE = 'auth-flags.json';

function getStoragePath() {
  return path.join(app.getPath('userData'), STORAGE_FILE);
}

function getFlagsPath() {
  return path.join(app.getPath('userData'), FLAGS_FILE);
}

function readEncryptedFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  if (!raw) {
    return null;
  }

  if (safeStorage.isEncryptionAvailable()) {
    try {
      const decrypted = safeStorage.decryptString(Buffer.from(raw, 'base64'));
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeEncryptedFile(filePath, data) {
  const json = JSON.stringify(data);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(json);
    fs.writeFileSync(filePath, encrypted.toString('base64'), 'utf8');
    return;
  }

  fs.writeFileSync(filePath, json, 'utf8');
}

function readStore() {
  return readEncryptedFile(getStoragePath()) ?? {};
}

function writeStore(store) {
  writeEncryptedFile(getStoragePath(), store);
}

function getItem(key) {
  const store = readStore();
  return store[key] ?? null;
}

function setItem(key, value) {
  const store = readStore();
  store[key] = value;
  writeStore(store);
}

function removeItem(key) {
  const store = readStore();
  delete store[key];
  writeStore(store);
}

function clearAll() {
  if (fs.existsSync(getStoragePath())) {
    fs.unlinkSync(getStoragePath());
  }
}

function getFlags() {
  return readEncryptedFile(getFlagsPath()) ?? { hasEverLoggedIn: false };
}

function setFlags(flags) {
  writeEncryptedFile(getFlagsPath(), flags);
}

module.exports = {
  getItem,
  setItem,
  removeItem,
  clearAll,
  getFlags,
  setFlags,
};
