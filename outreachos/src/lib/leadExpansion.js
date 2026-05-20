import { getOutreachContactsForBusiness } from './leadModel';

export function leadKey(businessId, decisionMakerId) {
  return `${businessId}:${decisionMakerId ?? 'none'}`;
}

/** One card/row per decision maker (company context kept on each lead). */
export function expandLeadsByContact(businesses = [], dmsByBusiness = {}) {
  const leads = [];

  for (const business of businesses) {
    const dms = dmsByBusiness[business.id] ?? [];
    const contacts = getOutreachContactsForBusiness(business, dms);

    if (!contacts.length) {
      leads.push({
        business,
        decisionMaker: null,
        key: leadKey(business.id, null),
      });
      continue;
    }

    for (const decisionMaker of contacts) {
      leads.push({
        business,
        decisionMaker,
        key: leadKey(business.id, decisionMaker.id),
      });
    }
  }

  return leads;
}
