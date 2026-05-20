import { PageHeader } from '../components/layout/PageHeader';
import { AboutSettingsCard } from '../components/settings/AboutSettingsCard';
import { DatabaseHealthCard } from '../components/settings/DatabaseHealthCard';
import { AppearanceSettingsCard } from '../components/settings/AppearanceSettingsCard';
import { ReminderSettingsCard } from '../components/settings/ReminderSettingsCard';
import { StartupSettingsCard } from '../components/settings/StartupSettingsCard';
import { ServiceTemplateSettingsCard } from '../components/settings/ServiceTemplateSettingsCard';
import { OutreachTimingSettingsCard } from '../components/settings/OutreachTimingSettingsCard';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { useAuthStore } from '../stores/authStore';

export function SettingsPage() {
  const { user, signOut, loading } = useAuthStore();

  return (
    <>
      <PageHeader
        title="Settings"
        description="Account, reminders, appearance, and startup preferences."
      />

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <h2 className="text-h3 text-text-primary">Account</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <p className="text-label uppercase text-text-muted mb-1">Email</p>
              <p className="text-body text-text-primary">{user?.email}</p>
            </div>
            <Button variant="danger" onClick={() => signOut()} loading={loading}>
              Log out
            </Button>
          </CardBody>
        </Card>

        <ReminderSettingsCard />
        <OutreachTimingSettingsCard />
        <ServiceTemplateSettingsCard />
        <AppearanceSettingsCard />
        <StartupSettingsCard />
        <DatabaseHealthCard />
        <AboutSettingsCard />
      </div>
    </>
  );
}
