export function EmailTemplateTable({ templates, onRowClick }) {
  if (!templates.length) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[700px] text-left text-body">
        <thead>
          <tr className="border-b border-border bg-background-elevated/50">
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Name
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Category
            </th>
            <th className="px-4 py-3 text-label uppercase text-text-muted font-medium">
              Subject
            </th>
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => (
            <tr
              key={t.id}
              onClick={() => onRowClick(t)}
              className="border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-background-elevated/40"
            >
              <td className="px-4 py-3 font-medium text-text-primary">{t.name}</td>
              <td className="px-4 py-3 text-text-secondary">{t.category || '—'}</td>
              <td className="px-4 py-3 text-text-secondary max-w-[360px] truncate">
                {t.subject || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
