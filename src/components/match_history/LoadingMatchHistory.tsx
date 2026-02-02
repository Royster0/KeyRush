"use client";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted/60 ${className ?? ""}`} />;
}

export default function LoadingMatchHistory() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-12 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-5 w-80 mx-auto" />
        </div>

        {/* Stats Summary */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-8 px-8 py-5 rounded-2xl bg-card/50 border border-border/40">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-8">
                <div className="text-center space-y-2">
                  <Skeleton className="h-7 w-10 mx-auto" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>
                {i < 3 && <div className="h-8 w-px bg-border/50" />}
              </div>
            ))}
          </div>
        </div>

        {/* Matches Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/40 bg-card/50 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5 flex-1">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-1.5 min-w-[90px]">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-10" />
                      <Skeleton className="h-4 w-6" />
                      <Skeleton className="h-6 w-10" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <Skeleton className="h-4 w-6" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="hidden md:block h-4 w-12" />
                    <Skeleton className="hidden lg:block h-4 w-20" />
                  </div>
                  <Skeleton className="h-5 w-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
