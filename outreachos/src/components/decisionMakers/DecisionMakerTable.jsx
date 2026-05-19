import { formatDate } from '../../lib/format';
import { PreferredContactIcon } from './PreferredContactIcon';

export function DecisionMakerTable({ items, onRowClick }) {
  if (!items.length) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[800px] text-left text-body">
        <thead>
          <tr className="border-b border-border bg-background-elevated/50">
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Name
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Business
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Role
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Email
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Preferred
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Next follow-up
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((dm) => (
            <tr
              key={dm.id}
              onClick={() => onRowClick(dm)}
              className="border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-background-elevated/40"
            >
              <td className="px-4 py-3 font-medium text-text-primary">{dm.name}</td>
              <td className="px-4 py-3 text-text-secondary">
                {dm.business_name || '—'}
              </td>
              <td className="px-4 py-3 text-text-secondary">{dm.role || '—'}</td>
              <td className="px-4 py-3 text-text-secondary">{dm.email || '—'}</td>
              <td className="px-4 py-3">
                <PreferredContactIcon method={dm.preferred_contact} />
              </td>
              <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                {formatDate(dm.next_followup_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
