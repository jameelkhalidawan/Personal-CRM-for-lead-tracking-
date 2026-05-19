import { ACTIVITY_TYPE_LABELS } from '../../constants/activity';
import { cn } from '../../lib/cn';

const TYPE_STYLES = {
  cold_email: 'border-accent-secondary/40 text-accent-secondary',
  followup_email: 'border-accent-secondary/40 text-accent-secondary',
  call: 'border-status-contacted/40 text-status-contacted',
  whatsapp: 'border-status-interested/40 text-status-interested',
  meeting: 'border-accent-primary/40 text-accent-primary',
  proposal: 'border-status-proposal/40 text-status-proposal',
  interested: 'border-status-interested/40 text-status-interested',
  closed: 'border-status-closed_won/40 text-status-closed_won',
  note: 'border-border text-text-secondary',
};

export function ActivityTypeBadge({ type, className }) {
  const label = ACTIVITY_TYPE_LABELS[type] ?? type?.replace(/_/g, ' ') ?? 'Activity';
  return (
    <span
      className={cn(
        'inline-flex rounded-md border px-2 py-0.5 text-small font-medium capitalize',
        TYPE_STYLES[type] ?? 'border-border text-text-secondary',
        className,
      )}
    >
      {label}
    </span>
  );
}
