"use client";

import React from "react";
import { Trophy } from "lucide-react";
import { motion } from "motion/react";
import { formatDuration } from "@/lib/utils";

interface LeaderboardRankingsProps {
  leaderboardRankings: Array<{
    duration: number;
    rank: number | string;
    totalUsers: number;
  }>;
}

const LeaderboardRankings: React.FC<LeaderboardRankingsProps> = ({
  leaderboardRankings,
}) => {
  if (leaderboardRankings.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3 }}
      className="relative border-b border-primary/40 py-10"
    >
      <div className="relative z-10 flex items-center gap-3">
        <Trophy className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-2xl font-mono uppercase tracking-[0.2em]">
            Leaderboard Rankings
          </h3>
        </div>
      </div>

      <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {leaderboardRankings.map((ranking, index) => {
          const percentile =
            typeof ranking.rank === "number"
              ? Math.round((ranking.rank / ranking.totalUsers) * 100)
              : null;
          return (
            <motion.div
              key={ranking.duration}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
              className="rounded-lg border border-r-4 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                  {formatDuration(ranking.duration)}
                </span>
                {percentile != null && (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                    Top {percentile}%
                  </span>
                )}
              </div>
              {typeof ranking.rank === "number" ? (
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold">
                    #{ranking.rank}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    of {ranking.totalUsers}
                  </span>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">-</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};

export default LeaderboardRankings;
