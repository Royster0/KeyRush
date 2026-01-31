"use client";

import React from "react";
import { Trophy, Medal, Crown, Award } from "lucide-react";
import { motion } from "motion/react";
import { formatDuration } from "@/lib/utils";

interface LeaderboardRankingsProps {
  leaderboardRankings: Array<{
    duration: number;
    rank: number | string;
    totalUsers: number;
  }>;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-4 w-4 text-primary" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-muted-foreground" />;
  if (rank === 3) return <Award className="h-4 w-4 text-primary/70" />;
  return null;
};

const LeaderboardRankings: React.FC<LeaderboardRankingsProps> = ({
  leaderboardRankings,
}) => {
  const rankedEntries = leaderboardRankings.filter(
    (r) => typeof r.rank === "number"
  );

  if (rankedEntries.length === 0) {
    return null;
  }

  const bestRank = Math.min(
    ...rankedEntries.map((r) => r.rank as number)
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3 }}
      className="relative border-b border-primary/30 py-10"
    >
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-xl font-mono uppercase tracking-[0.15em]">
            Leaderboard Rankings
          </h3>
        </div>
        {bestRank <= 10 && (
          <div className="flex items-center gap-2 text-xs">
            <Crown className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">
              Best: <span className="font-semibold text-primary">#{bestRank}</span>
            </span>
          </div>
        )}
      </div>

      <div className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {leaderboardRankings.map((ranking, index) => {
          const isRanked = typeof ranking.rank === "number";
          const percentile = isRanked
            ? Math.round((ranking.rank as number / ranking.totalUsers) * 100)
            : null;
          const isTopRank = isRanked && (ranking.rank as number) <= 3;
          const rankIcon = isRanked ? getRankIcon(ranking.rank as number) : null;

          return (
            <motion.div
              key={ranking.duration}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
              className={`rounded-xl border p-5 ${
                isTopRank
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/60 bg-muted/20"
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {formatDuration(ranking.duration)}
                </span>
                {percentile != null && percentile <= 10 && (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Top {percentile}%
                  </span>
                )}
              </div>

              {isRanked ? (
                <div className="flex items-center gap-3">
                  {rankIcon && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border/60">
                      {rankIcon}
                    </div>
                  )}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold tabular-nums ${
                        isTopRank ? "text-primary" : ""
                      }`}>
                        #{ranking.rank}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of {ranking.totalUsers.toLocaleString()} players
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not ranked</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};

export default LeaderboardRankings;
