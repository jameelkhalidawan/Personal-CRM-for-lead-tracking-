import { Users } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function DecisionMakersPage() {
  return (
    <PlaceholderPage
      title="Decision Makers"
      description="Contacts and preferred channels for each business."
      icon={Users}
      phase={6}
    />
  );
}
