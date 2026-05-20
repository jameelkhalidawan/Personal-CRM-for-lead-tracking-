import { OUTCOME_ACTIVITY_TYPES } from '../constants/activity';
import { BUSINESS_STATUSES } from '../constants/business';
import {
  filterActivitiesForContact,
  getOutreachContactsForBusiness,
} from './leadModel';

const OUTREACH_TYPES = new Set(['cold_email', 'followup_email', 'call']);
const REPLY_TYPES = new Set(['interested']);
const MEETING_TYPES = new Set(['meeting']);
const PROPOSAL_TYPES = new Set(['proposal']);
const CLOSED_TYPES = new Set(['closed']);

const TERMINAL = new Set(['closed_won', 'closed_lost', 'not_interested']);

function sortAsc(activities) {
  return [...activities].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

function pct(numerator, denominator) {
  if (!denominator) return null;
  return Math.round((numerator / denominator) * 100);
}

function normalizeNiche(niche) {
  const n = String(niche ?? '').trim();
  return n || 'Uncategorized';
}

function daysBetween(a, b) {
  const ms = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return Math.floor(ms / 86400000);
}

/** Build flat contact leads with activities */
function buildContactLeads(businesses, dmsByBusiness, activities) {
  const leads = [];

  for (const business of businesses ?? []) {
    const dms = dmsByBusiness[business.id] ?? [];
    const bizActivities = (activities ?? []).filter((a) => a.business_id === business.id);
    const contacts = getOutreachContactsForBusiness(business, dms);

    for (const dm of contacts) {
      const contactActs = filterActivitiesForContact(bizActivities, dm.id);
      leads.push({
        business,
        decisionMaker: dm,
        activities: sortAsc(contactActs),
        niche: normalizeNiche(business.niche),
      });
    }
  }

  return leads;
}

function contactReachedStage(lead, stage) {
  const { activities, business } = lead;
  const has = (types) => activities.some((a) => types.has(a.type));

  switch (stage) {
    case 'firstMessage':
      return has(OUTREACH_TYPES);
    case 'reply':
      return has(REPLY_TYPES);
    case 'meeting':
      return has(MEETING_TYPES);
    case 'proposal':
      return has(PROPOSAL_TYPES);
    case 'closed':
      return has(CLOSED_TYPES) || business.status === 'closed_won';
    default:
      return false;
  }
}

export function computeCoreFunnel(leads) {
  const stages = [
    { key: 'leads', label: 'Leads added' },
    { key: 'firstMessage', label: 'First message sent' },
    { key: 'reply', label: 'Replies received' },
    { key: 'meeting', label: 'Discovery calls' },
    { key: 'proposal', label: 'Proposals sent' },
    { key: 'closed', label: 'Deals closed' },
  ];

  const counts = {
    leads: leads.length,
    firstMessage: leads.filter((l) => contactReachedStage(l, 'firstMessage')).length,
    reply: leads.filter((l) => contactReachedStage(l, 'reply')).length,
    meeting: leads.filter((l) => contactReachedStage(l, 'meeting')).length,
    proposal: leads.filter((l) => contactReachedStage(l, 'proposal')).length,
    closed: leads.filter((l) => contactReachedStage(l, 'closed')).length,
  };

  const keys = ['leads', 'firstMessage', 'reply', 'meeting', 'proposal', 'closed'];
  let prev = counts.leads;

  return stages.map((stage, i) => {
    const count = counts[stage.key];
    const conversion =
      i === 0 ? null : pct(count, prev);
    if (i > 0) prev = count || prev;
    return {
      stage: stage.label,
      count,
      conversion,
      conversionLabel: conversion == null ? '—' : `${conversion}%`,
    };
  });
}

export function computeNicheAnalytics(leads) {
  const byNiche = {};

  for (const lead of leads) {
    const niche = lead.niche;
    if (!byNiche[niche]) {
      byNiche[niche] = {
        niche,
        leads: 0,
        outreach: 0,
        replies: 0,
        closed: 0,
        dealValueSum: 0,
        dealCount: 0,
      };
    }
    const row = byNiche[niche];
    row.leads += 1;
    if (contactReachedStage(lead, 'firstMessage')) row.outreach += 1;
    if (contactReachedStage(lead, 'reply')) row.replies += 1;
    if (contactReachedStage(lead, 'closed')) {
      row.closed += 1;
      const val = Number(lead.business.estimated_value) || 0;
      if (val > 0) {
        row.dealValueSum += val;
        row.dealCount += 1;
      }
    }
  }

  return Object.values(byNiche)
    .map((row) => ({
      niche: row.niche,
      leads: row.leads,
      replyRate: pct(row.replies, row.outreach),
      replyRateLabel: row.outreach ? `${pct(row.replies, row.outreach)}%` : '—',
      closeRate: pct(row.closed, row.leads),
      closeRateLabel: row.leads ? `${pct(row.closed, row.leads)}%` : '—',
      avgDealSize: row.dealCount ? Math.round(row.dealValueSum / row.dealCount) : null,
    }))
    .sort((a, b) => b.leads - a.leads);
}

function followupIndexBeforeReply(activities) {
  const reply = activities.find((a) => REPLY_TYPES.has(a.type));
  if (!reply) return null;

  const replyTime = new Date(reply.created_at).getTime();
  const before = activities.filter(
    (a) => new Date(a.created_at).getTime() < replyTime && OUTREACH_TYPES.has(a.type),
  );

  const followupCount = before.filter((a) => a.type === 'followup_email').length;
  const hadCold = before.some((a) => a.type === 'cold_email');

  if (followupCount === 0 && (hadCold || before.some((a) => a.type === 'call'))) {
    return 0;
  }
  return followupCount;
}

export function computeFollowUpTouchAnalytics(leads) {
  const labels = [
    'Initial message',
    'Follow-up 1',
    'Follow-up 2',
    'Follow-up 3',
    'Follow-up 4+',
  ];
  const counts = [0, 0, 0, 0, 0];

  for (const lead of leads) {
    const idx = followupIndexBeforeReply(lead.activities);
    if (idx == null) continue;
    const bucket = idx >= 4 ? 4 : idx;
    counts[bucket] += 1;
  }

  return labels.map((label, i) => ({
    touch: label,
    replies: counts[i],
  }));
}

const DELAY_BUCKETS = [
  { label: '1 day', min: 0, max: 1 },
  { label: '2 days', min: 2, max: 2 },
  { label: '3 days', min: 3, max: 3 },
  { label: '4–6 days', min: 4, max: 6 },
  { label: '7 days', min: 7, max: 7 },
  { label: '8–14 days', min: 8, max: 14 },
  { label: '15+ days', min: 15, max: 999 },
];

export function computeFollowUpDelayAnalytics(leads) {
  const buckets = DELAY_BUCKETS.map((b) => ({
    delay: b.label,
    total: 0,
    converted: 0,
    conversion: null,
    conversionLabel: '—',
  }));

  for (const lead of leads) {
    const acts = lead.activities;
    const reply = acts.find((a) => REPLY_TYPES.has(a.type));
    if (!reply) continue;

    const replyTime = new Date(reply.created_at).getTime();
    const outreachBefore = acts.filter(
      (a) =>
        new Date(a.created_at).getTime() < replyTime && OUTREACH_TYPES.has(a.type),
    );
    if (!outreachBefore.length) continue;

    const lastOutreach = outreachBefore[outreachBefore.length - 1];
    const days = daysBetween(lastOutreach.created_at, reply.created_at);

    const converted = contactReachedStage(lead, 'meeting') || contactReachedStage(lead, 'closed');

    const bucketIdx = DELAY_BUCKETS.findIndex(
      (b) => days >= b.min && days <= b.max,
    );
    if (bucketIdx < 0) continue;

    buckets[bucketIdx].total += 1;
    if (converted) buckets[bucketIdx].converted += 1;
  }

  return buckets.map((b) => ({
    ...b,
    conversion: b.total ? pct(b.converted, b.total) : null,
    conversionLabel: b.total ? `${pct(b.converted, b.total)}%` : '—',
  }));
}

export function computeSummaryMetrics(businesses, leads) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let activeDeals = 0;
  let monthlyCloses = 0;
  let revenue = 0;
  let pipelineValue = 0;

  for (const b of businesses ?? []) {
    pipelineValue += Number(b.estimated_value) || 0;
    if (!TERMINAL.has(b.status)) activeDeals += 1;
    if (b.status === 'closed_won') {
      revenue += Number(b.estimated_value) || 0;
    }
  }

  for (const lead of leads) {
    if (!contactReachedStage(lead, 'closed')) continue;
    const closedAct = lead.activities.find((a) => CLOSED_TYPES.has(a.type));
    const closedAt = closedAct
      ? new Date(closedAct.created_at)
      : lead.business.status === 'closed_won'
        ? new Date(lead.business.updated_at ?? lead.business.created_at)
        : null;
    if (closedAt && closedAt >= monthStart) monthlyCloses += 1;
  }

  const outreach = leads.filter((l) => contactReachedStage(l, 'firstMessage')).length;
  const replies = leads.filter((l) => contactReachedStage(l, 'reply')).length;
  const closed = leads.filter((l) => contactReachedStage(l, 'closed')).length;

  return {
    totalLeads: leads.length,
    activeDeals,
    monthlyCloses,
    revenue,
    pipelineValue,
    replyRate: pct(replies, outreach),
    replyRateLabel: outreach ? `${pct(replies, outreach)}%` : '—',
    closeRate: pct(closed, leads.length),
    closeRateLabel: leads.length ? `${pct(closed, leads.length)}%` : '—',
  };
}

