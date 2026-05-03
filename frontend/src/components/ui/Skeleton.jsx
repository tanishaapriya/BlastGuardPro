export function Skeleton({ className = '', rounded = 'rounded-lg' }) {
  return <div className={`skeleton-shimmer ${rounded} ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700/50 p-5" style={{ background: '#1E293B' }}>
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-8 w-2/3 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-slate-800">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}
