"use client";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted/60 ${className ?? ""}`} />;
}

export default function LoadingMatchHistory() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="mb-6">
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border/60 bg-card/50 p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-[120px]">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-3 w-8" />
              </div>
              <div className="flex items-center gap-2 min-w-[100px]">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