export function computeMonthlyActivity(businesses, activities) {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
      outreach: 0,
      outcomes: 0,
      closes: 0,
      revenue: 0,
    });
  }

  for (const a of activities ?? []) {
    const t = new Date(a.created_at);
    const key = `${t.getFullYear()}-${t.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (!bucket) continue;
    if (OUTREACH_TYPES.has(a.type)) bucket.outreach += 1;
    if (OUTCOME_ACTIVITY_TYPES.includes(a.type)) bucket.outcomes += 1;
    if (CLOSED_TYPES.has(a.type)) bucket.closes += 1;
  }

  for (const b of businesses ?? []) {
    if (b.status !== 'closed_won') continue;
    const t = new Date(b.updated_at ?? b.created_at);
    const key = `${t.getFullYear()}-${t.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.revenue += Number(b.estimated_value) || 0;
  }

  return months;
}

const BOTTLENECK_HINTS = {
  'First message sent': 'More outreach volume — log calls and cold emails.',
  'Replies received': 'Improve subject lines, offer, and personalization.',
  'Discovery calls': 'Stronger reply handling — book calls while interest is hot.',
  'Proposals sent': 'Qualify harder on calls before sending proposals.',
  'Deals closed': 'Pricing, trust, or offer fit — revisit proposal and follow-up.',
};

