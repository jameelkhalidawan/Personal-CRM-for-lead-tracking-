import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from './stores/authStore';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AppRouter } from './routes/AppRouter';

function App() {
  const { initialize, initialized, loading, session, authView, error } =
    useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

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
            Check your `.env` file and Supabase project settings.
          </p>
        </div>
      </div>
    );
  }

  return authView === 'register' ? <Register /> : <Login />;
}

export default App;
