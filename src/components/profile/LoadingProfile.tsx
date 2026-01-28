"use client";

import React from "react";

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={`bg-muted/60 animate-pulse rounded-lg ${className || ""}`} />
  );
}

export default function LoadingProfile() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Hero Skeleton */}
      <div className="rounded-3xl bg-muted/30 border border-border/30 p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <SkeletonPulse className="w-20 h-20 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <SkeletonPulse className="h-8 w-48" />
            <SkeletonPulse className="h-4 w-32" />
          </div>
          <div className="flex gap-6">
            <div className="text-center space-y-2">
              <SkeletonPulse className="h-8 w-16 mx-auto" />
              <SkeletonPulse className="h-3 w-12 mx-auto" />
            </div>
            <div className="text-center space-y-2">
              <SkeletonPulse className="h-8 w-16 mx-auto" />
              <SkeletonPulse className="h-3 w-12 mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-muted/30 border border-border/30 p-5">
            <div className="flex items-center gap-3 mb-3">
              <SkeletonPulse className="w-8 h-8 rounded-xl" />
              <SkeletonPulse className="h-3 w-20" />
            </div>
            <SkeletonPulse className="h-7 w-24" />
          </div>
        ))}
      </div>

      {/* Leaderboard Skeleton */}
      <div className="rounded-2xl bg-muted/30 border border-border/30 p-6">
        <div className="flex items-center gap-2 mb-5">
          <SkeletonPulse className="w-9 h-9 rounded-xl" />
          <SkeletonPulse className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl bg-background/40 border border-border/50 p-4 space-y-2">
              <SkeletonPulse className="h-4 w-12" />
              <SkeletonPulse className="h-7 w-16" />
              <SkeletonPulse className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>

      {/* Ranked Stats Skeleton */}
      <div className="rounded-2xl bg-muted/30 border border-border/30 p-6">
        <div className="flex items-center gap-2 mb-6">
          <SkeletonPulse className="w-9 h-9 rounded-xl" />
          <SkeletonPulse className="h-5 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-background/40 border border-border/50 p-5 space-y-3">
              <SkeletonPulse className="h-3 w-20" />
              <SkeletonPulse className="h-8 w-24" />
              <SkeletonPulse className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Best Scores & Activity Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-muted/30 border border-border/30 p-6">
          <div className="flex items-center gap-2 mb-5">
            <SkeletonPulse className="w-9 h-9 rounded-xl" />
            <SkeletonPulse className="h-5 w-28" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-xl bg-background/40 border border-border/50 p-4">
                <div className="flex items-center gap-4">
                  <SkeletonPulse className="w-14 h-14 rounded-xl" />
                  <div className="space-y-2">
                    <SkeletonPulse className="h-6 w-20" />
                    <SkeletonPulse className="h-3 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-muted/30 border border-border/30 p-6">
          <div className="flex items-center gap-2 mb-5">
            <SkeletonPulse className="w-9 h-9 rounded-xl" />
            <SkeletonPulse className="h-5 w-20" />
          </div>
          <SkeletonPulse className="h-[320px] w-full rounded-lg" />
        </div>
      </div>

      {/* WPM Chart Skeleton */}
      <div className="rounded-2xl bg-muted/30 border border-border/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SkeletonPulse className="w-9 h-9 rounded-xl" />
            <SkeletonPulse className="h-5 w-28" />
          </div>
          <div className="flex gap-2">
            <SkeletonPulse className="h-8 w-40 rounded-lg" />
            <SkeletonPulse className="h-8 w-32 rounded-lg" />
          </div>
        </div>
        <SkeletonPulse className="h-[350px] w-full rounded-lg" />
      </div>
    </div>
  );
}
