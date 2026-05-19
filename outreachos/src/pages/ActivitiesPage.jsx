import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ActivityPanel } from '../components/activities/ActivityPanel';
import { ActivityTable } from '../components/activities/ActivityTable';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Input';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { useDebounce } from '../hooks/useDebounce';
import { ACTIVITY_TYPES } from '../constants/activity';
import { useActivityStore } from '../stores/activityStore';
import { useBusinessStore } from '../stores/businessStore';
import { SuggestedLeadsBanner } from '../components/activities/SuggestedLeadsBanner';

export function ActivitiesPage() {
  const navigate = useNavigate();
  const {
    loading,
    error,
    search,
    filterType,
    setSearch,
    setFilterType,
    getFiltered,
    loadAll,
    subscribeRealtime,
    unsubscribeRealtime,
    remove,
    clearError,
  } = useActivityStore();
  const { loadBusinesses } = useBusinessStore();

  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 300);
  const [panel, setPanel] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    loadAll();
    loadBusinesses();
    subscribeRealtime();
    return () => unsubscribeRealtime();
  }, [loadAll, loadBusinesses, subscribeRealtime, unsubscribeRealtime]);

  const items = getFiltered();
  const hasFilters = localSearch.trim() || filterType;

  const closePanel = () => setPanel(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await remove(deleteTarget.id, deleteTarget.business_id);
    if (result.ok) {
      setDeleteTarget(null);
      setPanel(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Activities"
        description="Timeline of calls, emails, meetings, and notes across all businesses."
      />

      <SuggestedLeadsBanner />

      {error && (
        <div className="mb-4 rounded-lg border border-priority-high/40 bg-priority-high/10 px-4 py-3 text-small text-priority-high flex justify-between gap-4">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="max-w-md flex-1 min-w-[200px]">
          <SearchInput
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search notes, business, or contact…"
          />
        </div>
        <Select
          label="Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="min-w-[180px]"
        >
          <option value="">All types</option>
          {ACTIVITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={hasFilters ? 'No matches' : 'No activities yet'}
          description={
            hasFilters
              ? 'Try adjusting your search or type filter.'
              : 'Log an activity from a business detail panel to build your timeline.'
          }
          actionLabel="Go to businesses"
          onAction={() => navigate('/businesses')}
        />
      ) : (
        <ActivityTable items={items} onRowClick={(a) => setPanel({ mode: 'view', activity: a })} />
      )}

      <ActivityPanel
        open={!!panel}
        mode={panel?.mode ?? 'view'}
        businessId={panel?.activity?.business_id}
        businessName={panel?.activity?.business_name}
        activity={panel?.activity}
        onClose={closePanel}
        onEdit={() => setPanel((p) => (p ? { ...p, mode: 'edit' } : p))}
        onDeleteRequest={(a) => setDeleteTarget(a)}
        onOpenBusiness={(businessId) =>
          navigate('/businesses', { state: { openBusinessId: businessId } })
        }
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete this activity?"
        description="This removes the log entry only. It does not undo last-contacted dates already saved on the business."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
