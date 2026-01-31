"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { motion } from "motion/react";

interface ProfileOverviewProps {
  username: string;
  joinDate: string;
  testsCompleted: number;
  leaderboardRankings: Array<{
    duration: number;
    rank: number | string;
    totalUsers: number;
  }>;
  isOwnProfile?: boolean;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  username,
  joinDate,
  testsCompleted,
  leaderboardRankings,
  isOwnProfile = false,
}) => {
  const bestRanking = leaderboardRankings.reduce(
    (best, current) => {
      if (typeof current.rank !== "number") return best;
      if (!best || (typeof best.rank === "number" && current.rank < best.rank)) {
        return current;
      }
      return best;
    },
    null as (typeof leaderboardRankings)[number] | null
  );

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-muted/40 to-muted/20 p-8 border border-border/30"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <span className="text-3xl font-bold text-primary-foreground">
              {username.charAt(0).toUpperCase()}
            </span>
          </motion.div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-3xl font-bold tracking-tight"
              >
                {username}
              </motion.h1>
              {isOwnProfile && (
                <motion.span
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.35 }}
                  className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-semibold px-2 py-1"
                >
                  This is you
                </motion.span>
              )}
            </div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="text-muted-foreground flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Joined {joinDate}
            </motion.p>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex gap-6"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{testsCompleted}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Tests</p>
            </div>
            {bestRanking && typeof bestRanking.rank === "number" && (
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">#{bestRanking.rank}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Best Rank</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

    </div>
  );
};

export default ProfileOverview;
