import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingBadges() {
  return (
    <div className="min-h-screen">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-12 space-y-12">
        {/* Header skeleton */}
        <header className="text-center space-y-4">
          <Skeleton className="h-7 w-28 mx-auto rounded-full" />
          <Skeleton className="h-12 w-40 mx-auto" />
          <Skeleton className="h-5 w-80 mx-auto" />
        </header>

        {/* Progress Ring skeleton */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-8 px-8 py-6 rounded-2xl bg-card/50 border border-border/40">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-3">
              <div className="space-y-1">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>

        {/* Category Pills skeleton */}
        <div className="flex justify-center">
          <div className="inline-flex gap-2 p-1.5 rounded-2xl bg-muted/30">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Badges Grid skeleton */}
        <div className="space-y-10">
          {[1, 2].map((section) => (
            <section key={section} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-card/80 border border-border/50"
                  >
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <Skeleton className="h-5 w-14 rounded-md" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
