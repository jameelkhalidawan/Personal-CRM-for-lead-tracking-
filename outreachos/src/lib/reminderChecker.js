const SENT_KEY = 'outreachos_reminder_sent';

function loadSentKeys() {
  try {
    const raw = localStorage.getItem(SENT_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveSentKeys(set) {
  const arr = [...set].slice(-500);
  localStorage.setItem(SENT_KEY, JSON.stringify(arr));
}

export function markReminderSent(dedupeKey) {
  const set = loadSentKeys();
  set.add(dedupeKey);
  saveSentKeys(set);
}

export function clearReminderSentKeys() {
  localStorage.removeItem(SENT_KEY);
}

/** Businesses that need a desktop notification right now */
export function getBusinessesToNotify(businesses, settings) {
  if (!settings?.universal_enabled) return [];

  const sent = loadSentKeys();
  const now = Date.now();
  const advanceMs = (settings.advance_notice_mins ?? 60) * 60 * 1000;
  const results = [];

  for (const business of businesses ?? []) {
    if (!business.next_followup_at) continue;
    if (['closed_won', 'closed_lost', 'not_interested'].includes(business.status)) {
      continue;
    }

    const followupMs = new Date(business.next_followup_at).getTime();
    if (Number.isNaN(followupMs)) continue;

    const dedupeKey = `${business.id}:${business.next_followup_at}`;
    if (sent.has(dedupeKey)) continue;

    if (followupMs < now && settings.overdue_alerts) {
      results.push({ business, kind: 'overdue', dedupeKey });
    } else if (followupMs >= now && followupMs - now <= advanceMs) {
      results.push({ business, kind: 'upcoming', dedupeKey });
    }
  }

  return results;
}

export function buildNotificationPayload({ business, kind }) {
  const when = new Date(business.next_followup_at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  if (kind === 'overdue') {
    return {
      title: `Overdue: ${business.business_name}`,
      body: `Follow-up was due ${when}. Open OutreachOS to take action.`,
      businessId: business.id,
    };
  }

  return {
    title: `Follow-up soon: ${business.business_name}`,
    body: `Scheduled for ${when}. Open OutreachOS to prepare.`,
    businessId: business.id,
  };
}
