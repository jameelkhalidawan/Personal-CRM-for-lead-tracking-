function hasValue(v) {
  return Boolean(String(v ?? '').trim());
}

/** Who we're reaching out to — decision maker first */
export function getLeadTitle(decisionMaker, business) {
  if (decisionMaker?.name) return decisionMaker.name;
  if (business?.business_name) return business.business_name;
  return 'Unknown lead';
}

/** Company / context line under the contact name */
export function getLeadContext(decisionMaker, business) {
  const parts = [];
  if (decisionMaker && business?.business_name) {
    parts.push(business.business_name);
  }
  if (business?.niche) parts.push(business.niche);
  if (decisionMaker?.role) parts.push(decisionMaker.role);
  return parts.join(' · ') || '—';
}

export function getEffectiveFollowUpAt(decisionMaker, business) {
  return decisionMaker?.next_followup_at || business?.next_followup_at || null;
}

export function contactHasChannel(decisionMaker, channel, business = null) {
  if (!decisionMaker) return false;
  if (channel === 'phone') {
    return hasValue(decisionMaker.phone_number) || hasValue(business?.phone_number);
  }
  if (channel === 'email') {
    return hasValue(decisionMaker.email) || hasValue(business?.business_email);
  }
  return (
    hasValue(decisionMaker.phone_number) ||
    hasValue(decisionMaker.email) ||
    hasValue(business?.phone_number) ||
    hasValue(business?.business_email)
  );
}

/** Activities logged for one decision maker (each contact is their own lead). */
export function filterActivitiesForContact(activities, decisionMakerId) {
  if (!decisionMakerId) return activities ?? [];
  return (activities ?? []).filter((a) => a.decision_maker_id === decisionMakerId);
}

function isReachableContact(decisionMaker, business) {
  if (!decisionMaker) return false;
  if (hasValue(decisionMaker.email) || hasValue(decisionMaker.phone_number)) return true;
  if (!hasValue(decisionMaker.name)) return false;
  return hasValue(business?.phone_number) || hasValue(business?.business_email);
}

/** All decision makers to process at this business (not just primary) */
export function getOutreachContactsForBusiness(business, decisionMakers = []) {
  const dms = decisionMakers ?? [];
  if (!dms.length) return [];

  const reachable = dms.filter((dm) => isReachableContact(dm, business));
  const list = reachable.length ? reachable : dms.filter((dm) => hasValue(dm.name));

  return [...list].sort((a, b) => {
    if (Boolean(a.is_primary) !== Boolean(b.is_primary)) {
      return a.is_primary ? -1 : 1;
    }
    const aDue = a.next_followup_at ? new Date(a.next_followup_at).getTime() : Infinity;
    const bDue = b.next_followup_at ? new Date(b.next_followup_at).getTime() : Infinity;
    if (aDue !== bDue) return aDue - bDue;
    return (a.name ?? '').localeCompare(b.name ?? '');
  });
}

export function countContactsAtBusiness(decisionMakers = []) {
  return (decisionMakers ?? []).filter((dm) => hasValue(dm.name)).length;
}

export function getContactReadiness(decisionMaker, business) {
  const issues = [];
  if (!decisionMaker) {
    issues.push('Add a contact');
    return { ready: false, issues };
  }
  if (!hasValue(decisionMaker.name)) issues.push('Contact name');
  const hasDirect =
    hasValue(decisionMaker.email) || hasValue(decisionMaker.phone_number);
  if (!hasDirect) issues.push('Contact phone or email');
  if (!hasValue(business?.niche)) issues.push('Business niche');
  return { ready: issues.length === 0, issues };
}
