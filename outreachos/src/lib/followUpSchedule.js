/** Local calendar-day key for reliable today / tomorrow bucketing */
export function getLocalDateKey(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function getTodayAndTomorrowKeys(now = new Date()) {
  const todayKey = getLocalDateKey(now);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowKey = getLocalDateKey(tomorrowDate);
  return { todayKey, tomorrowKey };
}

/**
 * Which dashboard bucket a follow-up belongs in.
 * - today: overdue or scheduled for today (local date)
 * - tomorrow: scheduled for tomorrow only
 * - null: later than tomorrow (hidden from dashboard actions)
 */
export function classifyFollowUpDay(followUpAt, now = new Date()) {
  const followKey = getLocalDateKey(followUpAt);
  const { todayKey, tomorrowKey } = getTodayAndTomorrowKeys(now);
  if (!followKey || !todayKey) return null;

  if (followKey < todayKey) return { bucket: 'today', isOverdue: true };
  if (followKey === todayKey) return { bucket: 'today', isOverdue: false };
  if (followKey === tomorrowKey) return { bucket: 'tomorrow', isOverdue: false };
  return null;
}
