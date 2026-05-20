import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { BusinessFilters } from '../components/businesses/BusinessFilters';
import { BusinessTable } from '../components/businesses/BusinessTable';
import {
  BusinessCreatePanel,
  BusinessDetailPanel,
} from '../components/businesses/BusinessDetailPanel';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { useDebounce } from '../hooks/useDebounce';
import { useBusinessStore } from '../stores/businessStore';
import { useActivityStore } from '../stores/activityStore';
import { fetchDecisionMakersForBusinesses } from '../lib/decisionMakerApi';
import { groupActivitiesByBusiness } from '../lib/followUpInsight';
import { buildInsightsByBusinessId } from '../lib/insightsMap';

export function BusinessesPage() {
  const location = useLocation();
  const {
    loading,
    error,
    search,
    setSearch,
    getFilteredBusinesses,
    loadBusinesses,
    loadServices,
    subscribeRealtime,
    unsubscribeRealtime,
    deleteBusiness,
    clearError,
    loadBusinessDetail,
    filterStatus,
    filterPriority,
    filterServiceIds,
  } = useBusinessStore();

  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 300);

  const [panel, setPanel] = useState(null);
  // panel: null | { type: 'view'|'edit'|'create', id?: string }
  const [deleteId, setDeleteId] = useState(null);
  const [dmsByBusiness, setDmsByBusiness] = useState({});
  const { items: activities, loadAll: loadActivities } = useActivityStore();

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    loadServices();
    loadBusinesses();
    loadActivities();
    subscribeRealtime();
    return () => unsubscribeRealtime();
  }, [loadServices, loadBusinesses, loadActivities, subscribeRealtime, unsubscribeRealtime]);

  const businesses = getFilteredBusinesses();
  const businessIds = useMemo(() => businesses.map((b) => b.id), [businesses]);

  useEffect(() => {
    if (!businessIds.length) {
      setDmsByBusiness({});
      return;
    }
    fetchDecisionMakersForBusinesses(businessIds).then(setDmsByBusiness).catch(() => {});
  }, [businessIds.join(',')]);

  const activitiesByBusiness = useMemo(
    () => groupActivitiesByBusiness(activities),
    [activities],
  );

  const insightsByBusinessId = useMemo(
    () => buildInsightsByBusinessId(businesses, activitiesByBusiness, dmsByBusiness),
    [businesses, activitiesByBusiness, dmsByBusiness],
  );

  const openView = (id) => {
    loadBusinessDetail(id);
    setPanel({ type: 'view', id });
  };

  useEffect(() => {
    const id = location.state?.openBusinessId;
    if (id) {
      openView(id);
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when navigated with state
  }, [location.state?.openBusinessId]);

  const hasFilters =
    localSearch.trim() ||
    filterStatus ||
    filterPriority ||
    filterServiceIds.length > 0;

  const closePanel = () => setPanel(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteBusiness(deleteId);
    if (result.ok) {
      setDeleteId(null);
      setPanel(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Businesses"
        description="Manage leads, pipeline status, and follow-ups."
        actions={
          <Button onClick={() => setPanel({ type: 'create' })}>
            <Plus className="h-4 w-4" />
            Add business
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

      <BusinessFilters search={localSearch} onSearchChange={setLocalSearch} />

      {loading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : businesses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No businesses yet"
          description={
            hasFilters
              ? 'Try adjusting your search or filters.'
              : 'Add your first lead to start building your pipeline.'
          }
          actionLabel="Add business"
          onAction={() => setPanel({ type: 'create' })}
        />
      ) : (
        <BusinessTable
          businesses={businesses}
          insightsByBusinessId={insightsByBusinessId}
          dmsByBusinessId={dmsByBusiness}
          onRowClick={openView}
        />
      )}

      <BusinessCreatePanel
        open={panel?.type === 'create'}
        onClose={closePanel}
        onCreated={closePanel}
      />

      <BusinessDetailPanel
        open={panel?.type === 'view' || panel?.type === 'edit'}
        businessId={panel?.id}
        mode={panel?.type === 'edit' ? 'edit' : 'view'}
        onClose={closePanel}
        onEdit={() => setPanel((p) => (p ? { ...p, type: 'edit' } : p))}
        onCancelEdit={() =>
          setPanel((p) => (p ? { type: 'view', id: p.id } : p))
        }
        onDeleteRequest={(id) => setDeleteId(id)}
      />

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete this business?"
        description="This will permanently remove the business and all linked decision makers. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
