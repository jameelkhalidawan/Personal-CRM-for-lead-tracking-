import { FOLLOW_UP_SNIPPETS, followUpDaysFromNow } from '../../lib/followUpPresets';
import { cn } from '../../lib/cn';

export function FollowUpPresets({ value, onChange, className }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {FOLLOW_UP_SNIPPETS.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => onChange(followUpDaysFromNow(s.days))}
          className={cn(
            'rounded-md border border-border px-2.5 py-1 text-small transition-colors',
            value === followUpDaysFromNow(s.days)
              ? 'border-accent-primary bg-accent-primary/15 text-text-primary'
              : 'text-text-secondary hover:border-accent-primary/40 hover:bg-background-elevated',
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
