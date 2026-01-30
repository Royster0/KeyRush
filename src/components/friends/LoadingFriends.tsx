"use client";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted/60 ${className ?? ""}`} />;
}

export default function LoadingFriends() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-muted/40 to-muted/20 p-8 border border-border/30">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-6">
            <div className="text-center space-y-1">
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="text-center space-y-1">
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Invite Friends Card Skeleton */}
      <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-muted/50 to-muted/20 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-4 w-56" />
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Friend Requests Card Skeleton */}
      <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-muted/50 to-muted/20 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-24" />
        <div className="rounded-xl border border-dashed border-border/50 bg-background/30 p-6 flex items-center justify-center">
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Your Friends Card Skeleton */}
      <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-muted/50 to-muted/20 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-4 w-20" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="rounded-2xl border border-border/30 bg-gradient-to-br from-card to-card/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/30 bg-background/60 p-3 space-y-2">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="rounded-xl border border-border/30 bg-background/60 p-3 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
