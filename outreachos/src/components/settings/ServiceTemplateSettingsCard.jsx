import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { useBusinessStore } from '../../stores/businessStore';

export function ServiceTemplateSettingsCard() {
  const services = useBusinessStore((s) => s.services);
  const loadServices = useBusinessStore((s) => s.loadServices);

  useEffect(() => {
    loadServices();
  }, [loadServices]);
  const serviceTemplateCategories = usePreferencesStore((s) => s.serviceTemplateCategories ?? {});
  const setServiceCategories = usePreferencesStore((s) => s.setServiceCategories);
  const [drafts, setDrafts] = useState({});

  const getDraft = (serviceId) => {
    if (drafts[serviceId] !== undefined) return drafts[serviceId];
    const cats = serviceTemplateCategories[serviceId] ?? [];
    return cats.join(', ');
  };

  const save = (serviceId) => {
    const raw = getDraft(serviceId);
    const categories = raw
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    setServiceCategories(serviceId, categories);
    setDrafts((d) => {
      const next = { ...d };
      delete next[serviceId];
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-h3 text-text-primary">Service → template categories</h2>
        <p className="text-small text-text-muted mt-1">
          Comma-separated category names per service. Email templates matching these categories
          appear first when logging outreach for businesses with that service.
        </p>
      </CardHeader>
      <CardBody className="space-y-4">
        {!services.length ? (
          <p className="text-small text-text-muted">No services loaded.</p>
        ) : (
          services.map((service) => (
            <div key={service.id} className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[200px]">
                <Input
                  label={service.name}
                  value={getDraft(service.id)}
                  onChange={(e) =>
                    setDrafts((d) => ({ ...d, [service.id]: e.target.value }))
                  }
                  placeholder="e.g. AI Voice Agent, Follow-up"
                />
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={() => save(service.id)}>
                Save
              </Button>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
