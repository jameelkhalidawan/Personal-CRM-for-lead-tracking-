import { useEffect, useState } from 'react';
import { Phone, Plus } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { CallTemplatePanel } from '../components/callTemplates/CallTemplatePanel';
import { CallTemplateTable } from '../components/callTemplates/CallTemplateTable';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Input';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { useDebounce } from '../hooks/useDebounce';
import { useCallTemplateStore } from '../stores/callTemplateStore';

export function CallTemplatesPage() {
  const {
    loading,
    error,
    search,
    filterCategory,
    setSearch,
    setFilterCategory,
    getFiltered,
    getCategories,
    loadAll,
    subscribeRealtime,
    unsubscribeRealtime,
    remove,
    clearError,
  } = useCallTemplateStore();

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

  const templates = getFiltered();
  const categories = getCategories();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await remove(deleteTarget.id);
    if (result.ok) {
      setDeleteTarget(null);
      setPanel(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Call Scripts"
        description="Cold call templates with multiple scripts — names and details fill in when you log a call."
        actions={
          <Button onClick={() => setPanel({ mode: 'create' })}>
            <Plus className="h-4 w-4" />
            Add template
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-priority-high/40 bg-priority-high/10 px-4 py-3 text-small text-priority-high flex justify-between gap-4">
          <div>
            <span>{error}</span>
            {/call_templates/i.test(error) && (
              <p className="mt-2 text-text-secondary">
                Run{' '}
                <code className="text-text-primary">
                  supabase/migrations/20260521_call_templates.sql
                </code>{' '}
                in the Supabase dashboard → SQL Editor, then refresh this page.
              </p>
            )}
          </div>
          <button type="button" onClick={clearError} className="underline shrink-0">
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="max-w-md flex-1 min-w-[200px]">
          <SearchInput
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search name, category, script…"
          />
        </div>
        <Select
          label="Category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="min-w-[180px]"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={3} />
      ) : templates.length === 0 ? (
        <EmptyState
          icon={Phone}
          title={localSearch.trim() || filterCategory ? 'No matches' : 'No call templates yet'}
          description={
            localSearch.trim() || filterCategory
              ? 'Try a different search or filter.'
              : 'Add templates with opening scripts, objection handlers, and closes.'
          }
          actionLabel="Add template"
          onAction={() => setPanel({ mode: 'create' })}
        />
      ) : (
        <CallTemplateTable
          templates={templates}
          onRowClick={(t) => setPanel({ mode: 'view', template: t })}
        />
      )}

      <CallTemplatePanel
        open={!!panel}
        mode={panel?.mode ?? 'view'}
        template={panel?.template}
        onClose={() => setPanel(null)}
        onEdit={() => setPanel((p) => (p ? { ...p, mode: 'edit' } : p))}
        onDeleteRequest={(t) => setDeleteTarget(t)}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete this template?"
        description="This will permanently remove the template and all its scripts for everyone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
