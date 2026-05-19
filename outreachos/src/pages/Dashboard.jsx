import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, LogOut, XCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { verifyDatabaseSchema } from '../lib/dbCheck';

export function Dashboard() {
  const { user, signOut, loading } = useAuthStore();
  const [dbStatus, setDbStatus] = useState({
    loading: true,
    ok: null,
    message: '',
    results: [],
  });

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    'User';

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const result = await verifyDatabaseSchema();
      if (!cancelled) {
        setDbStatus({
          loading: false,
          ok: result.ok,
          message: result.message,
          results: result.results,
        });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background-primary">
      <header className="border-b border-border bg-background-card">
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
          <div>
            <p className="text-label uppercase text-text-muted tracking-widest">
              OutreachOS
            </p>
            <h1 className="text-h2 text-text-primary">Dashboard</h1>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-small text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-content px-6 py-12 space-y-6">
        <div className="rounded-xl border border-border bg-background-card p-10">
          <p className="text-label uppercase text-text-muted mb-2">Welcome</p>
          <h2 className="text-h2 text-text-primary mb-2">
            Hello, {displayName}
          </h2>
          <p className="text-text-secondary text-body mb-1">
            Signed in as <span className="text-text-primary">{user?.email}</span>
          </p>
          <p className="text-small text-text-muted mt-6">
            Full dashboard (pipeline, follow-ups, stats) arrives in Phase 8.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background-card p-6">
          <p className="text-label uppercase text-text-muted mb-3">
            Database (Phase 3)
          </p>
          {dbStatus.loading ? (
            <div className="flex items-center gap-2 text-text-secondary text-small">
              <Loader2 className="h-4 w-4 animate-spin text-accent-primary" />
              Checking tables…
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                {dbStatus.ok ? (
                  <CheckCircle2 className="h-5 w-5 text-status-interested shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-priority-high shrink-0" />
                )}
                <p
                  className={`text-small ${dbStatus.ok ? 'text-status-interested' : 'text-priority-high'}`}
                >
                  {dbStatus.message}
                </p>
              </div>
              <ul className="text-small text-text-muted space-y-1 pl-7">
                {dbStatus.results.map((row) => (
                  <li key={row.table}>
                    {row.table}:{' '}
                    {row.ok ? (
                      <span className="text-text-secondary">
                        {row.count} rows
                      </span>
                    ) : (
                      <span className="text-priority-high">{row.message}</span>
                    )}
                  </li>
                ))}
              </ul>
              {!dbStatus.ok && (
                <p className="text-small text-text-muted pl-7">
                  Run <code className="text-text-secondary">supabase/schema.sql</code>{' '}
                  in Supabase SQL Editor — see docs/PHASE3_DATABASE.md
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
