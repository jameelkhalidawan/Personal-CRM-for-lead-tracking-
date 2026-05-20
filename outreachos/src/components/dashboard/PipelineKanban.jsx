import { useState } from 'react';
import { BUSINESS_STATUSES } from '../../constants/business';
import { formatCurrency, formatDate } from '../../lib/format';
import { groupBusinessesByStatus } from '../../lib/dashboardStats';
import { PriorityBadge } from '../ui/Badge';
import { NextStepLabel } from '../businesses/NextStepLabel';
import { LeadIdentity } from '../businesses/LeadIdentity';
import { pickPrimaryContact } from '../../lib/contactPick';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { cn } from '../../lib/cn';

function KanbanCard({ business, insight, decisionMaker, onOpen }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/business-id', business.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={() => onOpen(business.id)}
      className="rounded-lg border border-border bg-background-card p-3 cursor-grab active:cursor-grabbing transition-shadow hover:border-accent-primary/40 hover:shadow-md"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen(business.id);
      }}
    >
      <LeadIdentity
        decisionMaker={decisionMaker}
        business={business}
        size="sm"
      />
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <PriorityBadge priority={business.priority} />
        {business.estimated_value != null && business.estimated_value !== '' && (
          <span className="text-xs text-text-secondary">
            {formatCurrency(business.estimated_value)}
          </span>
        )}
      </div>
      {insight?.nextAction && (
        <div className="mt-2">
          <NextStepLabel nextAction={insight.nextAction} compact />
        </div>
      )}
      {business.next_followup_at && (
        <p className="text-xs text-text-muted mt-1">
          Follow-up: {formatDate(business.next_followup_at)}
        </p>
      )}
    </div>
  );
}

function KanbanColumn({
  status,
  label,
  businesses,
  insightsByBusinessId,
  dmsByBusiness,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onOpen,
}) {
  return (
    <div
      className={cn(
        'flex w-[240px] shrink-0 flex-col rounded-xl border bg-background-elevated/30 min-h-[320px] max-h-[calc(100vh-280px)]',
        dragOver ? 'border-accent-primary ring-1 ring-accent-primary/40' : 'border-border',
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5 shrink-0">
        <span className="text-small font-medium text-text-primary">{label}</span>
        <span className="text-xs text-text-muted rounded-full bg-background-elevated px-2 py-0.5">
          {businesses.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {businesses.map((b) => (
          <KanbanCard
            key={b.id}
            business={b}
            insight={insightsByBusinessId?.[b.id]}
            decisionMaker={pickPrimaryContact(dmsByBusiness?.[b.id], b)}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}

export function PipelineKanban({
  businesses,
  loading,
  insightsByBusinessId = {},
  dmsByBusiness = {},
  onStatusChange,
  onOpenBusiness,
}) {
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const groups = groupBusinessesByStatus(businesses);

  const handleDrop = (status) => (e) => {
    e.preventDefault();
    setDragOverStatus(null);
    const id = e.dataTransfer.getData('text/business-id');
    if (!id) return;
    const business = businesses.find((b) => b.id === id);
    if (business && business.status !== status) {
      onStatusChange(id, status);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-h3 text-text-primary mb-4">Pipeline</h2>
      <p className="text-small text-text-muted mb-4">
        Drag cards between columns to update status. Click a card to open the business.
      </p>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {BUSINESS_STATUSES.map(({ value, label }) => (
          <KanbanColumn
            key={value}
            status={value}
            label={label}
            businesses={groups[value] ?? []}
            insightsByBusinessId={insightsByBusinessId}
            dmsByBusiness={dmsByBusiness}
            dragOver={dragOverStatus === value}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setDragOverStatus(value);
            }}
            onDragLeave={() => setDragOverStatus((s) => (s === value ? null : s))}
            onDrop={handleDrop(value)}
            onOpen={onOpenBusiness}
          />
        ))}
      </div>
    </div>
  );
}
