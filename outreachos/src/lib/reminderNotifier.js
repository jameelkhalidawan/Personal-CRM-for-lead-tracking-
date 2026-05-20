/**
 * Show a desktop notification (Electron native or browser fallback).
 */
export async function showReminderNotification({ title, body, businessId }) {
  if (window.electronAPI?.reminders?.notify) {
    const result = await window.electronAPI.reminders.notify({
      title,
      body,
      businessId,
    });
    return result?.ok ?? false;
  }

  if (typeof Notification === 'undefined') return false;

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if (Notification.permission !== 'granted') return false;

  const notification = new Notification(title, { body });
  notification.onclick = () => {
    window.focus();
    window.dispatchEvent(
      new CustomEvent('outreachos:open-business', { detail: { businessId } }),
    );
  };
  return true;
}
