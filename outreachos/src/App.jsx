import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { testSupabaseConnection } from './lib/supabase';

const STAGE_LABELS = {
  config: 'Checking .env configuration…',
  network: 'Contacting Supabase servers…',
  api: 'Verifying API key…',
  connected: 'Connected',
};

function App() {
  const [connectionStatus, setConnectionStatus] = useState({
    loading: true,
    ok: null,
    message: '',
    stage: 'config',
    latencyMs: null,
    projectHost: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function runTest() {
      setConnectionStatus((prev) => ({
        ...prev,
        loading: true,
        message: STAGE_LABELS.config,
        stage: 'config',
      }));

      const result = await testSupabaseConnection((progress) => {
        if (!cancelled) {
          setConnectionStatus((prev) => ({
            ...prev,
            loading: true,
            stage: progress.stage,
            message: progress.message,
          }));
        }
      });
      if (!cancelled) {
        setConnectionStatus({
          loading: false,
          ok: result.ok,
          message: result.message,
          stage: result.stage ?? (result.ok ? 'connected' : 'network'),
          latencyMs: result.latencyMs ?? null,
          projectHost: result.projectHost ?? null,
        });
      }
    }

    runTest();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadingLabel = connectionStatus.loading
    ? connectionStatus.message ||
      STAGE_LABELS[connectionStatus.stage] ||
      'Testing connection…'
    : '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg rounded-xl border border-border bg-background-card p-10 text-center shadow-lg">
        <p className="text-label uppercase text-text-muted mb-3 tracking-widest">
          OutreachOS
        </p>
        <h1 className="text-h1 text-text-primary mb-2">Hello OutreachOS</h1>
        <p className="text-text-secondary mb-8">
          Phase 1 scaffold — Electron + React + Tailwind + Supabase
        </p>

        <div className="mb-8 flex justify-center">
          <div className="h-16 w-48 rounded-lg bg-accent-primary flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              Tailwind accent test
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background-elevated p-4 text-left">
          <p className="text-label uppercase text-text-muted mb-2">
            Supabase connection
          </p>
          {connectionStatus.loading ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin text-accent-primary shrink-0" />
                <span className="text-sm">{loadingLabel}</span>
              </div>
              <p className="text-small text-text-muted pl-6">
                Pings your project URL and validates the API key over the network.
              </p>
            </div>
          ) : connectionStatus.ok ? (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-status-interested">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <span className="text-sm">{connectionStatus.message}</span>
              </div>
              {connectionStatus.projectHost && (
                <p className="text-small text-text-muted pl-7 break-all">
                  Project: {connectionStatus.projectHost}
                  {connectionStatus.latencyMs != null &&
                    ` · ${connectionStatus.latencyMs}ms round-trip`}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2 text-priority-high">
              <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span className="text-sm">{connectionStatus.message}</span>
            </div>
          )}
        </div>

        {window.electronAPI?.isElectron && (
          <p className="mt-6 text-small text-text-muted">
            Running in Electron ({window.electronAPI.platform})
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
