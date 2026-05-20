import { useState } from 'react';
import { BUSINESS_STATUSES } from '../../constants/business';
import { formatCurrency, formatDate } from '../../lib/format';
import { groupLeadsByStatus } from '../../lib/dashboardStats';
import { contactInsightKey } from '../../lib/insightsMap';
import { PriorityBadge } from '../ui/Badge';
import { NextStepLabel } from '../businesses/NextStepLabel';
import { LeadIdentity } from '../businesses/LeadIdentity';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { cn } from '../../lib/cn';

function KanbanCard({ lead, insight, onOpen }) {
  const { business, decisionMaker } = lead;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/business-id', business.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={() => onOpen(business.id, decisionMaker?.id ?? null)}
      className="rounded-lg border border-border bg-background-card p-3 cursor-grab active:cursor-grabbing transition-shadow hover:border-accent-primary/40 hover:shadow-md"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen(business.id, decisionMaker?.id ?? null);
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
      {decisionMaker?.next_followup_at && (
        <p className="text-xs text-text-muted mt-1">
          Follow-up: {formatDate(decisionMaker.next_followup_at)}
        </p>
      )}
    </div>
  );
}

function KanbanColumn({
  label,
  leads,
  insightsByContactKey,
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
          {leads.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {leads.map((lead) => (
          <KanbanCard
            key={lead.key}
            lead={lead}
            insight={
              insightsByContactKey?.[
                contactInsightKey(lead.business.id, lead.decisionMaker?.id)
              ]
            }
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}

export function PipelineKanban({
  leads = [],
  loading,
  insightsByContactKey = {},
  onStatusChange,
  onOpenLead,
}) {
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const groups = groupLeadsByStatus(leads);

  const handleDrop = (status) => (e) => {
    e.preventDefault();
    setDragOverStatus(null);
    const id = e.dataTransfer.getData('text/business-id');
    if (!id) return;
    const lead = leads.find((l) => l.business.id === id);
    if (lead && lead.business.status !== status) {
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
        One card per contact. Drag to update company status. Click to open that person.
      </p>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {BUSINESS_STATUSES.map(({ value, label }) => (
          <KanbanColumn
            key={value}
            label={label}
            leads={groups[value] ?? []}
            insightsByContactKey={insightsByContactKey}
            dragOver={dragOverStatus === value}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setDragOverStatus(value);
            }}
            onDragLeave={() => setDragOverStatus((s) => (s === value ? null : s))}
            onDrop={handleDrop(value)}
            onOpen={onOpenLead}
          />
        ))}
      </div>
    </div>
  );
}
