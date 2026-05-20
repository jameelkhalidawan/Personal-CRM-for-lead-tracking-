import { AlertCircle, CalendarClock, Clock, ListTodo } from 'lucide-react';
import { formatDateTime } from '../../lib/format';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { Card, CardBody } from '../ui/Card';

import { LeadIdentity } from '../businesses/LeadIdentity';

function FollowUpCard({ item, variant, onOpen, rich = false }) {
  const { business, insight, decisionMaker } = item;
  const border =
    variant === 'overdue'
      ? 'border-priority-high/50'
      : variant === 'today'
        ? 'border-accent-secondary/50'
        : 'border-border';

  const width = rich ? 'w-[300px]' : 'w-[260px]';

  return (
    <button
      type="button"
      onClick={() => onOpen(business.id)}
      className={`shrink-0 ${width} rounded-lg border bg-background-card p-3 text-left transition-colors hover:bg-background-elevated/60 ${border}`}
    >
      <div className="flex items-start justify-between gap-2">
        <LeadIdentity
          decisionMaker={decisionMaker}
          business={business}
          className="flex-1"
        />
        <StatusBadge status={business.status} className="shrink-0 scale-90" />
      </div>

      {item.contactTotal > 1 && (
        <p className="text-[10px] text-text-muted mt-1">
          Contact {item.contactIndex} of {item.contactTotal} at {business.business_name}
        </p>
      )}

      {rich && (
        <div className="mt-3 space-y-2 border-t border-border pt-2">
          <div className="flex items-start gap-1.5">
            <ListTodo className="h-3.5 w-3.5 text-accent-secondary shrink-0 mt-0.5" />
            <div>
              <p className="text-label uppercase text-text-muted text-[10px]">Next action</p>
              <p className="text-small text-text-primary font-medium leading-snug">
                {insight.nextAction}
              </p>
            </div>
          </div>
          <p className="text-xs text-text-muted pl-5">{insight.processLabel}</p>
          {insight.lastActivityLabel && (
            <p className="text-xs text-text-muted pl-5">
              Last logged: {insight.lastActivityLabel}
            </p>
          )}
          {insight.note && (
            <p className="text-xs text-text-secondary pl-5 line-clamp-3 italic">
              &ldquo;{insight.note}&rdquo;
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-3">
        <PriorityBadge priority={business.priority} />
        <span className="text-xs text-text-muted whitespace-nowrap">
          {formatDateTime(business.next_followup_at)}
        </span>
      </div>
    </button>
  );
}

function Section({ title, icon: Icon, items, variant, onOpen, rich }) {
  if (!items.length) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-text-muted" />
        <h3 className="text-h3 text-text-primary">{title}</h3>
        <span className="text-small text-text-muted">({items.length})</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <FollowUpCard
            key={item.business.id}
            item={item}
            variant={variant}
            onOpen={onOpen}
            rich={rich}
          />
        ))}
      </div>
    </div>
  );
}

export function FollowUpCards({ buckets, onOpenBusiness, loadingContext }) {
  const hasAny =
    buckets.overdue.length || buckets.dueToday.length || buckets.upcoming.length;

  if (!hasAny) {
    return (
      <Card className="mb-8">
        <CardBody>
          <p className="text-body text-text-secondary">
            No scheduled follow-ups. Set a next follow-up date when logging activities.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-h3 text-text-primary mb-1">Today&apos;s actions</h2>
      <p className="text-small text-text-muted mb-4">
        {loadingContext
          ? 'Loading next steps and notes…'
          : 'Shows pipeline status, suggested outreach step, and notes where available.'}
      </p>
      <Section
        title="Overdue"
        icon={AlertCircle}
        items={buckets.overdue}
        variant="overdue"
        onOpen={onOpenBusiness}
        rich
      />
      <Section
        title="Due today"
        icon={CalendarClock}
        items={buckets.dueToday}
        variant="today"
        onOpen={onOpenBusiness}
        rich
      />
      <Section
        title="Coming up"
        icon={Clock}
        items={buckets.upcoming}
        variant="upcoming"
        onOpen={onOpenBusiness}
        rich
      />
    </div>
  );
}
