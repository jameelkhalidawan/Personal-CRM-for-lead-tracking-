import { Button } from './Button';

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-background-elevated">
          <Icon className="h-7 w-7 text-text-muted" />
        </div>
      )}
      <h3 className="text-h3 text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-text-secondary text-body max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