export function computeFunnelInsights(funnel) {
  const withConversion = funnel
    .map((row, i) => ({ ...row, index: i }))
    .filter((row, i) => i > 0 && row.conversion != null && row.count > 0);

  if (!withConversion.length) {
    return { bottleneck: null, strongest: null };
  }

  const sorted = [...withConversion].sort((a, b) => a.conversion - b.conversion);
  const weakest = sorted[0];
  const strongest = [...withConversion].sort((a, b) => b.conversion - a.conversion)[0];

  return {
    bottleneck: {
      stage: weakest.stage,
      conversion: weakest.conversionLabel,
      hint: BOTTLENECK_HINTS[weakest.stage] ?? 'Review this stage in your process.',
    },
    strongest: {
      stage: strongest.stage,
      conversion: strongest.conversionLabel,
    },
  };
}

export function computeActivityBreakdown(activities) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  const counts = {
    calls: { week: 0, all: 0 },
    emails: { week: 0, all: 0 },
    outcomes: { week: 0, all: 0 },
    notes: { week: 0, all: 0 },
  };

  for (const a of activities ?? []) {
    const t = new Date(a.created_at);
    const inWeek = t >= weekStart;

    if (a.type === 'call') {
      counts.calls.all += 1;
      if (inWeek) counts.calls.week += 1;
    } else if (a.type === 'cold_email' || a.type === 'followup_email') {
      counts.emails.all += 1;
      if (inWeek) counts.emails.week += 1;
    } else if (OUTCOME_ACTIVITY_TYPES.includes(a.type)) {
      counts.outcomes.all += 1;
      if (inWeek) counts.outcomes.week += 1;
    } else if (a.type === 'note' || a.type === 'whatsapp') {
      counts.notes.all += 1;
      if (inWeek) counts.notes.week += 1;
    }
  }

  return [
    { label: 'Calls', week: counts.calls.week, total: counts.calls.all, color: 'call' },
    { label: 'Emails', week: counts.emails.week, total: counts.emails.all, color: 'email' },
    { label: 'Outcomes', week: counts.outcomes.week, total: counts.outcomes.all, color: 'outcome' },
    { label: 'Notes / other', week: counts.notes.week, total: counts.notes.all, color: 'note' },
  ];
}

