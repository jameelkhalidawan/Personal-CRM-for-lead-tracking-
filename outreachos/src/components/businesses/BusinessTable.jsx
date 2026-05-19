import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../lib/format';

export function BusinessTable({ businesses, onRowClick }) {
  if (businesses.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[900px] text-left text-body">
        <thead>
          <tr className="border-b border-border bg-background-elevated/50">
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Name
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
              Last Contact
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Next Follow-up
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium text-right">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {businesses.map((b) => (
            <tr
              key={b.id}
              onClick={() => onRowClick(b.id)}
              className="border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-background-elevated/40"
            >
              <td className="px-4 py-3 font-medium text-text-primary">
                {b.business_name}
              </td>
              <td className="px-4 py-3 text-text-secondary">{b.niche || '—'}</td>
              <td className="px-4 py-3">
                <StatusBadge status={b.status} />
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={b.priority} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1 max-w-[200px]">
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
              </td>
              <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                {formatDate(b.last_contacted_at)}
              </td>
              <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                {formatDate(b.next_followup_at)}
              </td>
              <td className="px-4 py-3 text-text-secondary text-right whitespace-nowrap">
                {formatCurrency(b.estimated_value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
