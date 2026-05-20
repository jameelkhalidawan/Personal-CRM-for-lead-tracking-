/** Map Supabase errors to migration guidance for in-app banners */
export function getMigrationHint(errorMessage) {
  const msg = String(errorMessage ?? '').toLowerCase();
  if (!msg) return null;

  if (msg.includes('call_templates')) {
    return 'supabase/migrations/20260521_call_templates.sql';
  }
  if (msg.includes('outreach_channel')) {
    return 'supabase/migrations/20260520_outreach_channel.sql';
  }
  if (
    msg.includes('template_id') ||
    msg.includes('call_template_id') ||
    msg.includes('call_script_id')
  ) {
    return 'supabase/migrations/20260522_activity_templates.sql';
  }
  if (msg.includes('email_templates')) {
    return 'supabase/schema.sql (email_templates section) or re-run seeds';
  }
  if (msg.includes('is_primary') && msg.includes('decision_makers')) {
    return 'supabase/migrations/20260519_lead_processing.sql';
  }
  return null;
}
