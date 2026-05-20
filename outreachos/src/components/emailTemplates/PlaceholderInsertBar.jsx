import { TEMPLATE_PLACEHOLDERS } from '../../constants/emailTemplate';
import { cn } from '../../lib/cn';

export function PlaceholderInsertBar({ activeField, onInsert }) {
  return (
    <div className="rounded-lg border border-border bg-background-elevated/50 p-3 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-label uppercase text-text-muted">Insert variable</p>
        <p className="text-small text-text-muted">
          Into:{' '}
          <span className="text-text-secondary font-medium">
            {activeField === 'subject'
              ? 'Subject'
              : activeField === 'script'
                ? 'Script'
                : 'Body'}
          </span>
        </p>
      </div>
      <p className="text-small text-text-muted">
        Click to paste at your cursor. Focus the field you want to edit first.
      </p>
      <div className="flex flex-wrap gap-2">
        {TEMPLATE_PLACEHOLDERS.map((p) => (
          <button
            key={p.key}
            type="button"
            title={`${p.label} — inserts ${p.key}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onInsert(p.key)}
            className={cn(
              'rounded-md border border-border bg-background-card px-2.5 py-1.5',
              'text-small text-accent-secondary hover:border-accent-secondary/50',
              'hover:bg-accent-secondary/10 transition-colors',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
