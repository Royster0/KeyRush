function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted/60 ${className ?? ""}`} />;
}

export default function LoadingMultiplayer() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-3 mb-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-10 w-56" />
        </div>
        <Skeleton className="h-4 w-72 mx-auto" />
      </div>

      {/* Rank Display Card */}
      <div className="rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
            <div className="text-center space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border-2 border-border/60 p-5 space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border-2 border-border/60 p-5 space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-52" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Match Settings */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-muted/40 p-5 space-y-4">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-16 rounded-md" />
            <Skeleton className="h-9 w-16 rounded-md" />
            <Skeleton className="h-9 w-16 rounded-md" />
          </div>
        </div>
        <div className="rounded-xl bg-muted/40 p-5 space-y-4">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-16 rounded-md" />
            <Skeleton className="h-9 w-16 rounded-md" />
          </div>
        </div>
      </div>

      {/* Queue Button */}
      <div className="pt-4 flex justify-center">
        <Skeleton className="h-14 w-48 rounded-md" />
      </div>
    </div>
  );
}
