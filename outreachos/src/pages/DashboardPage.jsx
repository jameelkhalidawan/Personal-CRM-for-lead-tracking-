import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { BusinessCreatePanel } from '../components/businesses/BusinessDetailPanel';
import { FollowUpCards } from '../components/dashboard/FollowUpCards';
import { PipelineKanban } from '../components/dashboard/PipelineKanban';
import { StatsBar } from '../components/dashboard/StatsBar';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { useBusinessStore } from '../stores/businessStore';
import { useActivityStore } from '../stores/activityStore';
import { fetchDecisionMakersForBusinesses } from '../lib/decisionMakerApi';
import { computeDashboardMetrics } from '../lib/dashboardMetrics';
import { getTodayTomorrowBucketsByContact } from '../lib/dashboardStats';
import { groupActivitiesByBusiness, getFollowUpInsight } from '../lib/followUpInsight';
import { buildInsightsByContactKey } from '../lib/insightsMap';
import { expandLeadsByContact } from '../lib/leadExpansion';
import { useOutreachTiming } from '../hooks/useOutreachTiming';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const {
    businesses,
    loading,
    error,
    loadBusinesses,
    loadServices,
    subscribeRealtime,
    unsubscribeRealtime,
    patchBusinessStatus,
    clearError,
  } = useBusinessStore();
  const { items: activities, loadAll: loadActivities } = useActivityStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [dmsByBusiness, setDmsByBusiness] = useState({});
  const [dmLoadError, setDmLoadError] = useState(null);
  const outreachTiming = useOutreachTiming();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    'User';

  useEffect(() => {
    loadServices();
    loadBusinesses();
    loadActivities();
    subscribeRealtime();
    return () => unsubscribeRealtime();
  }, [
    loadServices,
    loadBusinesses,
    loadActivities,
    subscribeRealtime,
    unsubscribeRealtime,
  ]);

  const metrics = useMemo(
    () => computeDashboardMetrics(businesses, dmsByBusiness, activities),
    [businesses, dmsByBusiness, activities],
  );

  const activitiesByBusiness = useMemo(
    () => groupActivitiesByBusiness(activities),
    [activities],
  );

  const allBusinessIds = useMemo(() => businesses.map((b) => b.id), [businesses]);

  useEffect(() => {
    if (!allBusinessIds.length) {
      setDmsByBusiness({});
      setDmLoadError(null);
      return;
    }
    fetchDecisionMakersForBusinesses(allBusinessIds)
      .then((data) => {
        setDmsByBusiness(data);
        setDmLoadError(null);
      })
      .catch((err) => {
        setDmsByBusiness({});
        setDmLoadError(err.message ?? 'Could not load contacts');
      });
  }, [allBusinessIds.join(',')]);

  const insightsByContactKey = useMemo(
    () =>
      buildInsightsByContactKey(
        businesses,
        activitiesByBusiness,
        dmsByBusiness,
        outreachTiming,
      ),
    [businesses, activitiesByBusiness, dmsByBusiness, outreachTiming],
  );

  const leads = useMemo(
    () => expandLeadsByContact(businesses, dmsByBusiness),
    [businesses, dmsByBusiness],
  );

  const enrichBucket = (items) =>
    items.map((item) => ({
      ...item,
      insight: getFollowUpInsight(
        item.business,
        activitiesByBusiness[item.business.id] ?? [],
        dmsByBusiness[item.business.id] ?? [],
        outreachTiming,
        item.decisionMaker,
      ),
      contactIndex: item.decisionMaker
        ? (dmsByBusiness[item.business.id] ?? []).findIndex(
            (d) => d.id === item.decisionMaker.id,
          ) + 1
        : 1,
      contactTotal: (dmsByBusiness[item.business.id] ?? []).filter((d) =>
        Boolean(d.name?.trim()),
      ).length,
    }));

  const followUps = useMemo(() => {
    const buckets = getTodayTomorrowBucketsByContact(businesses, dmsByBusiness);
    return {
      today: enrichBucket(buckets.today),
      tomorrow: enrichBucket(buckets.tomorrow),
    };
  }, [businesses, dmsByBusiness, activitiesByBusiness, outreachTiming]);

  const openLead = (businessId, contactId = null) => {
    navigate('/businesses', {
      state: contactId
        ? { openBusinessId: businessId, focusContactId: contactId }
        : { openBusinessId: businessId },
    });
  };

  const handleStatusChange = async (id, status) => {
    await patchBusinessStatus(id, status);
  };

  return (
    <>
      <PageHeader
        title={`Hello, ${displayName}`}
        description="What to do today, what's planned for tomorrow, and pipeline."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add lead
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-priority-high/40 bg-priority-high/10 px-4 py-3 text-small text-priority-high flex justify-between gap-4">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {dmLoadError && (
        <div className="mb-4 rounded-lg border border-priority-high/40 bg-priority-high/10 px-4 py-3 text-small text-priority-high">
          Could not load contacts — metrics and follow-ups may be incomplete. {dmLoadError}
        </div>
      )}

      <StatsBar metrics={metrics} loading={loading} />
      <FollowUpCards buckets={followUps} onOpenLead={openLead} />
      <PipelineKanban
        leads={leads}
        loading={loading}
        insightsByContactKey={insightsByContactKey}
        onStatusChange={handleStatusChange}
        onOpenLead={openLead}
      />

      <BusinessCreatePanel
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setCreateOpen(false)}
      />
    </>
  );
}
