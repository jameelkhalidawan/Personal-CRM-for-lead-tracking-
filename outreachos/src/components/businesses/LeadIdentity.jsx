import { getLeadTitle, getLeadContext } from '../../lib/leadModel';
import { cn } from '../../lib/cn';

/** Contact-first display: name prominent, business as context */
export function LeadIdentity({
  decisionMaker,
  business,
  title,
  context,
  size = 'md',
  className,
}) {
  const leadTitle = title ?? getLeadTitle(decisionMaker, business);
  const leadContext = context ?? getLeadContext(decisionMaker, business);

  return (
    <div className={cn('min-w-0', className)}>
      <p
        className={cn(
          'font-medium text-text-primary truncate',
          size === 'lg' ? 'text-h3' : size === 'sm' ? 'text-small' : 'text-body',
        )}
      >
        {leadTitle}
      </p>
      {leadContext && leadContext !== '—' && (
        <p
          className={cn(
            'text-text-muted truncate',
            size === 'lg' ? 'text-small mt-0.5' : 'text-xs mt-0.5',
          )}
        >
          {leadContext}
        </p>
      )}
    </div>
  );
}
