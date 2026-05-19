import { formatDateTime } from '../../lib/format';
import { ActivityTypeBadge } from './ActivityTypeBadge';

export function ActivityTable({ items, onRowClick }) {
  if (!items.length) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[900px] text-left text-body">
        <thead>
          <tr className="border-b border-border bg-background-elevated/50">
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Type
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Business
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Contact
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Notes
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              When
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Follow-up
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr
              key={a.id}
              onClick={() => onRowClick(a)}
              className="border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-background-elevated/40"
            >
              <td className="px-4 py-3">
                <ActivityTypeBadge type={a.type} />
              </td>
              <td className="px-4 py-3 text-text-primary font-medium">
                {a.business_name || '—'}
              </td>
              <td className="px-4 py-3 text-text-secondary">
                {a.decision_maker_name || '—'}
              </td>
              <td className="px-4 py-3 text-text-secondary max-w-[280px] truncate">
                {a.notes || '—'}
              </td>
              <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                {formatDateTime(a.created_at)}
              </td>
              <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                {a.followup_at ? formatDateTime(a.followup_at) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
