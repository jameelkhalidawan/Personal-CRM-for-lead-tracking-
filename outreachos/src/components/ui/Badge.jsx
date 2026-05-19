import { cn } from '../../lib/cn';

const statusStyles = {
  new: 'bg-status-new/20 text-status-new border-status-new/40',
  contacted: 'bg-status-contacted/20 text-status-contacted border-status-contacted/40',
  interested: 'bg-status-interested/20 text-status-interested border-status-interested/40',
  proposal_sent: 'bg-status-proposal/20 text-status-proposal border-status-proposal/40',
  closed_won: 'bg-status-closed_won/20 text-status-closed_won border-status-closed_won/40',
  closed_lost: 'bg-status-closed_lost/20 text-status-closed_lost border-status-closed_lost/40',
  not_interested:
    'bg-status-not_interested/20 text-status-not_interested border-status-not_interested/40',
};

const priorityStyles = {
  high: 'bg-priority-high/20 text-priority-high border-priority-high/40',
  medium: 'bg-priority-medium/20 text-priority-medium border-priority-medium/40',
  low: 'bg-priority-low/20 text-text-muted border-priority-low/40',
};

const statusLabels = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  proposal_sent: 'Proposal Sent',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
  not_interested: 'Not Interested',
};

export function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-small font-medium capitalize',
        statusStyles[status] ?? statusStyles.new,
        className,
      )}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

export function PriorityBadge({ priority, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-small font-medium capitalize',
        priorityStyles[priority] ?? priorityStyles.medium,
        className,
      )}
    >
      {priority}
    </span>
  );
}
