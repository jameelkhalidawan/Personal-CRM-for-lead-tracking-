import { getFollowUpInsight } from './followUpInsight';
import { getPlaybookState } from './outreachSequence';
import { getLeadReadiness } from './leadReadiness';
import {
  contactHasChannel,
  getEffectiveFollowUpAt,
  getOutreachContactsForBusiness,
  getContactReadiness,
} from './leadModel';

function isDueAt(followUpAt, now = new Date()) {
  if (!followUpAt) return false;
  return new Date(followUpAt) <= now;
}

function isOverdueAt(followUpAt, now = new Date()) {
  if (!followUpAt) return false;
  const d = new Date(followUpAt);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return d < start;
}

function isDueTodayAt(followUpAt, now = new Date()) {
  if (!followUpAt) return false;
  const d = new Date(followUpAt);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return d >= start && d < end;
}

function matchesChannel(entry, channelFilter) {
  if (!channelFilter || channelFilter === 'all') return true;
  const state = entry.playbookState;
  const dm = entry.decisionMaker;
  if (state?.engaged) return true;

  const trackDue = (channel) => {
    const track = state?.tracks?.[channel];
    if (track?.current) return true;
    if (state?.currentSteps?.some((s) => s.channel === channel)) return true;
    return state?.channels?.[channel] && track && !track.allDone;
  };

  if (channelFilter === 'phone') {
    if (!contactHasChannel(dm, 'phone', entry.business) && !state?.channels?.phone) {
      return false;
    }
    return trackDue('phone');
  }
  if (channelFilter === 'email') {
    if (!contactHasChannel(dm, 'email', entry.business) && !state?.channels?.email) {
      return false;
    }
    return trackDue('email');
  }
  return true;
}

/**
 * Work queue keyed by decision maker (contact). Business is context on each item.
 */
export function buildWorkQueue(
  businesses = [],
  activitiesByBusiness = {},
  dmsByBusiness = {},
  { channelFilter = 'all', includeNotReady = true, timing } = {},
) {
  const now = new Date();
  const items = [];

  for (const business of businesses) {
    if (['closed_won', 'closed_lost'].includes(business.status)) continue;

    const activities = activitiesByBusiness[business.id] ?? [];
    const decisionMakers = dmsByBusiness[business.id] ?? [];
    const businessReadiness = getLeadReadiness(business, decisionMakers);
    const contacts = getOutreachContactsForBusiness(business, decisionMakers);

    if (!contacts.length) {
      if (!includeNotReady && !businessReadiness.ready) continue;
      const followUpAt = business.next_followup_at;
      const insight = getFollowUpInsight(business, activities, decisionMakers, timing, null);
      const playbookState = getPlaybookState(
        business,
        decisionMakers,
        activities,
        timing,
        null,
      );
      const entry = {
        id: `${business.id}:none`,
        decisionMaker: null,
        business,
        decisionMakers,
        activities,
        readiness: businessReadiness,
        contactReadiness: getContactReadiness(null, business),
        insight,
        playbookState,
        followUpAt,
        due: isDueAt(followUpAt, now),
        overdue: isOverdueAt(followUpAt, now),
        dueToday: isDueTodayAt(followUpAt, now),
      };
      if (matchesChannel(entry, channelFilter)) items.push(entry);
      continue;
    }

    for (const decisionMaker of contacts) {
      const contactReadiness = getContactReadiness(decisionMaker, business);
      if (!includeNotReady && !contactReadiness.ready) continue;

      const contactActivities = activities;
      const insight = getFollowUpInsight(
        business,
        contactActivities,
        decisionMakers,
        timing,
        decisionMaker,
      );
      const playbookState = getPlaybookState(
        business,
        decisionMakers,
        contactActivities,
        timing,
        decisionMaker,
      );

      const followUpAt =
        decisionMaker.next_followup_at || business.next_followup_at || null;
      const contactIndex = contacts.findIndex((c) => c.id === decisionMaker.id);
      const entry = {
        id: `${business.id}:${decisionMaker.id}`,
        decisionMaker,
        business,
        decisionMakers,
        activities: contactActivities,
        readiness: businessReadiness,
        contactReadiness,
        insight,
        playbookState,
        followUpAt,
        contactIndex: contactIndex >= 0 ? contactIndex + 1 : 1,
        contactTotal: contacts.length,
        due: isDueAt(followUpAt, now),
        overdue: isOverdueAt(followUpAt, now),
        dueToday: isDueTodayAt(followUpAt, now),
      };

      if (!matchesChannel(entry, channelFilter)) continue;
      items.push(entry);
    }
  }

  const sortFn = (a, b) => {
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
    if (a.dueToday !== b.dueToday) return a.dueToday ? -1 : 1;
    if (a.due !== b.due) return a.due ? -1 : 1;
    const fa = a.followUpAt ? new Date(a.followUpAt).getTime() : Infinity;
    const fb = b.followUpAt ? new Date(b.followUpAt).getTime() : Infinity;
    if (fa !== fb) return fa - fb;
    const nameA = a.decisionMaker?.name ?? a.business.business_name ?? '';
    const nameB = b.decisionMaker?.name ?? b.business.business_name ?? '';
    return nameA.localeCompare(nameB);
  };

  return items.sort(sortFn);
}
