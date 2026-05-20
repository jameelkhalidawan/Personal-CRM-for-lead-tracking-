import { getFollowUpInsight } from './followUpInsight';
import { pickPrimaryContact } from './contactPick';
import { getLeadTitle, getLeadContext } from './leadModel';

export function buildInsightsByBusinessId(
  businesses = [],
  activitiesByBusiness = {},
  dmsByBusiness = {},
) {
  const map = {};
  for (const b of businesses) {
    const dms = dmsByBusiness[b.id] ?? [];
    const primary = pickPrimaryContact(dms, b);
    const insight = getFollowUpInsight(b, activitiesByBusiness[b.id] ?? [], dms);
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
