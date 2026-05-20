const AutoLaunch = require('electron-auto-launch');

let autoLauncher = null;

function getLauncher() {
  if (!autoLauncher) {
    autoLauncher = new AutoLaunch({
      name: 'OutreachOS',
      path: process.execPath,
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
