import { getFollowUpInsight } from './followUpInsight';
import { pickPrimaryContact } from './contactPick';
import {
  getLeadTitle,
  getLeadContext,
  getOutreachContactsForBusiness,
  getEffectiveFollowUpAt,
} from './leadModel';

export function contactInsightKey(businessId, decisionMakerId) {
  return `${businessId}:${decisionMakerId ?? 'none'}`;
}

export function buildInsightsByBusinessId(
  businesses = [],
  activitiesByBusiness = {},
  dmsByBusiness = {},
  timing,
) {
  const map = {};
  for (const b of businesses) {
    const dms = dmsByBusiness[b.id] ?? [];
    const primary = pickPrimaryContact(dms, b);
    const insight = getFollowUpInsight(
      b,
      activitiesByBusiness[b.id] ?? [],
      dms,
      timing,
      primary,
    );
    map[b.id] = {
      ...insight,
      contactName: primary?.name ?? null,
      contactId: primary?.id ?? null,
      leadTitle: getLeadTitle(primary, b),
      leadContext: getLeadContext(primary, b),
    };
  }
  return map;
}

/** Per-contact next step for nested business table rows */
export function buildInsightsByContactKey(
  businesses = [],
  activitiesByBusiness = {},
  dmsByBusiness = {},
  timing,
) {
  const map = {};
  for (const b of businesses) {
    const dms = dmsByBusiness[b.id] ?? [];
    const activities = activitiesByBusiness[b.id] ?? [];
    const contacts = getOutreachContactsForBusiness(b, dms);

    if (!contacts.length) {
      const key = contactInsightKey(b.id, null);
      map[key] = {
        ...getFollowUpInsight(b, activities, dms, timing, null),
        decisionMaker: null,
        lastContactedAt: b.last_contacted_at,
        nextFollowUpAt: b.next_followup_at,
      };
      continue;
    }

    for (const dm of contacts) {
      const key = contactInsightKey(b.id, dm.id);
      map[key] = {
        ...getFollowUpInsight(b, activities, dms, timing, dm),
        decisionMaker: dm,
        lastContactedAt: dm.last_contacted_at || b.last_contacted_at,
        nextFollowUpAt: getEffectiveFollowUpAt(dm, b),
      };
    }
  }
  return map;
}
