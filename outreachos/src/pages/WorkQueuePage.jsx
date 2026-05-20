import { useEffect, useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, Phone, Mail, Layers } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { BusinessDetailPanel } from '../components/businesses/BusinessDetailPanel';
import { LeadIdentity } from '../components/businesses/LeadIdentity';
import { LeadReadinessBadge } from '../components/businesses/LeadReadinessBadge';
import { NextStepLabel } from '../components/businesses/NextStepLabel';
import { CopyOutreachPackButton } from '../components/businesses/CopyOutreachPackButton';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';
import { buildWorkQueue } from '../lib/workQueue';
import { buildOutreachPack } from '../lib/outreachPack';
import { getLeadTitle } from '../lib/leadModel';
import { groupActivitiesByBusiness } from '../lib/followUpInsight';
import { fetchDecisionMakersForBusinesses } from '../lib/decisionMakerApi';
import { getSuggestedPreset } from '../lib/outreachSequence';
import { useLeadShortcuts } from '../hooks/useLeadShortcuts';
import { useOutreachTiming } from '../hooks/useOutreachTiming';
import { useBusinessStore } from '../stores/businessStore';
import { useActivityStore } from '../stores/activityStore';
import { useAuthStore } from '../stores/authStore';

const CHANNEL_FILTERS = [
  { value: 'all', label: 'All', icon: Layers },
  { value: 'phone', label: 'Calls', icon: Phone },
  { value: 'email', label: 'Emails', icon: Mail },
];

