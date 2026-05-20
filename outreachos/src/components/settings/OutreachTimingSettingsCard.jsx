import { useEffect, useState } from 'react';
import { OUTREACH_TIMING_SECTIONS } from '../../constants/outreachTiming';
import { mergeOutreachTiming } from '../../lib/outreachTiming';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function OutreachTimingSettingsCard() {
  const savedTiming = usePreferencesStore((s) => s.outreachTiming);
  const saveOutreachTiming = usePreferencesStore((s) => s.saveOutreachTiming);
  const syncFromStorage = usePreferencesStore((s) => s.syncFromStorage);
  const timingSaveMessage = usePreferencesStore((s) => s.timingSaveMessage);

  const [draft, setDraft] = useState(() => mergeOutreachTiming(savedTiming));

  useEffect(() => {
    setDraft(mergeOutreachTiming(savedTiming));
  }, [savedTiming]);

  const setField = (key, value) => {
    const num = Math.max(0, Math.min(30, Number(value) || 0));
    setDraft((prev) => ({ ...prev, [key]: num }));
  };

  const handleSave = () => {
    saveOutreachTiming(draft);
  };

  const handleReload = () => {
    syncFromStorage();
  };

  const dirty =
    JSON.stringify(mergeOutreachTiming(draft)) !==
    JSON.stringify(mergeOutreachTiming(savedTiming));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-h3 text-text-primary">Outreach timing</h2>
            <p className="text-small text-text-muted mt-1">
              Universal spacing for new leads, calls, and emails. Saved to this device —
              all open OutreachOS windows use the same settings after you save.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={handleReload}
            >
              Reload from disk
            </Button>
            <Button
              size="sm"
              type="button"
              onClick={handleSave}
              disabled={!dirty}
            >
              Save timing
            </Button>
          </div>
        </div>
        {timingSaveMessage === 'saved' && (
          <p className="text-small text-status-interested mt-2">
            Timing saved. Other windows will pick this up automatically.
          </p>
        )}
        {dirty && (
          <p className="text-small text-accent-secondary mt-2">
            Unsaved changes — click Save timing to apply everywhere.
          </p>
        )}
      </CardHeader>
      <CardBody className="space-y-8">
        {OUTREACH_TIMING_SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="text-body font-medium text-text-primary mb-1">
              {section.title}
            </h3>
            <p className="text-small text-text-muted mb-3">{section.description}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {section.fields.map((field) => (
                <Input
                  key={field.key}
                  type="number"
                  min={field.min}
                  max={field.max}
                  label={field.label}
                  value={draft[field.key] ?? 0}
                  onChange={(e) => setField(field.key, e.target.value)}
                />
              ))}
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
