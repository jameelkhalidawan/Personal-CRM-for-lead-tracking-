import { Rocket } from 'lucide-react';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { Card, CardBody, CardHeader } from '../ui/Card';

export function StartupSettingsCard() {
  const { autoStart, autoStartAvailable, setAutoStart } = usePreferencesStore();

  if (!autoStartAvailable) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-h3 text-text-primary">Startup</h2>
        </CardHeader>
        <CardBody>
          <p className="text-small text-text-muted">
            Launch on Windows startup is available in the Electron desktop app only.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-accent-secondary" />
          <h2 className="text-h3 text-text-primary">Startup</h2>
        </div>
      </CardHeader>
      <CardBody>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoStart}
            onChange={(e) => setAutoStart(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-accent-primary"
          />
          <span className="text-body text-text-primary">
            Launch OutreachOS when Windows starts
          </span>
        </label>
        <p className="text-small text-text-muted mt-2 pl-7">
          Keeps reminders running in the background after you sign in.
        </p>
      </CardBody>
    </Card>
  );
}
