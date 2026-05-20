import { BUSINESS_STATUSES } from '../constants/business';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export function computeDashboardStats(businesses) {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const byStatus = Object.fromEntries(BUSINESS_STATUSES.map((s) => [s.value, 0]));
  let overdue = 0;
  let dueToday = 0;
  let pipelineValue = 0;
  let activeLeads = 0;

  for (const b of businesses ?? []) {
    byStatus[b.status] = (byStatus[b.status] ?? 0) + 1;
    pipelineValue += Number(b.estimated_value) || 0;
    if (!['closed_won', 'closed_lost', 'not_interested'].includes(b.status)) {
      activeLeads += 1;
    }
    if (b.next_followup_at) {
      const t = new Date(b.next_followup_at);
      if (t < todayStart) overdue += 1;
      else if (t >= todayStart && t <= todayEnd) dueToday += 1;
    }
  }

  return {
    total: businesses?.length ?? 0,
    activeLeads,
    byStatus,
    overdue,
    dueToday,
    pipelineValue,
  };
}

export function getFollowUpBuckets(businesses) {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const overdue = [];
  const dueToday = [];
  const upcoming = [];

  for (const b of businesses ?? []) {
    if (!b.next_followup_at) continue;
    const t = new Date(b.next_followup_at);
    if (['closed_won', 'closed_lost', 'not_interested'].includes(b.status)) continue;
    if (t < todayStart) overdue.push(b);
    else if (t <= todayEnd) dueToday.push(b);
    else upcoming.push(b);
  }

  const byFollowUp = (a, b) =>
    new Date(a.next_followup_at).getTime() - new Date(b.next_followup_at).getTime();

  overdue.sort(byFollowUp);
  dueToday.sort(byFollowUp);
  upcoming.sort(byFollowUp);

  return {
    overdue: overdue.slice(0, 12),
    dueToday: dueToday.slice(0, 12),
    upcoming: upcoming.slice(0, 6),
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
