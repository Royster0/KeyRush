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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-2xl bg-muted/30 border border-border/30 p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Leaderboard Rankings</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {leaderboardRankings.map((ranking, index) => (
          <motion.div
            key={ranking.duration}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
            className="group relative rounded-xl bg-background/60 border border-border/50 p-4 hover:border-primary/30 transition-colors"
          >
            <p className="text-sm font-bold text-primary mb-2">
              {formatDuration(ranking.duration)}
            </p>
            {typeof ranking.rank === "number" ? (
              <>
                <p className="text-2xl font-bold">#{ranking.rank}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  of {ranking.totalUsers}
                </p>
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary">
                    {Math.round((ranking.rank / ranking.totalUsers) * 100)}%
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xl text-muted-foreground">—</p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default LeaderboardRankings;
