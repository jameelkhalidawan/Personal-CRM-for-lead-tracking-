import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../lib/format';
import { NextStepLabel } from './NextStepLabel';
import { contactInsightKey } from '../../lib/insightsMap';
import { getOutreachContactsForBusiness } from '../../lib/leadModel';
import { cn } from '../../lib/cn';

function SpanCell({ rowSpan, onClick, children, className }) {
  return (
    <td
      rowSpan={rowSpan}
      onClick={onClick}
      className={cn(
        'px-4 py-3 align-top',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </td>
  );
}

export function BusinessTable({
  businesses,
  insightsByContactKey = {},
  dmsByBusinessId = {},
  onBusinessClick,
  onContactClick,
}) {
  if (businesses.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[1100px] text-left text-body border-collapse">
        <thead>
          <tr className="border-b border-border bg-background-elevated/50">
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Company
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Niche
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Status
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Priority
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Services
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Contact
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Next step
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Last contact
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Next follow-up
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium text-right">
              Value
            </th>
          </tr>
        </thead>

        {businesses.map((b, businessIndex) => {
          const dms = dmsByBusinessId[b.id] ?? [];
          const contacts = getOutreachContactsForBusiness(b, dms);
          const rows = contacts.length
            ? contacts.map((dm) => ({
                dm,
                insight: insightsByContactKey[contactInsightKey(b.id, dm.id)],
              }))
            : [
                {
                  dm: null,
                  insight: insightsByContactKey[contactInsightKey(b.id, null)],
                },
              ];
          const rowSpan = rows.length;
          const openBusiness = () => onBusinessClick?.(b.id);
          const isEvenGroup = businessIndex % 2 === 0;

          return (
            <>
              {businessIndex > 0 && (
                <tbody key={`sep-${b.id}`} aria-hidden className="pointer-events-none">
                  <tr>
                    <td colSpan={10} className="p-0 border-0 bg-background-primary">
                      <div
                        className="h-1 border-t-[3px] border-b border-border/80 bg-border/30"
                        role="presentation"
                      />
                    </td>
                  </tr>
                </tbody>
              )}
            <tbody
              key={b.id}
              className={cn(
                'border-b-2 border-border',
                businessIndex > 0 && 'border-t-[3px] border-t-accent-primary/25',
                isEvenGroup
                  ? 'bg-background-card'
                  : 'bg-background-elevated/25',
              )}
            >
              {rows.map(({ dm, insight }, rowIndex) => {
                const isFirst = rowIndex === 0;
                const isLast = rowIndex === rows.length - 1;
                const openContact = () => {
                  if (dm?.id) onContactClick?.(b.id, dm.id);
                  else onBusinessClick?.(b.id);
                };

                return (
                  <tr
                    key={`${b.id}:${dm?.id ?? 'none'}`}
                    className={cn(
                      'transition-colors hover:bg-accent-primary/5',
                      !isLast && 'border-b border-border/40 border-dashed',
                    )}
                  >
                    {isFirst && (
                      <>
                        <SpanCell
                          rowSpan={rowSpan}
                          onClick={openBusiness}
                          className="border-r border-border/50"
                        >
                          <p className="font-medium text-text-primary">
                            {b.business_name}
                          </p>
                          {b.city && (
                            <p className="text-xs text-text-muted mt-0.5">{b.city}</p>
                          )}
                        </SpanCell>
                        <SpanCell rowSpan={rowSpan} onClick={openBusiness}>
                          <span className="text-text-secondary">{b.niche || '—'}</span>
                        </SpanCell>
                        <SpanCell rowSpan={rowSpan} onClick={openBusiness}>
                          <StatusBadge status={b.status} />
                        </SpanCell>
                        <SpanCell rowSpan={rowSpan} onClick={openBusiness}>
                          <PriorityBadge priority={b.priority} />
                        </SpanCell>
                        <SpanCell rowSpan={rowSpan} onClick={openBusiness}>
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {b.services?.length ? (
                              b.services.map((s) => (
                                <span
                                  key={s.id}
                                  className="rounded-md bg-background-elevated border border-border px-2 py-0.5 text-small text-text-secondary"
                                >
                                  {s.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-text-muted">—</span>
                            )}
                          </div>
                        </SpanCell>
                      </>
                    )}

                    <td className="px-4 py-2.5 cursor-pointer" onClick={openContact}>
                      {dm ? (
                        <div>
                          <p className="text-small font-medium text-text-primary">
                            {dm.name}
                            {dm.is_primary && (
                              <span className="ml-1 text-accent-primary text-[10px]">
                                ★
                              </span>
                            )}
                          </p>
                          {dm.role && (
                            <p className="text-xs text-text-muted">{dm.role}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-small text-text-muted italic">
                          No contacts
                        </span>
                      )}
                    </td>

                    <td
                      className="px-4 py-2.5 max-w-[180px] cursor-pointer"
                      onClick={openContact}
                    >
                      {insight?.nextAction ? (
                        <NextStepLabel nextAction={insight.nextAction} compact />
                      ) : (
                        <span className="text-text-muted text-small">—</span>
                      )}
                    </td>

                    <td
                      className="px-4 py-2.5 text-text-secondary whitespace-nowrap text-small cursor-pointer"
                      onClick={openContact}
                    >
                      {dm ? formatDate(dm.last_contacted_at) : '—'}
                    </td>

                    <td
                      className="px-4 py-2.5 text-text-secondary whitespace-nowrap text-small cursor-pointer"
                      onClick={openContact}
                    >
                      {dm ? formatDate(dm.next_followup_at) : '—'}
                    </td>

                    {isFirst && (
                      <SpanCell rowSpan={rowSpan} onClick={openBusiness}>
                        <span className="block text-right whitespace-nowrap text-text-secondary">
                          {formatCurrency(b.estimated_value)}
                        </span>
                      </SpanCell>
                    )}
                  </tr>
                );
              })}
            </tbody>
            </>
          );
        })}
      </table>
    </div>
  );
}