export function computeContactWorkload(leads) {
  let cold = 0;
  let engaged = 0;
  let noOutreach = 0;
  let closed = 0;
  let awaitingFollowUp = 0;

  for (const lead of leads) {
    if (contactReachedStage(lead, 'closed')) {
      closed += 1;
      continue;
    }
    if (contactReachedStage(lead, 'reply') || contactReachedStage(lead, 'meeting')) {
      engaged += 1;
      continue;
    }
    if (contactReachedStage(lead, 'firstMessage')) {
      cold += 1;
      if (lead.decisionMaker?.next_followup_at) awaitingFollowUp += 1;
      continue;
    }
    noOutreach += 1;
  }

  return [
    { key: 'cold', label: 'In cold outreach', count: cold, desc: 'Outreach started, no reply yet' },
    { key: 'engaged', label: 'Engaged', count: engaged, desc: 'Replied or meeting logged' },
    { key: 'awaiting', label: 'Follow-up scheduled', count: awaitingFollowUp, desc: 'Has next follow-up date' },
    { key: 'noOutreach', label: 'Not started', count: noOutreach, desc: 'No outreach logged yet' },
    { key: 'closed', label: 'Closed', count: closed, desc: 'Won or deal closed' },
  ];
}

export function computePipelineSnapshot(businesses) {
  const counts = Object.fromEntries(BUSINESS_STATUSES.map((s) => [s.value, 0]));
  for (const b of businesses ?? []) {
    const key = b.status in counts ? b.status : 'new';
    counts[key] += 1;
  }
  return BUSINESS_STATUSES.map((s) => ({
    status: s.value,
    label: s.label,
    count: counts[s.value] ?? 0,
  })).filter((r) => r.count > 0);
}

export function computeTopNiches(niches) {
  const withData = niches.filter((n) => n.leads >= 1);
  if (!withData.length) return { bestReply: null, bestClose: null, needsWork: null };

  const byReply = [...withData].sort((a, b) => (b.replyRate ?? 0) - (a.replyRate ?? 0));
  const byClose = [...withData].sort((a, b) => (b.closeRate ?? 0) - (a.closeRate ?? 0));
  const needsWork = [...withData]
    .filter((n) => n.leads >= 2 && (n.replyRate ?? 0) < 10)
    .sort((a, b) => a.leads - b.leads)[0];

  return {
    bestReply: byReply[0] ?? null,
    bestClose: byClose[0] ?? null,
    needsWork: needsWork ?? (byReply[byReply.length - 1]?.leads >= 2 ? byReply[byReply.length - 1] : null),
  };
}

export function computeFullAnalyticsReport(businesses, dmsByBusiness, activities) {
  const leads = buildContactLeads(businesses, dmsByBusiness, activities);
  const funnel = computeCoreFunnel(leads);
  const niches = computeNicheAnalytics(leads);

  return {
    summary: computeSummaryMetrics(businesses, leads),
    funnel,
    funnelInsights: computeFunnelInsights(funnel),
    niches,
    topNiches: computeTopNiches(niches),
    followUpTouches: computeFollowUpTouchAnalytics(leads),
    followUpDelays: computeFollowUpDelayAnalytics(leads),
    monthlyActivity: computeMonthlyActivity(businesses, activities),
    activityBreakdown: computeActivityBreakdown(activities),
    contactWorkload: computeContactWorkload(leads),
    pipelineSnapshot: computePipelineSnapshot(businesses),
  };
}
