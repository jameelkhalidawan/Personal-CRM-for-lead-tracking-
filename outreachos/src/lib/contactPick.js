function hasValue(v) {
  return Boolean(String(v ?? '').trim());
}

/** Primary contact (#3), else preferred channel match, else first with email/phone */
export function pickPrimaryContact(decisionMakers = [], business = null) {
  const dms = decisionMakers ?? [];
  const primary = dms.find((d) => d.is_primary);
  if (primary) return primary;
  if (dms.length === 1) return dms[0];
  return dms[0] ?? null;
}

export function pickContactForChannel(channel, business, decisionMakers = []) {
  const dms = decisionMakers ?? [];
  const primary = dms.find((d) => d.is_primary);

  if (channel === 'phone') {
    if (primary?.phone_number && hasValue(primary.phone_number)) return primary.id;
    const preferred = dms.find(
      (d) => d.preferred_contact === 'phone' && hasValue(d.phone_number),
    );
    if (preferred) return preferred.id;
    const dm = dms.find((d) => hasValue(d.phone_number));
    return dm?.id ?? '';
  }

  if (channel === 'email') {
    if (primary?.email && hasValue(primary.email)) return primary.id;
    const preferred = dms.find(
      (d) => d.preferred_contact === 'email' && hasValue(d.email),
    );
    if (preferred) return preferred.id;
    const dm = dms.find((d) => hasValue(d.email));
    return dm?.id ?? '';
  }

  return primary?.id ?? dms[0]?.id ?? '';
}

export function getPrimaryContactId(decisionMakers = []) {
  const primary = (decisionMakers ?? []).find((d) => d.is_primary);
  if (primary) return primary.id;
  if (decisionMakers?.length === 1) return decisionMakers[0].id;
  return decisionMakers?.[0]?.id ?? '';
}
