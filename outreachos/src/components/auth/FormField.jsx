export function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  autoComplete,
  placeholder,
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-label uppercase text-text-muted">
        {label}
        {required && <span className="text-priority-high ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2.5 text-body text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
      />
    </div>
  );
}

export function AuthError({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-priority-high/40 bg-priority-high/10 px-3 py-2.5 text-small text-priority-high"
    >
      {message}
    </div>
  );
}

export function SubmitButton({ children, loading, disabled }) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="w-full rounded-lg bg-accent-primary py-2.5 text-body font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}
