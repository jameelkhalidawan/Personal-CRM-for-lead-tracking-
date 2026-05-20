import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import {
  DEFAULT_REMINDER_SETTINGS,
  REMINDER_ADVANCE_OPTIONS,
  REMINDER_INTERVAL_OPTIONS,
} from '../../constants/reminder';
import { clearReminderSentKeys } from '../../lib/reminderChecker';
import { showReminderNotification } from '../../lib/reminderNotifier';
import { useAuthStore } from '../../stores/authStore';
import { useReminderStore } from '../../stores/reminderStore';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Select } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function ReminderSettingsCard() {
  const userId = useAuthStore((s) => s.user?.id);
  const {
    settings,
    loading,
    saving,
    error,
    lastCheckAt,
    loadSettings,
    saveSettings,
    runReminderCheck,
    clearError,
  } = useReminderStore();

  const [form, setForm] = useState({ ...DEFAULT_REMINDER_SETTINGS });

  useEffect(() => {
    if (userId) loadSettings(userId);
  }, [userId, loadSettings]);

  useEffect(() => {
    if (settings) {
      setForm({
        universal_enabled: settings.universal_enabled,
        check_interval_mins: settings.check_interval_mins,
        advance_notice_mins: settings.advance_notice_mins,
        overdue_alerts: settings.overdue_alerts,
      });
    }
  }, [settings]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!userId) return;
    await saveSettings(userId, form);
  };

  const handleTestNotification = async () => {
    await showReminderNotification({
      title: 'OutreachOS test',
      body: 'Desktop reminders are working. Click to open the app.',
      businessId: null,
    });
  };

  const handleCheckNow = async () => {
    clearReminderSentKeys();
    await runReminderCheck();
  };

  const isElectron = window.electronAPI?.isElectron;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {form.universal_enabled ? (
            <Bell className="h-5 w-5 text-accent-secondary" />
          ) : (
            <BellOff className="h-5 w-5 text-text-muted" />
          )}
          <h2 className="text-h3 text-text-primary">Follow-up reminders</h2>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {error && (
          <p className="text-small text-priority-high">
            {error}{' '}
            <button type="button" className="underline" onClick={clearError}>
              Dismiss
            </button>
          </p>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-text-muted text-small">
            <LoadingSpinner size="sm" />
            Loading reminder settings…
          </div>
        ) : (
          <>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.universal_enabled}
                onChange={(e) => set('universal_enabled', e.target.checked)}
                className="h-4 w-4 rounded border-border accent-accent-primary"
              />
              <span className="text-body text-text-primary">
                Enable desktop reminders
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.overdue_alerts}
                onChange={(e) => set('overdue_alerts', e.target.checked)}
                disabled={!form.universal_enabled}
                className="h-4 w-4 rounded border-border accent-accent-primary"
              />
              <span className="text-body text-text-primary">
                Alert when follow-ups are overdue
              </span>
            </label>

            <Select
              label="Check frequency"
              value={String(form.check_interval_mins)}
              onChange={(e) => set('check_interval_mins', Number(e.target.value))}
              disabled={!form.universal_enabled}
            >
              {REMINDER_INTERVAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>

            <Select
              label="Advance notice"
              value={String(form.advance_notice_mins)}
              onChange={(e) => set('advance_notice_mins', Number(e.target.value))}
              disabled={!form.universal_enabled}
            >
              {REMINDER_ADVANCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>

            <p className="text-small text-text-muted">
              {isElectron
                ? 'Uses native Windows notifications while the app is running.'
                : 'Browser notifications are used when not running in Electron.'}
              {lastCheckAt && (
                <span className="block mt-1">
                  Last check: {new Date(lastCheckAt).toLocaleString()}
                </span>
              )}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={handleSave} loading={saving}>
                Save reminders
              </Button>
              <Button
                variant="secondary"
                onClick={handleCheckNow}
                disabled={!form.universal_enabled}
              >
                Check now
              </Button>
              <Button variant="ghost" onClick={handleTestNotification}>
                Test notification
              </Button>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
