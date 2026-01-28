"use client";

import React from "react";
import { Swords, Crown, Target, TrendingUp, TrendingDown } from "lucide-react";
import { getRankLabel } from "@/lib/multiplayer";
import { motion } from "motion/react";

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
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
  const rankTier = profile?.rank_tier?.trim()
    ? profile.rank_tier
    : eloValue != null
      ? getRankLabel(eloValue, matchesPlayed)
      : "Unranked";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/30 p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-xl bg-primary/10">
          <Swords className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Ranked Stats</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Rank Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-5 border border-primary/20"
        >
          <div className="absolute top-2 right-2">
            <Crown className="h-5 w-5 text-primary/40" />
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Current Rank
          </p>
          <p className="text-2xl font-bold">{rankTier}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {eloValue != null ? `${Math.round(eloValue)} Elo` : "No Elo yet"}
          </p>
        </motion.div>

        {/* Win/Loss */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.45 }}
          className="rounded-xl bg-background/40 border border-border/50 p-5"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Record
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-2xl font-bold text-emerald-500">{wins}</span>
            </div>
            <span className="text-muted-foreground">/</span>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-rose-500" />
              <span className="text-2xl font-bold text-rose-500">{losses}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {matchesPlayed} matches played
          </p>
        </motion.div>

        {/* Win Rate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="rounded-xl bg-background/40 border border-border/50 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Win Rate
            </p>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold">{winRate}%</p>
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${winRate}%` }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
            />
          </div>
        </motion.div>

        {/* Elo Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.55 }}
          className="rounded-xl bg-background/40 border border-border/50 p-5"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            1v1 Elo
          </p>
          <p className="text-3xl font-bold font-mono">
            {eloValue != null ? Math.round(eloValue) : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Ranked Mode
          </p>
        </motion.div>
      </div>

      {/* Coming Soon Modes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="mt-4 flex gap-3"
      >
        <div className="flex-1 rounded-xl bg-muted/30 border border-border/30 p-4 text-center">
          <p className="text-xs font-medium text-muted-foreground">3-Way Mode</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Coming soon</p>
        </div>
        <div className="flex-1 rounded-xl bg-muted/30 border border-border/30 p-4 text-center">
          <p className="text-xs font-medium text-muted-foreground">4-Way Mode</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Coming soon</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RankedStatsCard;
