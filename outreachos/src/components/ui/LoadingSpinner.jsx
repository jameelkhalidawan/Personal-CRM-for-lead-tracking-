import { cn } from '../../lib/cn';

const sizeMap = {
  sm: 'h-3.5 w-3.5 border',
  md: 'h-5 w-5 border-2',
  lg: 'h-8 w-8 border-2',
};

export function LoadingSpinner({ size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-text-muted border-t-accent-primary',
        sizeMap[size],
        className,
      )}
      aria-hidden
    />
  );
}
