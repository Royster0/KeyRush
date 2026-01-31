"use client";

import React from "react";
import { Swords, TrendingUp, TrendingDown } from "lucide-react";
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
      className="relative border-y border-primary/40 py-10"
    >
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Swords className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-2xl font-mono uppercase tracking-[0.2em]">
              Ranked Stats
            </h3>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="flex flex-col items-center gap-3">
            <RankIcon
              rank={rankTier}
              size={120}
              className="opacity-95"
              title={rankTier}
            />
            <p className="text-sm font-mono uppercase tracking-[0.2em] text-primary">
              {rankTier}
            </p>
          </div>
        </motion.div>

        <div className="grid gap-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.3 }}
              className="space-y-2"
            >
              <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-muted-foreground">
                Wins
              </p>
              <div className="flex items-center gap-2 text-4xl font-semibold text-emerald-500">
                <TrendingUp className="h-5 w-5" />
                {wins}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.35 }}
              className="space-y-2"
            >
              <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-muted-foreground">
                Losses
              </p>
              <div className="flex items-center gap-2 text-4xl font-semibold text-rose-500">
                <TrendingDown className="h-5 w-5" />
                {losses}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.4 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="font-mono uppercase tracking-[0.3em]">
                Win Rate
              </span>
              <span className="text-lg font-semibold text-foreground">
                {winRate}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${winRate}%` }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary/50"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default RankedStatsCard;
