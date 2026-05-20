import { getMigrationHint } from '../../lib/migrationHints';

export function MigrationHint({ error }) {
  const file = getMigrationHint(error);
  if (!file) return null;
  return (
    <p className="mt-2 text-text-secondary">
      Run <code className="text-text-primary">{file}</code> in Supabase → SQL Editor, then
      refresh.
    </p>
  );
}
