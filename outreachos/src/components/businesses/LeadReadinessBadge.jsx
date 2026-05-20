import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getLeadReadiness } from '../../lib/leadReadiness';
import { getContactReadiness } from '../../lib/leadModel';
import { cn } from '../../lib/cn';

export function LeadReadinessBadge({
  business,
  decisionMakers = [],
  focusContact = null,
  className,
}) {
  const { ready, issues } = focusContact
    ? getContactReadiness(focusContact, business)
    : getLeadReadiness(business, decisionMakers);
  if (ready) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-md border border-status-interested/40 bg-status-interested/10 px-2 py-0.5 text-small text-status-interested',
          className,
        )}
        title="Ready for outreach"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Ready
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-priority-high/40 bg-priority-high/10 px-2 py-0.5 text-small text-priority-high',
        className,
      )}
      title={issues.join(' · ')}
    >
      <AlertTriangle className="h-3.5 w-3.5" />
      Needs: {issues.join(', ')}
    </span>
  );
}
