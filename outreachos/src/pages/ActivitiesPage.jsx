import { Activity } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function ActivitiesPage() {
  return (
    <PlaceholderPage
      title="Activities"
      description="Timeline of calls, emails, meetings, and notes."
      icon={Activity}
      phase={7}
    />
  );
}
