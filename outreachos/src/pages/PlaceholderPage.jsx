import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';

export function PlaceholderPage({ title, description, icon: Icon, phase }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card className="overflow-hidden">
        <EmptyState
          icon={Icon}
          title={`Coming in Phase ${phase}`}
          description={`${title} features will be built in Phase ${phase}. Navigation and layout are ready.`}
        />
      </Card>
    </>
  );
}
