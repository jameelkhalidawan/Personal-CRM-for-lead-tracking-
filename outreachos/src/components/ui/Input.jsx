import { cn } from '../../lib/cn';

const fieldClass =
  'w-full rounded-lg border border-border bg-background-elevated px-3 py-2.5 text-body text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-primary focus:ring-1 focus:ring-accent-primary';

export function Input({ label, id, required, className, ...props }) {
  const inputId = id || props.name;
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-label uppercase text-text-muted">
          {label}
          {required && <span className="text-priority-high ml-0.5">*</span>}
        </label>
      )}
      <input id={inputId} required={required} className={fieldClass} {...props} />
    </div>
  );
}

export function Textarea({ label, id, required, className, rows = 4, ...props }) {
  const inputId = id || props.name;
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-label uppercase text-text-muted">
          {label}
          {required && <span className="text-priority-high ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        required={required}
        className={cn(fieldClass, 'resize-y min-h-[96px]')}
        {...props}
      />
    </div>
  );
}

export function Select({ label, id, required, className, children, ...props }) {
  const inputId = id || props.name;
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-label uppercase text-text-muted">
          {label}
          {required && <span className="text-priority-high ml-0.5">*</span>}
        </label>
      )}
      <select id={inputId} required={required} className={cn(fieldClass, 'cursor-pointer')} {...props}>
        {children}
      </select>
    </div>
  );
}
