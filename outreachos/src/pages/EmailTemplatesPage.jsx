import { useEffect, useState } from 'react';
import { Mail, Plus } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { EmailTemplatePanel } from '../components/emailTemplates/EmailTemplatePanel';
import { EmailTemplateTable } from '../components/emailTemplates/EmailTemplateTable';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Input';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { useDebounce } from '../hooks/useDebounce';
import { MigrationHint } from '../components/ui/MigrationHint';
import { useEmailTemplateStore } from '../stores/emailTemplateStore';

export function EmailTemplatesPage() {
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
  } = useEmailTemplateStore();

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
        title="Email Templates"
        description="Shared pitch and follow-up templates for your team."
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
            <MigrationHint error={error} />
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
            placeholder="Search name, subject, category…"
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
          icon={Mail}
          title={localSearch.trim() || filterCategory ? 'No matches' : 'No templates yet'}
          description={
            localSearch.trim() || filterCategory
              ? 'Try a different search or filter.'
              : 'Add templates for cold outreach and follow-ups.'
          }
          actionLabel="Add template"
          onAction={() => setPanel({ mode: 'create' })}
        />
      ) : (
        <EmailTemplateTable
          templates={templates}
          onRowClick={(t) => setPanel({ mode: 'view', template: t })}
        />
      )}

      <EmailTemplatePanel
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
        description="This will permanently remove the template for all users."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
