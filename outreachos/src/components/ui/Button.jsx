import { cn } from '../../lib/cn';
import { LoadingSpinner } from './LoadingSpinner';

const variants = {
  primary:
    'bg-accent-primary text-white hover:bg-accent-hover border border-transparent',
  secondary:
    'bg-background-elevated text-text-primary border border-border hover:border-border-hover',
  ghost:
    'bg-transparent text-text-secondary border border-transparent hover:bg-background-elevated hover:text-text-primary',
  danger:
    'bg-priority-high/15 text-priority-high border border-priority-high/40 hover:bg-priority-high/25',
};

const sizes = {
  sm: 'px-3 py-1.5 text-small',
  md: 'px-4 py-2.5 text-body',
  lg: 'px-5 py-3 text-body',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  loading,
  disabled,
  children,
  ...props
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}
