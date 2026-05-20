import { useEffect, useState } from 'react';
import { Database } from 'lucide-react';
import { getRuntimeSupabaseConfig, saveRuntimeSupabaseConfig } from '../../lib/runtimeConfig';
import { testSupabaseConnection, resetSupabaseClient } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody, CardHeader } from '../ui/Card';

export function SupabaseConfigCard() {
  const isElectron = window.electronAPI?.isElectron;
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [masked, setMasked] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const c = getRuntimeSupabaseConfig();
    setUrl(c.url ?? '');
    setAnonKey(c.anonKey ? '••••••••••••••••' : '');
  }, []);

  if (!isElectron) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-h3 text-text-primary">Supabase connection</h2>
        </CardHeader>
        <CardBody>
          <p className="text-small text-text-muted">
            In the browser dev build, configure <code className="text-text-secondary">.env</code>{' '}
            with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
          </p>
        </CardBody>
      </Card>
    );
  }

  const handleSave = async () => {
    setError('');
    setMessage('');
    const keyValue = anonKey.startsWith('••') ? undefined : anonKey;
    if (!url.trim()) {
      setError('Project URL is required.');
      return;
    }
    if (!keyValue && !getRuntimeSupabaseConfig().anonKey) {
      setError('Enter the anon key.');
      return;
    }

    setSaving(true);
    const nextKey = keyValue ?? getRuntimeSupabaseConfig().anonKey;
    await saveRuntimeSupabaseConfig(url.trim(), nextKey);
    resetSupabaseClient();

    const result = await testSupabaseConnection();
    setSaving(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setMessage(result.message);
    setAnonKey('••••••••••••••••');
    setMasked(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-accent-secondary" />
          <h2 className="text-h3 text-text-primary">Supabase connection</h2>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-small text-text-secondary">
          Stored securely on this PC ({window.electronAPI?.platform}). All team members use the
          same Supabase project URL and anon key; each person signs in with their own account.
        </p>
        <Input
          label="Project URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://xxxx.supabase.co"
        />
        <Input
          label="Anon key"
          type={masked ? 'password' : 'text'}
          value={anonKey}
          onChange={(e) => {
            setAnonKey(e.target.value);
            setMasked(false);
          }}
          placeholder="Paste anon key to update"
        />
        <Button variant="secondary" size="sm" onClick={handleSave} loading={saving}>
          Save and test connection
        </Button>
        {message && (
          <p className="text-small text-status-interested">{message}</p>
        )}
        {error && (
          <p className="text-small text-priority-high">{error}</p>
        )}
      </CardBody>
    </Card>
  );
}
