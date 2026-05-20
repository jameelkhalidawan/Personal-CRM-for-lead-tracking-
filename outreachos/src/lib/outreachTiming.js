import { DEFAULT_OUTREACH_TIMING } from '../constants/outreachTiming';

const PREFS_STORAGE_KEY = 'outreachos_preferences';

export function mergeOutreachTiming(stored = {}) {
  return { ...DEFAULT_OUTREACH_TIMING, ...stored };
}

export function readOutreachTimingFromStorage() {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return mergeOutreachTiming();
    const prefs = JSON.parse(raw);
    return mergeOutreachTiming(prefs.outreachTiming);
  } catch {
    return mergeOutreachTiming();
  }
}

export function getCallOutcomeDays(timing, actionId) {
  const t = mergeOutreachTiming(timing);
  const map = {
    no_answer: t.callNoAnswerDays,
    voicemail: t.callVoicemailDays,
    spoke_interested: t.callInterestedDays,
    spoke_not_now: t.callNotNowDays,
    wrong_number: 0,
  };
  return map[actionId] ?? 2;
}

export function getEmailOutcomeDays(timing, actionId) {
  const t = mergeOutreachTiming(timing);
  const map = {
    no_reply: t.emailNoReplyDays,
    bounced: 0,
    opened_no_reply: t.emailOpenedNoReplyDays,
    replied_interested: t.emailRepliedInterestedDays,
    replied_not_now: t.emailRepliedNotNowDays,
  };
  return map[actionId] ?? 3;
}
