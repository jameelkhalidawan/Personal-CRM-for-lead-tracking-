export function TableSkeleton({ rows = 6, cols = 6 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-lg border border-border bg-background-card px-4 py-3"
        >
          {Array.from({ length: cols }).map((__, j) => (
            <div
              key={j}
              className="h-4 flex-1 animate-pulse rounded bg-background-elevated"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
