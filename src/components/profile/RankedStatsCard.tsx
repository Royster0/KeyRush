"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { getRankLabel } from "@/lib/multiplayer";

type RankedStatsProfile = {
  elo?: number | null;
  rank_tier?: string | null;
  matches_played?: number | null;
  wins?: number | null;
  losses?: number | null;
};

interface RankedStatsCardProps {
  profile?: RankedStatsProfile | null;
}

const RankedStatsCard: React.FC<RankedStatsCardProps> = ({ profile }) => {
  const eloValue = typeof profile?.elo === "number" ? profile.elo : null;
  const matchesPlayed = profile?.matches_played ?? 0;
  const wins = profile?.wins ?? 0;
  const losses = profile?.losses ?? 0;
  const rankTier = profile?.rank_tier?.trim()
    ? profile.rank_tier
    : eloValue != null
      ? getRankLabel(eloValue, matchesPlayed)
      : "Unranked";

  return (
    <Card className="w-full border-none bg-muted/40 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Trophy className="size-5 text-primary" />
          Ranked Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Current Rank</p>
          <p className="text-3xl font-bold">{rankTier}</p>
          <p className="text-xs text-muted-foreground">
            {matchesPlayed} ranked matches played
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Ranked Record</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-500">{wins}</span>
            <span className="text-sm text-muted-foreground">Wins</span>
            <span className="text-3xl font-bold text-rose-500">{losses}</span>
            <span className="text-sm text-muted-foreground">Losses</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {wins + losses} total matches
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
          <div className="rounded-lg border border-border/50 bg-background/40 p-4 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">1v1 Elo</p>
            <p className="text-3xl font-bold font-mono">
              {eloValue != null ? Math.round(eloValue) : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Ranked</p>
          </div>

          <div className="rounded-lg border border-border/50 bg-background/40 p-4 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">3-Way Elo</p>
            <p className="text-2xl font-semibold text-muted-foreground">Coming soon</p>
            <p className="text-xs text-muted-foreground">Not available yet</p>
          </div>

          <div className="rounded-lg border border-border/50 bg-background/40 p-4 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">4-Way Elo</p>
            <p className="text-2xl font-semibold text-muted-foreground">Coming soon</p>
            <p className="text-xs text-muted-foreground">Not available yet</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RankedStatsCard;
