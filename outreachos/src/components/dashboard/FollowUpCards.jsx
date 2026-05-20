import { CalendarClock, Sun, Sunrise } from 'lucide-react';
import { formatDateTime } from '../../lib/format';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { Card, CardBody } from '../ui/Card';
import { LeadIdentity } from '../businesses/LeadIdentity';
import { cn } from '../../lib/cn';

function FollowUpCard({ item, variant, onOpen }) {
  const { business, insight, decisionMaker, followUpAt, isOverdue } = item;
  const border =
    variant === 'today' && isOverdue
      ? 'border-priority-high/50'
      : variant === 'today'
        ? 'border-accent-secondary/50'
        : 'border-border';

  return (
    <button
      type="button"
      onClick={() => onOpen(business.id, decisionMaker?.id ?? null)}
      className={cn(
        'shrink-0 w-[300px] rounded-lg border bg-background-card p-3 text-left',
        'transition-colors hover:bg-background-elevated/60',
        border,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <LeadIdentity
          decisionMaker={decisionMaker}
          business={business}
          className="flex-1"
        />
        <StatusBadge status={business.status} className="shrink-0 scale-90" />
      </div>

      {isOverdue && (
        <p className="text-[10px] font-medium text-priority-high mt-1">Overdue</p>
      )}

      {item.contactTotal > 1 && decisionMaker && (
        <p className="text-[10px] text-text-muted mt-1">
          at {business.business_name}
        </p>
      )}

      {insight && (
        <div className="mt-3 space-y-1 border-t border-border pt-2">
          <p className="text-label uppercase text-text-muted text-[10px]">
            Next action
          </p>
          <p className="text-small text-text-primary font-medium leading-snug">
            {insight.nextAction}
          </p>
          <p className="text-xs text-text-muted">{insight.processLabel}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-3">
        <PriorityBadge priority={business.priority} />
        <span className="text-xs text-text-muted whitespace-nowrap">
          {formatDateTime(followUpAt)}
        </span>
      </div>
    </button>
  );
}

function Section({ title, subtitle, icon: Icon, items, variant, onOpen }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-text-muted" />
        <h3 className="text-h3 text-text-primary">{title}</h3>
        <span className="text-small text-text-muted">({items.length})</span>
      </div>
      {subtitle && (
        <p className="text-small text-text-muted mb-3 ml-6">{subtitle}</p>
      )}
      {items.length === 0 ? (
        <p className="text-small text-text-muted ml-6 py-2">Nothing scheduled.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {items.map((item) => (
            <FollowUpCard
              key={item.key}
              item={item}
              variant={variant}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FollowUpCards({ buckets, onOpenLead }) {
  const hasAny = buckets.today.length || buckets.tomorrow.length;

  if (!hasAny) {
    return (
      <Card className="mb-8">
        <CardBody>
          <p className="text-body text-text-secondary">
            Nothing due today or tomorrow. Set a next follow-up on a contact when you
            log outreach — it will show up here on the right day.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-h3 text-text-primary mb-1">Your schedule</h2>
      <p className="text-small text-text-muted mb-4">
        What to do today (including overdue) and what is planned for tomorrow — per
        contact.
      </p>
      <Section
        title="Do today"
        subtitle="Overdue and due today"
        icon={Sun}
        items={buckets.today}
        variant="today"
        onOpen={onOpenLead}
      />
      <Section
        title="Tomorrow"
        subtitle="Follow-ups scheduled for tomorrow only"
        icon={Sunrise}
        items={buckets.tomorrow}
        variant="tomorrow"
        onOpen={onOpenLead}
      />
    </div>
  );
}
