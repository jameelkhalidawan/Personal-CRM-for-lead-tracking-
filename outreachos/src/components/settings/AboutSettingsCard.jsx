import { Card, CardBody, CardHeader } from '../ui/Card';

export function AboutSettingsCard() {
  const isElectron = window.electronAPI?.isElectron;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-h3 text-text-primary">About</h2>
      </CardHeader>
      <CardBody className="space-y-2 text-small text-text-secondary">
        <p>
          <span className="text-text-muted">App:</span> OutreachOS v0.1.0
        </p>
        <p>
          <span className="text-text-muted">Built for:</span> Conscious Automation
        </p>
        <p>
          <span className="text-text-muted">Runtime:</span>{' '}
          {isElectron ? `Electron (${window.electronAPI?.platform})` : 'Web browser'}
        </p>
      </CardBody>
    </Card>
  );
}
