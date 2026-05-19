import { formatDateTime } from '../../lib/format';
import { ActivityTypeBadge } from './ActivityTypeBadge';

export function ActivityTimeline({ activities, onSelect }) {
  if (!activities?.length) {
    return <p className="text-small text-text-muted">None yet</p>;
  }

  return (
    <ul className="space-y-2">
      {activities.map((a) => (
        <li key={a.id}>
          <button
            type="button"
            onClick={() => onSelect?.(a)}
            className="w-full rounded-lg border border-border px-3 py-2 text-left text-small transition-colors hover:bg-background-elevated/50"
          >
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <ActivityTypeBadge type={a.type} />
              <span className="text-text-muted">{formatDateTime(a.created_at)}</span>
            </div>
            {a.decision_maker_name && (
              <p className="text-text-muted text-xs">with {a.decision_maker_name}</p>
            )}
            {a.notes && (
              <p className="text-text-secondary mt-1 line-clamp-2">{a.notes}</p>
            )}
            {a.followup_at && (
              <p className="text-text-muted text-xs mt-1">
                Follow-up: {formatDateTime(a.followup_at)}
              </p>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
