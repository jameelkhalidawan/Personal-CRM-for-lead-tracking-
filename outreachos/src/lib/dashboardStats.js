import { BUSINESS_STATUSES } from '../constants/business';
import { classifyFollowUpDay } from './followUpSchedule';
import { getOutreachContactsForBusiness } from './leadModel';
import { leadKey } from './leadExpansion';

export function computeDashboardStats(businesses, dmsByBusiness = {}) {
  const byStatus = Object.fromEntries(BUSINESS_STATUSES.map((s) => [s.value, 0]));
  let pipelineValue = 0;
  let activeContacts = 0;

  const schedule = getTodayTomorrowBucketsByContact(businesses, dmsByBusiness);

  for (const b of businesses ?? []) {
    byStatus[b.status] = (byStatus[b.status] ?? 0) + 1;
    pipelineValue += Number(b.estimated_value) || 0;
  }

  for (const b of businesses ?? []) {
    if (['closed_won', 'closed_lost', 'not_interested'].includes(b.status)) continue;
    const contacts = getOutreachContactsForBusiness(b, dmsByBusiness[b.id] ?? []);
    activeContacts += contacts.length || 1;
  }

  const overdueToday = schedule.today.filter((i) => i.isOverdue).length;

  return {
    total: businesses?.length ?? 0,
    activeContacts,
    byStatus,
    todayActions: schedule.today.length,
    tomorrowPlanned: schedule.tomorrow.length,
    overdueToday,
    pipelineValue,
  };
}

/** Dashboard schedule: today (incl. overdue) + tomorrow only — per contact */
export function getTodayTomorrowBucketsByContact(businesses = [], dmsByBusiness = {}) {
  const today = [];
  const tomorrow = [];

  for (const business of businesses) {
    if (['closed_won', 'closed_lost', 'not_interested'].includes(business.status)) {
      continue;
    }

    const contacts = getOutreachContactsForBusiness(
      business,
      dmsByBusiness[business.id] ?? [],
    );
    const list = contacts.length ? contacts : [null];

    for (const decisionMaker of list) {
      const followUpAt = decisionMaker?.next_followup_at;
      if (!followUpAt) continue;

      const classified = classifyFollowUpDay(followUpAt);
      if (!classified) continue;

      const item = {
        business,
        decisionMaker,
        key: leadKey(business.id, decisionMaker?.id),
        followUpAt,
        isOverdue: classified.isOverdue,
      };

      if (classified.bucket === 'today') today.push(item);
      else if (classified.bucket === 'tomorrow') tomorrow.push(item);
    }
  }

  const sortToday = (a, b) => {
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    return new Date(a.followUpAt).getTime() - new Date(b.followUpAt).getTime();
  };
  const sortByTime = (a, b) =>
    new Date(a.followUpAt).getTime() - new Date(b.followUpAt).getTime();

  today.sort(sortToday);
  tomorrow.sort(sortByTime);

  return {
    today: today.slice(0, 24),
    tomorrow: tomorrow.slice(0, 16),
  };
}

export function groupBusinessesByStatus(businesses) {
  const groups = Object.fromEntries(BUSINESS_STATUSES.map((s) => [s.value, []]));
  for (const b of businesses ?? []) {
    const key = b.status in groups ? b.status : 'new';
    groups[key].push(b);
  }
  for (const status of Object.keys(groups)) {
    groups[status].sort((a, b) => {
      const pa = { high: 3, medium: 2, low: 1 }[b.priority] ?? 0;
      const pb = { high: 3, medium: 2, low: 1 }[a.priority] ?? 0;
      if (pa !== pb) return pa - pb;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }
  return groups;
}

export function groupLeadsByStatus(leads = []) {
  const groups = Object.fromEntries(BUSINESS_STATUSES.map((s) => [s.value, []]));

  for (const lead of leads) {
    const status = lead.business?.status;
    const key = status in groups ? status : 'new';
    groups[key].push(lead);
  }

  for (const status of Object.keys(groups)) {
    groups[status].sort((a, b) => {
      const pa = { high: 3, medium: 2, low: 1 }[b.business.priority] ?? 0;
      const pb = { high: 3, medium: 2, low: 1 }[a.business.priority] ?? 0;
      if (pa !== pb) return pa - pb;
      const nameA = a.decisionMaker?.name ?? a.business.business_name ?? '';
      const nameB = b.decisionMaker?.name ?? b.business.business_name ?? '';
      return nameA.localeCompare(nameB);
    });
  }

  return groups;
}
