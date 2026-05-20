const { app } = require('electron');
const AutoLaunch = require('electron-auto-launch');

let autoLauncher = null;

function getLauncher() {
  if (!autoLauncher) {
    const exePath = app.isPackaged ? app.getPath('exe') : process.execPath;
    autoLauncher = new AutoLaunch({
      name: 'OutreachOS',
      path: exePath,
      isHidden: false,
    });
  }
  return autoLauncher;
}

async function isEnabled() {
  try {
    return await getLauncher().isEnabled();
  } catch {
    return false;
  }
}

async function setEnabled(enabled) {
  const launcher = getLauncher();
  if (enabled) {
    await launcher.enable();
  } else {
    await launcher.disable();
  }
  return enabled;
}

module.exports = { isEnabled, setEnabled };
