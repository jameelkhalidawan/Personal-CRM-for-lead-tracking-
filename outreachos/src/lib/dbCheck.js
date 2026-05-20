import { getSupabase } from './supabase';

/**
 * Verifies core tables exist and optional migrations are applied.
 */
export async function verifyDatabaseSchema() {
  const supabase = getSupabase();

  const tables = [
    { name: 'services', expectedMin: 4 },
    { name: 'email_templates', expectedMin: 0 },
    { name: 'call_templates', expectedMin: 0 },
    { name: 'businesses', expectedMin: 0 },
    { name: 'activities', expectedMin: 0 },
  ];

  const results = [];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table.name)
      .select('*', { count: 'exact', head: true });

    if (error) {
      results.push({
        table: table.name,
        ok: false,
        count: null,
        message: error.message,
      });
      continue;
    }

    const rowCount = count ?? 0;
    const meetsSeed =
      table.expectedMin === 0 || rowCount >= table.expectedMin;

    results.push({
      table: table.name,
      ok: meetsSeed,
      count: rowCount,
      message: meetsSeed
        ? null
        : `Expected at least ${table.expectedMin} rows (run supabase/schema.sql)`,
    });
  }

  const { error: channelProbe } = await supabase
    .from('activities')
    .select('outreach_channel')
    .limit(1);

  if (channelProbe?.message?.includes('outreach_channel')) {
    results.push({
      table: 'activities.outreach_channel',
      ok: false,
      count: null,
      message: channelProbe.message,
      migration: 'supabase/migrations/20260520_outreach_channel.sql',
    });
  }

  const { error: templateProbe } = await supabase
    .from('activities')
    .select('template_id, call_template_id')
    .limit(1);

  if (templateProbe?.message?.includes('template_id')) {
    results.push({
      table: 'activities.template_id',
      ok: false,
      count: null,
      message: templateProbe.message,
      migration: 'supabase/migrations/20260522_activity_templates.sql',
    });
  }

  const allOk = results.every((r) => r.ok);

  return {
    ok: allOk,
    results,
    message: allOk
      ? 'Database schema verified — tables reachable with your login.'
      : 'Some tables or columns are missing. Run the migrations listed below in Supabase SQL Editor.',
  };
}
