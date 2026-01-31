"use client";

import React from "react";

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={`bg-muted/60 animate-pulse rounded-lg ${className || ""}`} />
  );
}

export default function LoadingProfile() {
  return (
    <div className="relative py-10 overflow-x-hidden">
      <div className="container relative z-10 mx-auto max-w-6xl px-4 space-y-0">
        {/* Profile Overview Skeleton */}
        <section className="py-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
            <div className="space-y-4">
              <SkeletonPulse className="h-10 w-64" />
              <SkeletonPulse className="h-4 w-40" />
            </div>
            <div className="grid gap-4 lg:pl-8">
              <div className="flex items-center justify-between">
                <SkeletonPulse className="h-3 w-28" />
                <SkeletonPulse className="h-8 w-20" />
              </div>
              <div className="flex items-center justify-between">
                <SkeletonPulse className="h-3 w-28" />
                <SkeletonPulse className="h-8 w-20" />
              </div>
            </div>
          </div>
        </section>

        {/* Ranked Stats Skeleton */}
        <section className="border-y border-primary/40 py-10">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="h-5 w-5" />
            <SkeletonPulse className="h-6 w-44" />
          </div>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
            <div className="flex flex-col items-center gap-3">
              <SkeletonPulse className="h-24 w-24 rounded-full" />
              <SkeletonPulse className="h-4 w-28" />
            </div>
            <div className="grid gap-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <SkeletonPulse className="h-3 w-24" />
                    <SkeletonPulse className="h-10 w-20" />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <SkeletonPulse className="h-3 w-24" />
                  <SkeletonPulse className="h-4 w-12" />
                </div>
                <SkeletonPulse className="h-2 w-full rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* Best Scores Skeleton */}
        <section className="border-b border-primary/40 py-10">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="h-5 w-5" />
            <SkeletonPulse className="h-6 w-40" />
          </div>
          <div className="mt-8 grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-6 overflow-x-auto pb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-r-4 p-4 space-y-3">
                <SkeletonPulse className="h-3 w-20" />
                <SkeletonPulse className="h-10 w-24" />
                <SkeletonPulse className="h-3 w-28" />
                <div className="flex gap-3">
                  <SkeletonPulse className="h-3 w-20" />
                  <SkeletonPulse className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Leaderboard Skeleton */}
        <section className="border-b border-primary/40 py-10">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="h-5 w-5" />
            <SkeletonPulse className="h-6 w-56" />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-r-4 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <SkeletonPulse className="h-3 w-16" />
                  <SkeletonPulse className="h-4 w-16 rounded-full" />
                </div>
                <SkeletonPulse className="h-8 w-20" />
                <SkeletonPulse className="h-3 w-24" />
              </div>
            ))}
          </div>
        </section>

        {/* XP Progress Skeleton */}
        <section className="border-b border-primary/40 py-10">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="h-5 w-5" />
            <SkeletonPulse className="h-6 w-40" />
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <SkeletonPulse className="h-10 w-10 rounded-2xl" />
                <div className="space-y-2">
                  <SkeletonPulse className="h-3 w-24" />
                  <SkeletonPulse className="h-8 w-16" />
                </div>
              </div>
              <SkeletonPulse className="h-3 w-32" />
            </div>
            <div className="space-y-3 md:col-span-1 lg:col-span-2">
              <div className="flex items-center justify-between">
                <SkeletonPulse className="h-3 w-28" />
                <SkeletonPulse className="h-4 w-12" />
              </div>
              <SkeletonPulse className="h-2 w-full rounded-full" />
              <SkeletonPulse className="h-3 w-40" />
              <SkeletonPulse className="h-3 w-32" />
            </div>
          </div>
        </section>

        {/* Activity Skeleton */}
        <section className="border-b border-primary/40 py-10">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="h-5 w-5" />
            <SkeletonPulse className="h-6 w-32" />
            <SkeletonPulse className="h-3 w-24 ml-auto" />
          </div>
          <SkeletonPulse className="mt-6 h-[320px] w-full rounded-[28px]" />
        </section>

        {/* WPM Chart Skeleton */}
        <section className="border-b border-border/70 py-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <SkeletonPulse className="h-5 w-5" />
              <SkeletonPulse className="h-6 w-40" />
            </div>
            <div className="flex gap-2">
              <SkeletonPulse className="h-8 w-44 rounded-full" />
              <SkeletonPulse className="h-8 w-36 rounded-full" />
            </div>
          </div>
          <SkeletonPulse className="mt-6 h-[350px] w-full rounded-[28px]" />
        </section>
      </div>
    </div>
  );
}
