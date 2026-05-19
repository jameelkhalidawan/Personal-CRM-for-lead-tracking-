import { LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export function Dashboard() {
  const { user, signOut, loading } = useAuthStore();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    'User';

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

      <main className="mx-auto max-w-content px-6 py-12">
        <div className="rounded-xl border border-border bg-background-card p-10">
          <p className="text-label uppercase text-text-muted mb-2">Phase 2</p>
          <h2 className="text-h2 text-text-primary mb-2">
            Hello, {displayName}
          </h2>
          <p className="text-text-secondary text-body mb-1">
            Signed in as <span className="text-text-primary">{user?.email}</span>
          </p>
          <p className="text-small text-text-muted mt-6">
            Full dashboard (pipeline, follow-ups, stats) arrives in Phase 8.
            Next up: Phase 3 database schema, then Phase 4 app shell.
          </p>
        </div>
      </main>
    </div>
  );
}
