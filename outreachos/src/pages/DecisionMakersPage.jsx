import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { DecisionMakerPanel } from '../components/decisionMakers/DecisionMakerPanel';
import { DecisionMakerTable } from '../components/decisionMakers/DecisionMakerTable';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/SearchInput';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { useDebounce } from '../hooks/useDebounce';
import { useDecisionMakerStore } from '../stores/decisionMakerStore';

export function DecisionMakersPage() {
  const navigate = useNavigate();
  const {
    loading,
    error,
    search,
    setSearch,
    getFiltered,
    loadAll,
    subscribeRealtime,
    unsubscribeRealtime,
    remove,
    clearError,
  } = useDecisionMakerStore();

  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 300);
  const [panel, setPanel] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    loadAll();
    subscribeRealtime();
    return () => unsubscribeRealtime();
  }, [loadAll, subscribeRealtime, unsubscribeRealtime]);

  const items = getFiltered();

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
        title="Decision Makers"
        description="Contacts and preferred channels for each business."
      />

      {error && (
        <div className="mb-4 rounded-lg border border-priority-high/40 bg-priority-high/10 px-4 py-3 text-small text-priority-high flex justify-between gap-4">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-4 max-w-md">
        <SearchInput
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by name, role, email, or business…"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Users}
          title={localSearch.trim() ? 'No matches' : 'No decision makers yet'}
          description={
            localSearch.trim()
              ? 'Try a different search term.'
              : 'Open a business and add contacts from the detail panel.'
          }
          actionLabel="Go to businesses"
          onAction={() => navigate('/businesses')}
        />
      ) : (
        <DecisionMakerTable
          items={items}
          onRowClick={(dm) => setPanel({ mode: 'view', dm })}
        />
      )}

      <DecisionMakerPanel
        open={!!panel}
        mode={panel?.mode ?? 'view'}
        businessId={panel?.dm?.business_id}
        businessName={panel?.dm?.business_name}
        decisionMaker={panel?.dm}
        onClose={closePanel}
        onEdit={() => setPanel((p) => (p ? { ...p, mode: 'edit' } : p))}
        onDeleteRequest={(dm) => setDeleteTarget(dm)}
        onOpenBusiness={(businessId) =>
          navigate('/businesses', { state: { openBusinessId: businessId } })
        }
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete this contact?"
        description="This will permanently remove the decision maker. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
