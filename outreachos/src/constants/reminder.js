export const REMINDER_INTERVAL_OPTIONS = [
  { value: 15, label: 'Every 15 minutes' },
  { value: 30, label: 'Every 30 minutes' },
  { value: 60, label: 'Every hour' },
];

export const REMINDER_ADVANCE_OPTIONS = [
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
];

export const DEFAULT_REMINDER_SETTINGS = {
  universal_enabled: true,
  check_interval_mins: 30,
  advance_notice_mins: 60,
  overdue_alerts: true,
};
