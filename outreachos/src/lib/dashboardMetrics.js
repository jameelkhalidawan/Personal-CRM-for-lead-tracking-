import { expandLeadsByContact } from './leadExpansion';
import {
  filterActivitiesForContact,
  getOutreachContactsForBusiness,
} from './leadModel';
import { getActivityChannel, isEmailOutreachActivity, isPhoneOutreachActivity } from './outreachChannel';

function pct(numerator, denominator) {
  if (!denominator) return null;
  return Math.round((numerator / denominator) * 100);
}

function formatRate(p) {
  if (p == null) return '—';
  return `${p}%`;
}

function contactHasClosedWon(activities, business) {
  if (activities.some((a) => a.type === 'closed')) return true;
  return business.status === 'closed_won';
}

function getWinningChannel(activities) {
  const closedActs = [...activities]
    .filter((a) => a.type === 'closed')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  for (const a of closedActs) {
    const ch = getActivityChannel(a);
    if (ch) return ch;
  }
  return '';
}

function contactHadPhoneOutreach(activities) {
  return activities.some(isPhoneOutreachActivity);
}

function contactHadEmailOutreach(activities) {
  return activities.some(isEmailOutreachActivity);
}

/**
 * Dashboard headline metrics (per-contact leads + channel attribution).
 */
export function computeDashboardMetrics(businesses = [], dmsByBusiness = {}, activities = []) {
  const leads = expandLeadsByContact(businesses, dmsByBusiness);
  const totalLeads = leads.length;

  const activitiesByBusiness = {};
  for (const a of activities) {
    const bid = a.business_id;
    if (!bid) continue;
    if (!activitiesByBusiness[bid]) activitiesByBusiness[bid] = [];
    activitiesByBusiness[bid].push(a);
  }

  let wonDeals = 0;
  let phoneOutreachLeads = 0;
  let phoneClosedLeads = 0;
  let emailOutreachLeads = 0;
  let emailClosedLeads = 0;
  let closedWonLeads = 0;

  const wonBusinessIds = new Set();

  for (const { business, decisionMaker } of leads) {
    const bizActs = activitiesByBusiness[business.id] ?? [];
    const contactActs = decisionMaker
      ? filterActivitiesForContact(bizActs, decisionMaker.id)
      : bizActs;

    const won = contactHasClosedWon(contactActs, business);
    if (won) {
      closedWonLeads += 1;
      if (business.status === 'closed_won') wonBusinessIds.add(business.id);
    }

    if (won) wonDeals += 1;

    const hadPhone = contactHadPhoneOutreach(contactActs);
    const hadEmail = contactHadEmailOutreach(contactActs);
    if (hadPhone) phoneOutreachLeads += 1;
    if (hadEmail) emailOutreachLeads += 1;

    if (won) {
      const winChannel = getWinningChannel(contactActs);
      if (winChannel === 'phone') phoneClosedLeads += 1;
      else if (winChannel === 'email') emailClosedLeads += 1;
      else if (hadPhone && !hadEmail) phoneClosedLeads += 1;
      else if (hadEmail && !hadPhone) emailClosedLeads += 1;
    }
  }

  let activeProjectsValue = 0;
  for (const b of businesses ?? []) {
    if (b.status === 'closed_won') {
      activeProjectsValue += Number(b.estimated_value) || 0;
    }
  }

  return {
    totalLeads,
    wonDeals,
    callCloseRate: pct(phoneClosedLeads, phoneOutreachLeads),
    callCloseRateLabel: formatRate(pct(phoneClosedLeads, phoneOutreachLeads)),
    callCloseSub:
      phoneOutreachLeads > 0
        ? `${phoneClosedLeads} won of ${phoneOutreachLeads} with calls · uses logged channel`
        : 'No call outreach yet',
    emailCloseRate: pct(emailClosedLeads, emailOutreachLeads),
    emailCloseRateLabel: formatRate(pct(emailClosedLeads, emailOutreachLeads)),
    emailCloseSub:
      emailOutreachLeads > 0
        ? `${emailClosedLeads} won of ${emailOutreachLeads} with email · uses logged channel`
        : 'No email outreach yet',
    conversionRate: pct(closedWonLeads, totalLeads),
    conversionRateLabel: formatRate(pct(closedWonLeads, totalLeads)),
    conversionSub:
      totalLeads > 0 ? `${closedWonLeads} won of ${totalLeads} leads` : 'No leads yet',
    activeProjectsValue,
    wonBusinessCount: wonBusinessIds.size,
  };
}