export function WorkQueuePage() {
  const user = useAuthStore((s) => s.user);
  const {
    businesses,
    loading,
    loadBusinesses,
    loadBusinessDetail,
    detail,
    subscribeRealtime,
    unsubscribeRealtime,
  } = useBusinessStore();
  const { items: activities, loadAll: loadActivities } = useActivityStore();

  const [channelFilter, setChannelFilter] = useState('all');
  const [readyOnly, setReadyOnly] = useState(false);
  const [index, setIndex] = useState(0);
  const [dmsByBusiness, setDmsByBusiness] = useState({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [panelMode, setPanelMode] = useState('view');
  const [showHelp, setShowHelp] = useState(false);
  const outreachTiming = useOutreachTiming();

  useEffect(() => {
    loadBusinesses();
    loadActivities();
    subscribeRealtime();
    return () => unsubscribeRealtime();
  }, [loadBusinesses, loadActivities, subscribeRealtime, unsubscribeRealtime]);

  const activitiesByBusiness = useMemo(
    () => groupActivitiesByBusiness(activities),
    [activities],
  );

  const businessIds = useMemo(() => businesses.map((b) => b.id), [businesses]);

  useEffect(() => {
    if (!businessIds.length) {
      setDmsByBusiness({});
      return;
    }
    fetchDecisionMakersForBusinesses(businessIds).then(setDmsByBusiness).catch(() => {});
  }, [businessIds.join(',')]);

  const queue = useMemo(
    () =>
      buildWorkQueue(businesses, activitiesByBusiness, dmsByBusiness, {
        channelFilter,
        includeNotReady: !readyOnly,
        timing: outreachTiming,
      }),
    [
      businesses,
      activitiesByBusiness,
      dmsByBusiness,
      channelFilter,
      readyOnly,
      outreachTiming,
    ],
  );

  const current = queue[index] ?? null;
  const businessId = current?.business?.id;
  const focusContactId = current?.decisionMaker?.id ?? null;

  useEffect(() => {
    if (index >= queue.length && queue.length > 0) {
      setIndex(queue.length - 1);
    }
  }, [queue.length, index]);

  useEffect(() => {
    if (businessId) {
      loadBusinessDetail(businessId);
    }
  }, [businessId, loadBusinessDetail]);

  const detailMatches =
    businessId && detail?.business?.id === businessId ? detail : null;

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, Math.max(0, queue.length - 1)));
  }, [queue.length]);

  const goPrevious = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleLogSuggested = useCallback(() => {
    if (!current || !detailMatches) return;
    setDetailOpen(true);
    setPanelMode('view');
  }, [current, detailMatches]);

  const handleCopyPack = useCallback(async () => {
    if (!current) return;
    const text = buildOutreachPack({
      business: current.business,
      decisionMaker: current.decisionMaker,
      decisionMakers: current.decisionMakers,
      activities: current.activities,
      user,
      timing: outreachTiming,
    });
    await navigator.clipboard?.writeText(text);
  }, [current, user, outreachTiming]);

  useLeadShortcuts({
    enabled: !!current,
    onLogSuggested: handleLogSuggested,
    onCopyPack: handleCopyPack,
    onNext: queue.length > 1 ? goNext : undefined,
    onPrevious: queue.length > 1 ? goPrevious : undefined,
    onShowHelp: () => setShowHelp((s) => !s),
  });

  const suggested = detailMatches
    ? (() => {
        const base = getSuggestedPreset(
          detailMatches.business,
          detailMatches.decisionMakers,
          detailMatches.activities,
          outreachTiming,
          current?.decisionMaker ?? null,
        );
        if (!base) return null;
        if (focusContactId) {
          return { ...base, decision_maker_id: focusContactId };
        }
        return base;
      })()
    : null;

  return (
    <>
      <PageHeader
        title="Work queue"
        description="Each row is one decision maker to contact. A company with 3 contacts appears as 3 separate queue items."
      />

      {showHelp && (
        <div className="mb-4 rounded-lg border border-border bg-background-elevated/50 px-4 py-3 text-small text-text-secondary">
          <strong className="text-text-primary">Shortcuts:</strong> L — open contact to log
          outreach · C — copy outreach pack · N — next contact · P — previous · ? — help
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {CHANNEL_FILTERS.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={channelFilter === value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setChannelFilter(value);
              setIndex(0);
            }}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
        <label className="flex items-center gap-2 text-small text-text-secondary ml-auto">
          <input
            type="checkbox"
            checked={readyOnly}
            onChange={(e) => {
              setReadyOnly(e.target.checked);
              setIndex(0);
            }}
            className="rounded border-border"
          />
          Ready contacts only
        </label>
        <Button variant="ghost" size="sm" onClick={() => setShowHelp((s) => !s)} title="Shortcuts">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-border bg-background-card overflow-hidden max-h-[calc(100vh-220px)] flex flex-col">
          <p className="text-label uppercase text-text-muted px-3 py-2 border-b border-border shrink-0">
            Contacts ({queue.length})
          </p>
          <ul className="overflow-y-auto flex-1 divide-y divide-border">
            {loading && (
              <li className="px-3 py-4 text-small text-text-muted">Loading…</li>
            )}
            {!loading && queue.length === 0 && (
              <li className="px-3 py-4 text-small text-text-muted">No contacts in queue.</li>
            )}
            {queue.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 transition-colors',
                    i === index ? 'bg-accent-primary/15' : 'hover:bg-background-elevated/50',
                  )}
                >
                  <LeadIdentity
                    decisionMaker={item.decisionMaker}
                    business={item.business}
                    size="sm"
                  />
                  <NextStepLabel
                    nextAction={item.insight.nextAction}
                    compact
                    className="mt-1"
                  />
                  {item.contactTotal > 1 && (
                    <span className="text-[10px] text-text-muted mt-0.5 block">
                      Contact {item.contactIndex} of {item.contactTotal} at{' '}
                      {item.business.business_name}
                    </span>
                  )}
                  {item.overdue && (
                    <span className="text-[10px] text-priority-high mt-0.5 block">Overdue</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="space-y-4">
          {current ? (
            <>
              <div className="rounded-xl border border-border bg-background-card p-4 flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <LeadIdentity
                    decisionMaker={current.decisionMaker}
                    business={current.business}
                    size="lg"
                  />
                  {current.decisionMaker?.email && (
                    <p className="text-small text-text-secondary mt-2">{current.decisionMaker.email}</p>
                  )}
                  {current.decisionMaker?.phone_number && (
                    <p className="text-small text-text-secondary">
                      {current.decisionMaker.phone_number}
                    </p>
                  )}
                  {current.contactTotal > 1 && (
                    <p className="text-small text-accent-secondary mt-2">
                      {current.contactTotal} contacts at this company — you are on{' '}
                      {current.contactIndex} of {current.contactTotal}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <LeadReadinessBadge
                      business={current.business}
                      decisionMakers={current.decisionMakers}
                      focusContact={current.decisionMaker}
                    />
                    <NextStepLabel
                      nextAction={current.insight.nextAction}
                      processLabel={current.insight.processLabel}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <CopyOutreachPackButton
                    business={current.business}
                    decisionMaker={current.decisionMaker}
                    decisionMakers={current.decisionMakers}
                    activities={current.activities}
                  />
                  <Button size="sm" onClick={() => setDetailOpen(true)}>
                    Contact {getLeadTitle(current.decisionMaker, current.business)}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={index <= 0}
                  onClick={goPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-small text-text-muted">
                  {index + 1} of {queue.length}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={index >= queue.length - 1}
                  onClick={goNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {suggested && (
                <p className="text-small text-text-muted">
                  Suggested for {getLeadTitle(current.decisionMaker, current.business)}:{' '}
                  <span className="text-text-primary">{suggested.reason ?? suggested.step?.label}</span>
                </p>
              )}
            </>
          ) : (
            <p className="text-text-muted text-body py-12 text-center">
              {loading ? 'Loading queue…' : 'No contacts match this filter.'}
            </p>
          )}
        </main>
      </div>

      <BusinessDetailPanel
        open={detailOpen}
        businessId={businessId}
        mode={panelMode}
        focusContactId={focusContactId}
        activityPreset={detailOpen ? suggested : null}
        onClose={() => {
          setDetailOpen(false);
          setPanelMode('view');
        }}
        onEdit={() => setPanelMode('edit')}
        onCancelEdit={() => setPanelMode('view')}
        onDeleteRequest={() => {}}
        onActivityLogged={() => {
          setDetailOpen(false);
          setPanelMode('view');
          goNext();
        }}
      />
    </>
  );
}
