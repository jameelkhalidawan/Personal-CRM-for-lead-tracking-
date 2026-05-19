import { cn } from '../../lib/cn';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-background-card',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn('border-b border-border px-6 py-4', className)}>{children}</div>;
}

export function CardBody({ className, children }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}
