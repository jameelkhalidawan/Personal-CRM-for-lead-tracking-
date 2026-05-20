import { Moon, Sun } from 'lucide-react';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';

export function AppearanceSettingsCard() {
  const { theme, setTheme } = usePreferencesStore();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {theme === 'light' ? (
            <Sun className="h-5 w-5 text-accent-secondary" />
          ) : (
            <Moon className="h-5 w-5 text-accent-primary" />
          )}
          <h2 className="text-h3 text-text-primary">Appearance</h2>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-small text-text-muted">
          Choose how OutreachOS looks. Preference is saved on this device.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            onClick={() => setTheme('dark')}
          >
            <Moon className="h-4 w-4" />
            Dark
          </Button>
          <Button
            variant={theme === 'light' ? 'primary' : 'secondary'}
            onClick={() => setTheme('light')}
          >
            <Sun className="h-4 w-4" />
            Light
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
