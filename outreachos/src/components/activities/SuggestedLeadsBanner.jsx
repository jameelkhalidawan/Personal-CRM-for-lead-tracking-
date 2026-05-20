import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { getPlaybookState, getPlaybookProgressSummary } from '../../lib/outreachSequence';
import { getOutreachContactsForBusiness } from '../../lib/leadModel';
import { fetchDecisionMakersForBusinesses } from '../../lib/decisionMakerApi';
import { useOutreachTiming } from '../../hooks/useOutreachTiming';
import { useBusinessStore } from '../../stores/businessStore';
import { useActivityStore } from '../../stores/activityStore';
import { Button } from '../ui/Button';

export function SuggestedLeadsBanner() {
  const navigate = useNavigate();
  const businesses = useBusinessStore((s) => s.businesses);
  const items = useActivityStore((s) => s.items);
  const outreachTiming = useOutreachTiming();
  const [dmsByBusiness, setDmsByBusiness] = useState({});

  const businessIds = useMemo(() => businesses.map((b) => b.id), [businesses]);

  useEffect(() => {
    if (!businessIds.length) {
      setDmsByBusiness({});
      return;
    }
    fetchDecisionMakersForBusinesses(businessIds).then(setDmsByBusiness).catch(() => {});
  }, [businessIds.join(',')]);

  const byBusiness = {};
  for (const a of items) {
    if (!byBusiness[a.business_id]) byBusiness[a.business_id] = [];
    byBusiness[a.business_id].push(a);
  }

  const suggested = [];
  for (const business of businesses) {
    const activities = byBusiness[business.id] ?? [];
    const dms = dmsByBusiness[business.id] ?? [];
    const contacts = getOutreachContactsForBusiness(business, dms);

    const targets = contacts.length ? contacts : [null];
    for (const decisionMaker of targets) {
      const state = getPlaybookState(
        business,
        dms,
        activities,
        outreachTiming,
        decisionMaker,
      );
      if (state.engaged) continue;
      const steps = state.currentSteps?.length
        ? state.currentSteps
        : state.current
          ? [state.current]
          : [];
      if (!steps.length) continue;
      const label = getPlaybookProgressSummary(state) ?? steps.map((s) => s.label).join(' + ');
      suggested.push({
        business,
        decisionMaker,
        label,
        openState: decisionMaker
          ? { openBusinessId: business.id, focusContactId: decisionMaker.id }
          : { openBusinessId: business.id },
      });
    }
  }

  const top = suggested.slice(0, 5);

  if (!top.length) return null;

  return (
    <div className="mb-6 rounded-xl border border-accent-primary/30 bg-accent-primary/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-accent-primary" />
        <p className="text-small font-medium text-text-primary">Suggested next outreach</p>
      </div>
      <ul className="space-y-2">
        {top.map(({ business, decisionMaker, label, openState }) => (
          <li
            key={`${business.id}:${decisionMaker?.id ?? 'none'}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background-card px-3 py-2 text-small"
          >
            <span>
              <span className="font-medium text-text-primary">
                {decisionMaker?.name ?? business.business_name}
              </span>
              {decisionMaker && (
                <span className="text-text-muted"> · {business.business_name}</span>
              )}
              <span className="text-text-muted"> — {label}</span>
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/businesses', { state: openState })}
            >
              Open
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
