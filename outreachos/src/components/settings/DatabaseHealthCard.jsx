import { useState } from 'react';
import { Database } from 'lucide-react';
import { verifyDatabaseSchema } from '../../lib/dbCheck';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function DatabaseHealthCard() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);

  const runCheck = async () => {
    setChecking(true);
    setResult(null);
    try {
      const r = await verifyDatabaseSchema();
      setResult(r);
    } catch (err) {
      setResult({
        ok: false,
        message: err.message,
        results: [],
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-h3 text-text-primary flex items-center gap-2">
          <Database className="h-5 w-5 text-text-muted" />
          Database
        </h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-small text-text-secondary">
          Verify Supabase tables and migrations. Run any failed migration files in SQL Editor.
        </p>
        <Button variant="secondary" size="sm" onClick={runCheck} loading={checking}>
          Check database
        </Button>
        {checking && (
          <div className="flex items-center gap-2 text-small text-text-muted">
            <LoadingSpinner size="sm" />
            Checking…
          </div>
        )}
        {result && (
          <div
            className={`rounded-lg border px-3 py-2 text-small ${
              result.ok
                ? 'border-status-interested/40 bg-status-interested/10 text-status-interested'
                : 'border-priority-high/40 bg-priority-high/10 text-priority-high'
            }`}
          >
            <p>{result.message}</p>
            {result.results?.length > 0 && (
              <ul className="mt-2 space-y-1 text-text-secondary">
                {result.results.map((r) => (
                  <li key={r.table}>
                    {r.ok ? '✓' : '✗'} {r.table}
                    {r.count != null ? ` (${r.count} rows)` : ''}
                    {r.message && !r.ok && (
                      <span className="block text-xs mt-0.5">{r.message}</span>
                    )}
                    {r.migration && (
                      <code className="block text-xs mt-0.5 text-text-primary">
                        {r.migration}
                      </code>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
