import { getSupabase } from './supabase';

/**
 * Verifies Phase 3 tables exist and seeds are present (authenticated request).
 */
export async function verifyDatabaseSchema() {
  const supabase = getSupabase();

  const tables = [
    { name: 'services', expectedMin: 4 },
    { name: 'email_templates', expectedMin: 6 },
    { name: 'businesses', expectedMin: 0 },
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

  const allOk = results.every((r) => r.ok);

  return {
    ok: allOk,
    results,
    message: allOk
      ? 'Database schema verified — tables reachable with your login.'
      : 'Some tables are missing or seeds not loaded. Run supabase/schema.sql in Supabase SQL Editor.',
  };
}
