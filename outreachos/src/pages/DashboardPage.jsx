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
import {
  computeDashboardStats,
  getFollowUpBuckets,
} from '../lib/dashboardStats';
import {
  expandFollowUpListByContact,
  groupActivitiesByBusiness,
} from '../lib/followUpInsight';
import { buildInsightsByBusinessId } from '../lib/insightsMap';

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
  const [loadingContext, setLoadingContext] = useState(false);

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

  const stats = useMemo(() => computeDashboardStats(businesses), [businesses]);
  const rawFollowUps = useMemo(() => getFollowUpBuckets(businesses), [businesses]);
  const activitiesByBusiness = useMemo(
    () => groupActivitiesByBusiness(activities),
    [activities],
  );

  const allBusinessIds = useMemo(() => businesses.map((b) => b.id), [businesses]);

  useEffect(() => {
    if (!allBusinessIds.length) return;
    fetchDecisionMakersForBusinesses(allBusinessIds)
      .then((map) => setDmsByBusiness((prev) => ({ ...prev, ...map })))
      .catch(() => {});
  }, [allBusinessIds.join(',')]);

  const insightsByBusinessId = useMemo(
    () => buildInsightsByBusinessId(businesses, activitiesByBusiness, dmsByBusiness),
    [businesses, activitiesByBusiness, dmsByBusiness],
  );

  const followUpBusinessIds = useMemo(() => {
    const ids = [
      ...rawFollowUps.overdue,
      ...rawFollowUps.dueToday,
      ...rawFollowUps.upcoming,
    ].map((b) => b.id);
    return [...new Set(ids)];
  }, [rawFollowUps]);

  useEffect(() => {
    if (!followUpBusinessIds.length) {
      setDmsByBusiness({});
      return;
    }
    let cancelled = false;
    setLoadingContext(true);
    fetchDecisionMakersForBusinesses(followUpBusinessIds)
      .then((map) => {
        if (!cancelled) setDmsByBusiness(map);
      })
      .catch(() => {
        if (!cancelled) setDmsByBusiness({});
      })
      .finally(() => {
        if (!cancelled) setLoadingContext(false);
      });
    return () => {
      cancelled = true;
    };
  }, [followUpBusinessIds.join(',')]);

  const followUps = useMemo(
    () => ({
      overdue: expandFollowUpListByContact(
        rawFollowUps.overdue,
        activitiesByBusiness,
        dmsByBusiness,
      ),
      dueToday: expandFollowUpListByContact(
        rawFollowUps.dueToday,
        activitiesByBusiness,
        dmsByBusiness,
      ),
      upcoming: expandFollowUpListByContact(
        rawFollowUps.upcoming,
        activitiesByBusiness,
        dmsByBusiness,
      ),
    }),
    [rawFollowUps, activitiesByBusiness, dmsByBusiness],
  );

  const openBusiness = (id) => {
    navigate('/businesses', { state: { openBusinessId: id } });
  };

  const handleStatusChange = async (id, status) => {
    await patchBusinessStatus(id, status);
  };

  return (
    <>
      <PageHeader
        title={`Hello, ${displayName}`}
        description="Pipeline overview, follow-ups, and quick actions."
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

      <StatsBar stats={stats} loading={loading} />
      <FollowUpCards
        buckets={followUps}
        onOpenBusiness={openBusiness}
        loadingContext={loadingContext}
      />
      <PipelineKanban
        businesses={businesses}
        loading={loading}
        insightsByBusinessId={insightsByBusinessId}
        dmsByBusiness={dmsByBusiness}
        onStatusChange={handleStatusChange}
        onOpenBusiness={openBusiness}
      />

      <BusinessCreatePanel
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setCreateOpen(false)}
      />
    </>
  );
}
