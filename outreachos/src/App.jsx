import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from './stores/authStore';
import { usePreferencesStore } from './stores/preferencesStore';
import { bootstrapRuntimeConfig, isRuntimeConfigComplete } from './lib/runtimeConfig';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AppRouter } from './routes/AppRouter';

function App() {
  const { initialize, initialized, loading, session, authView, error } =
    useAuthStore();

  const initializePrefs = usePreferencesStore((s) => s.initialize);
  const syncFromStorage = usePreferencesStore((s) => s.syncFromStorage);

  const [configReady, setConfigReady] = useState(false);
  const [configError, setConfigError] = useState('');

  useEffect(() => {
    bootstrapRuntimeConfig().then((config) => {
      if (!isRuntimeConfigComplete(config)) {
        setConfigError(
          'This installer was built without Supabase credentials. Rebuild with .env or ask your admin to set connection in the database.',
        );
      }
      setConfigReady(true);
    });
  }, []);

  useEffect(() => {
    if (!configReady || configError) return;
    initialize();
    initializePrefs();
  }, [configReady, configError, initialize, initializePrefs]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') syncFromStorage();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [syncFromStorage]);

  if (!configReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-primary gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        <p className="text-text-secondary text-body">Loading OutreachOS…</p>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary px-4">
        <div className="max-w-md rounded-xl border border-priority-high/40 bg-background-card p-8 text-center">
          <p className="text-priority-high text-body">{configError}</p>
        </div>
      </div>
    );
  }

  if (!initialized || (loading && !session)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-primary gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        <p className="text-text-secondary text-body">Loading OutreachOS…</p>
      </div>
    );
  }

  if (session?.user) {
    return <AppRouter />;
  }

  if (error && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary px-4">
        <div className="max-w-md rounded-xl border border-priority-high/40 bg-background-card p-8 text-center">
          <p className="text-priority-high text-body mb-4">{error}</p>
          <p className="text-small text-text-muted">
            Contact your admin if login fails. Connection settings are managed in Supabase.
          </p>
        </div>
      </div>
    );
  }

  return authView === 'register' ? <Register /> : <Login />;
}

export default App;
