import { Search } from 'lucide-react';
import { cn } from '../../lib/cn';

export function SearchInput({ className, ...props }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
      <input
        type="search"
        className="w-full rounded-lg border border-border bg-background-elevated py-2.5 pl-10 pr-3 text-body text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
        {...props}
      />
    </div>
  );
}
