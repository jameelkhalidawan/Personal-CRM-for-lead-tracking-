import { Input } from '../ui/Input';

/** Free-text category with suggestions from existing templates */
export function CategoryField({
  value,
  onChange,
  suggestions = [],
  label = 'Category',
  listId = 'email-template-categories',
}) {

  return (
    <div>
      <Input
        label={label}
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type any category (e.g. Cold outreach, Follow-up #2)"
      />
      <datalist id={listId}>
        {suggestions.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <p className="text-small text-text-muted mt-1">
        Type a new category or pick a suggestion — not limited to a fixed list.
      </p>
    </div>
  );
}
