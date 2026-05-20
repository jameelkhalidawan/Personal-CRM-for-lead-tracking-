import { useState } from 'react';
import { Lock, Database } from 'lucide-react';
import {
  fetchAppConnectionFromDatabase,
  updateAppConnectionInDatabase,
  verifyAdminPassword,
} from '../../lib/appSettingsApi';
import {
  applyDatabaseConnectionOverride,
  getRuntimeSupabaseConfig,
} from '../../lib/runtimeConfig';
import { testSupabaseConnection } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody, CardHeader } from '../ui/Card';

export function SupabaseConfigCard() {
  const isElectron = window.electronAPI?.isElectron;
  const [unlocked, setUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [savePassword, setSavePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadConnectionFields = async () => {
    const fromDb = await fetchAppConnectionFromDatabase();
    const fallback = getRuntimeSupabaseConfig();
    const src = fromDb ?? fallback;
    setUrl(src.url ?? '');
    setAnonKey(fromDb ? '••••••••••••••••' : '');
  };

  const handleUnlock = async () => {
    setError('');
    setMessage('');
    if (!adminPassword.trim()) {
      setError('Enter the admin password.');
      return;
    }
    setLoading(true);
    try {
      const ok = await verifyAdminPassword(adminPassword);
      if (!ok) {
        setError('Incorrect admin password.');
        setLoading(false);
        return;
      }
      await loadConnectionFields();
      setUnlocked(true);
      setMessage('Unlocked. Connection is stored in Supabase, not on this PC.');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setError('');
    setMessage('');
    const keyValue = anonKey.startsWith('••') ? undefined : anonKey;
    if (!savePassword.trim()) {
      setError('Enter admin password to save.');
      return;
    }
    if (!url.trim()) {
      setError('Project URL is required.');
      return;
    }
    if (!keyValue) {
      setError('Enter the anon key (or leave DB override empty to use build defaults).');
      return;
    }

    setLoading(true);
    try {
      const ok = await updateAppConnectionInDatabase(savePassword, url, keyValue ?? '');
      if (!ok) {
        setError('Save failed — wrong admin password or not allowed.');
        setLoading(false);
        return;
      }
      await applyDatabaseConnectionOverride();
      const result = await testSupabaseConnection();
      if (!result.ok) {
        setError(result.message);
        setLoading(false);
        return;
      }
      setMessage('Saved to Supabase. All team apps use this after they sign in.');
      setAnonKey('••••••••••••••••');
      setSavePassword('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLock = () => {
    setUnlocked(false);
    setAdminPassword('');
    setSavePassword('');
    setUrl('');
    setAnonKey('');
    setMessage('');
    setError('');
  };

  if (!isElectron) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-h3 text-text-primary">Database connection (admin)</h2>
        </CardHeader>
        <CardBody>
          <p className="text-small text-text-muted">
            Dev mode uses <code className="text-text-secondary">.env</code>. Admin connection
            overrides are managed in Supabase after login.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-accent-secondary" />
          <h2 className="text-h3 text-text-primary">Database connection (admin)</h2>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-small text-text-secondary">
          Connection URL and anon key are not saved on this computer. They live in your Supabase{' '}
          <code className="text-text-primary">app_settings</code> table and require an admin
          password to view or change. Change the admin password in Supabase SQL Editor (see INSTALL
          docs).
        </p>

        {!unlocked ? (
          <>
            <div className="flex items-center gap-2 text-small text-text-muted">
              <Lock className="h-4 w-4" />
              Admin password required
            </div>
            <Input
              label="Admin password"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Set in Supabase — not stored locally"
            />
            <Button variant="secondary" size="sm" onClick={handleUnlock} loading={loading}>
              Unlock connection settings
            </Button>
          </>
        ) : (
          <>
            <Input
              label="Supabase project URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xxxx.supabase.co"
            />
            <Input
              label="Anon key"
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="Paste to update"
            />
            <Input
              label="Admin password (confirm to save)"
              type="password"
              value={savePassword}
              onChange={(e) => setSavePassword(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={handleSave} loading={loading}>
                Save to Supabase
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLock}>
                Lock
              </Button>
            </div>
          </>
        )}

        {message && <p className="text-small text-status-interested">{message}</p>}
        {error && <p className="text-small text-priority-high">{error}</p>}
      </CardBody>
    </Card>
  );
}
