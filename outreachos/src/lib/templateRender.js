/** Maps placeholder keys (normalized) to context field names */
const PLACEHOLDER_ALIASES = {
  business_name: 'business_name',
  business: 'business_name',
  company: 'business_name',
  niche: 'niche',
  business_email: 'business_email',
  company_email: 'business_email',
  decision_maker_name: 'decision_maker_name',
  decision_maker: 'decision_maker_name',
  contact_name: 'decision_maker_name',
  contact: 'decision_maker_name',
  name: 'decision_maker_name',
  decision_maker_email: 'decision_maker_email',
  contact_email: 'decision_maker_email',
  email: 'decision_maker_email',
  decision_maker_role: 'decision_maker_role',
  role: 'decision_maker_role',
  your_name: 'your_name',
  my_name: 'your_name',
  phone_number: 'phone_number',
  phone: 'phone_number',
  website_url: 'website_url',
  website: 'website_url',
  city: 'city',
  lead_source: 'lead_source',
};

export function buildTemplateContext({ business, decisionMaker, user }) {
  const b = business ?? {};
  const dm = decisionMaker ?? {};
  const meta = user?.user_metadata ?? {};

  return {
    business_name: b.business_name ?? '',
    niche: b.niche ?? '',
    business_email: b.business_email ?? '',
    website_url: b.website_url ?? '',
    phone_number: dm.phone_number ?? b.phone_number ?? '',
    city: b.city ?? '',
    lead_source: b.lead_source ?? '',
    decision_maker_name: dm.name ?? '',
    decision_maker_email: dm.email ?? '',
    decision_maker_role: dm.role ?? '',
    contact_name: dm.name ?? '',
    your_name:
      meta.full_name ?? meta.display_name ?? user?.email?.split('@')[0] ?? '',
  };
}

export function renderTemplate(text, context) {
  if (!text) return '';
  return text.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, rawKey) => {
    const normalized = rawKey.trim().toLowerCase().replace(/\s+/g, '_');
    const field = PLACEHOLDER_ALIASES[normalized] ?? normalized;
    const value = context[field];
    return value != null && value !== '' ? String(value) : '';
  });
}

export function formatEmailForNotes(subject, body) {
  const lines = [];
  if (subject?.trim()) lines.push(`Subject: ${subject.trim()}`);
  if (body?.trim()) {
    if (lines.length) lines.push('');
    lines.push(body.trim());
  }
  return lines.join('\n');
}

export function isEmailActivityType(type) {
  return type === 'cold_email' || type === 'followup_email';
}
