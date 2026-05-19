import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuthStore } from '../stores/authStore';
import { verifyDatabaseSchema } from '../lib/dbCheck';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
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
    verifyDatabaseSchema().then((result) => {
      if (!cancelled) {
        setDbStatus({
          loading: false,
          ok: result.ok,
          message: result.message,
          results: result.results,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
  <>
      <PageHeader
        title={`Hello, ${displayName}`}
        description="Your command center — pipeline and follow-ups arrive in Phase 8."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <p className="text-label uppercase text-text-muted mb-2">Account</p>
            <p className="text-text-secondary text-body">
              Signed in as{' '}
              <span className="text-text-primary">{user?.email}</span>
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-label uppercase text-text-muted mb-3">Database</p>
            {dbStatus.loading ? (
              <div className="flex items-center gap-2 text-text-secondary text-small">
                <LoadingSpinner size="sm" />
                Checking tables…
              </div>
            ) : (
              <div className="space-y-2">
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
                      {row.table}: {row.count ?? 0} rows
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
