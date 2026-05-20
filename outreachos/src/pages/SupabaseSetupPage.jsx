import { useState } from 'react';
import { Database } from 'lucide-react';
import { saveRuntimeSupabaseConfig } from '../lib/runtimeConfig';
import { testSupabaseConnection } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';

export function SupabaseSetupPage({ onComplete }) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const handleSave = async () => {
    setError('');
    if (!url.trim() || !anonKey.trim()) {
      setError('Enter both the project URL and anon key.');
      return;
    }

    setTesting(true);
    setStatus('Saving configuration…');
    await saveRuntimeSupabaseConfig(url.trim(), anonKey.trim());

    setStatus('Testing connection…');
    const result = await testSupabaseConnection(({ message }) => setStatus(message));
    setTesting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onComplete?.();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardBody className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-primary/15 border border-accent-primary/30">
              <Database className="h-6 w-6 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-h2 text-text-primary">Connect to Supabase</h1>
              <p className="text-small text-text-muted mt-0.5">
                One-time setup for this computer. Sessions stay local; data is shared via your
                Supabase project.
              </p>
            </div>
          </div>

          <Input
            label="Supabase project URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://xxxx.supabase.co"
          />
          <Input
            label="Anon / publishable key"
            type="password"
            value={anonKey}
            onChange={(e) => setAnonKey(e.target.value)}
            placeholder="eyJ…"
          />

          <p className="text-small text-text-muted">
            Find these in Supabase → Project Settings → API. Use the anon key, not the
            service role secret.
          </p>

          {status && testing && (
            <p className="text-small text-text-secondary">{status}</p>
          )}
          {error && (
            <p className="text-small text-priority-high rounded-lg border border-priority-high/30 bg-priority-high/10 px-3 py-2">
              {error}
            </p>
          )}

          <Button className="w-full" onClick={handleSave} loading={testing}>
            Save and continue
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
