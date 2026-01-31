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
      if (
        !best ||
        (typeof best.rank === "number" && current.rank < best.rank)
      ) {
        return current;
      }
      return best;
    },
    null as (typeof leaderboardRankings)[number] | null,
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.08, duration: 0.5 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative py-10"
    >
      <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <motion.h1
                variants={itemVariants}
                className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
              >
                {username}
              </motion.h1>
              {isOwnProfile && (
                <motion.span
                  variants={itemVariants}
                  className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                >
                  This is you
                </motion.span>
              )}
            </div>
            <motion.p
              variants={itemVariants}
              className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2">
                <Calendar className="h-4 w-4" />
                Joined {joinDate}
              </span>
            </motion.p>
          </div>
        </div>

        <motion.div variants={itemVariants} className="grid gap-4 lg:pl-8">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[12px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
              Tests
            </p>
            <p className="text-3xl font-semibold">{testsCompleted}</p>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[12px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
              Best Rank
            </p>
            <p className="text-3xl font-semibold">
              {bestRanking && typeof bestRanking.rank === "number"
                ? `#${bestRanking.rank}`
                : "-"}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ProfileOverview;
