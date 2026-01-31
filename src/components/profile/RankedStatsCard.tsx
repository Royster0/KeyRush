"use client";

import React from "react";
import { Swords, TrendingUp, TrendingDown, Target, Gauge } from "lucide-react";
import { getRankLabel } from "@/lib/multiplayer";
import { motion } from "motion/react";
import { RankIcon } from "@/components/RankIcon";

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
  const winRate =
    wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
  const rankTier = profile?.rank_tier?.trim()
    ? profile.rank_tier
    : eloValue != null
      ? getRankLabel(eloValue, matchesPlayed)
      : "Unranked";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
      className="relative border-y border-primary/30 py-10"
    >
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 h-40 w-40 rounded-full" />
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Swords className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-xl font-mono uppercase tracking-[0.15em]">
            Ranked Stats
          </h3>
        </div>
        {matchesPlayed > 0 && (
          <span className="text-xs text-muted-foreground font-mono">
            {matchesPlayed} matches played
          </span>
        )}
      </div>

      <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)]">
        {/* Rank Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl" />
            <RankIcon
              rank={rankTier}
              size={150}
              className="relative"
              title={rankTier}
            />
          </div>
          <p className="text-lg font-semibold tracking-wide">{rankTier}</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.3 }}
              className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
            >
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-[11px] font-mono uppercase tracking-wider">
                  Wins
                </span>
              </div>
              <p className="text-3xl font-bold text-emerald-500 tabular-nums">
                {wins}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.35 }}
              className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4"
            >
              <div className="flex items-center gap-2 text-rose-500 mb-2">
                <TrendingDown className="h-4 w-4" />
                <span className="text-[11px] font-mono uppercase tracking-wider">
                  Losses
                </span>
              </div>
              <p className="text-3xl font-bold text-rose-500 tabular-nums">
                {losses}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.4 }}
              className="rounded-xl border border-border/60 bg-muted/30 p-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Target className="h-4 w-4" />
                <span className="text-[11px] font-mono uppercase tracking-wider">
                  Win Rate
                </span>
              </div>
              <p className="text-3xl font-bold tabular-nums">{winRate}%</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.45 }}
              className="rounded-xl border border-primary/10 bg-primary/1 p-4"
            >
              <div className="flex items-center gap-2 text-primary mb-2">
                <Gauge className="h-4 w-4" />
                <span className="text-[11px] font-mono uppercase tracking-wider">
                  Elo
                </span>
              </div>
              <p className="text-3xl font-bold text-primary tabular-nums">
                {eloValue != null ? Math.round(eloValue) : "—"}
              </p>
            </motion.div>
          </div>

          {/* Win Rate Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.5 }}
            className="space-y-2"
          >
            <div
              className="relative h-3 rounded-full overflow-hidden"
              style={{
                background:
                  "linear-gradient(to right, rgb(16 185 129 / 0.8) 0%, rgb(16 185 129 / 0.8) 40%, rgb(245 158 11 / 0.8) 70%, rgb(244 63 94 / 0.8) 100%)",
              }}
            >
              {/* Dark overlay for losses portion (right side) */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${100 - winRate}%` }}
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                className="absolute top-0 right-0 h-full bg-background/70"
              />
              {/* Position indicator */}
              <motion.div
                initial={{ left: "0%" }}
                animate={{ left: `${winRate}%` }}
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                className="absolute top-0 h-full w-0.5 bg-foreground/80 -translate-x-1/2"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default RankedStatsCard;
