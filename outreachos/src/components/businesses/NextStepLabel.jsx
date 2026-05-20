import { ListTodo } from 'lucide-react';
import { cn } from '../../lib/cn';

export function NextStepLabel({ nextAction, processLabel, className, compact = false }) {
  if (!nextAction) return null;
  return (
    <div className={cn('flex items-start gap-1.5 min-w-0', className)}>
      <ListTodo className="h-3.5 w-3.5 text-accent-secondary shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p
          className={cn(
            'text-text-primary font-medium truncate',
            compact ? 'text-xs' : 'text-small',
          )}
        >
          {nextAction}
        </p>
        {processLabel && !compact && (
          <p className="text-xs text-text-muted truncate">{processLabel}</p>
        )}
      </div>
    </div>
  );
}
