function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted/60 ${className ?? ""}`} />;
}

export default function LoadingLeaderboard() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-12 space-y-0">
        {/* Header */}
        <header className="text-center space-y-4 pb-10">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-4 w-72 mx-auto" />
        </header>

        {/* Tab Switcher */}
        <section className="relative border-b border-primary/30 pb-10">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center rounded-full border border-border/60 bg-background/70 p-1 gap-1">
              <Skeleton className="h-9 w-28 rounded-full" />
              <Skeleton className="h-9 w-32 rounded-full" />
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="space-y-3">
            {/* Table Header */}
            <div className="flex items-center gap-4 px-4 py-3 border-b border-border/30">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-32 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            {/* Table Rows */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-5 w-36 flex-1" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
