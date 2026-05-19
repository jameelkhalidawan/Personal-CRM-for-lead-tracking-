import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { getPlaybookState } from '../../lib/outreachSequence';
import { useBusinessStore } from '../../stores/businessStore';
import { useActivityStore } from '../../stores/activityStore';
import { Button } from '../ui/Button';

export function SuggestedLeadsBanner() {
  const navigate = useNavigate();
  const businesses = useBusinessStore((s) => s.businesses);
  const items = useActivityStore((s) => s.items);

  const byBusiness = {};
  for (const a of items) {
    if (!byBusiness[a.business_id]) byBusiness[a.business_id] = [];
    byBusiness[a.business_id].push(a);
  }

  const suggested = businesses
    .map((b) => {
      const state = getPlaybookState(b, [], byBusiness[b.id] ?? []);
      if (!state.current || state.engaged) return null;
      return { business: b, step: state.current };
    })
    .filter(Boolean)
    .slice(0, 5);

  if (!suggested.length) return null;

  return (
    <div className="mb-6 rounded-xl border border-accent-primary/30 bg-accent-primary/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-accent-primary" />
        <p className="text-small font-medium text-text-primary">Suggested next outreach</p>
      </div>
      <ul className="space-y-2">
        {suggested.map(({ business, step }) => (
          <li
            key={business.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background-card px-3 py-2 text-small"
          >
            <span>
              <span className="font-medium text-text-primary">{business.business_name}</span>
              <span className="text-text-muted"> — {step.label}</span>
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                navigate('/businesses', { state: { openBusinessId: business.id } })
              }
            >
              Open
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
