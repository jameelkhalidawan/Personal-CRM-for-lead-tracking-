import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useReminderStore } from '../stores/reminderStore';

export function useReminderScheduler() {
  const userId = useAuthStore((s) => s.user?.id);
  const { settings, loadSettings, runReminderCheck } = useReminderStore();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    loadSettings(userId);
  }, [userId, loadSettings]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!userId || !settings?.universal_enabled) return;

    const run = () => runReminderCheck();
    run();

    const ms = (settings.check_interval_mins ?? 30) * 60 * 1000;
    intervalRef.current = setInterval(run, ms);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId, settings?.universal_enabled, settings?.check_interval_mins, runReminderCheck]);
}
