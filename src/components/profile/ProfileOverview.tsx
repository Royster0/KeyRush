"use client";

import React from "react";
import { User, Calendar, Zap, Trophy, TrendingUp } from "lucide-react";
import { formatDuration } from "@/lib/utils";
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
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/60 to-muted/30 p-5 border border-border/30"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  </motion.div>
);

const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  username,
  joinDate,
  testsCompleted,
  leaderboardRankings,
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
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-3xl font-bold tracking-tight mb-1"
            >
              {username}
            </motion.h1>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={User} label="Username" value={username} delay={0.1} />
        <StatCard icon={Calendar} label="Member Since" value={joinDate} delay={0.15} />
        <StatCard icon={Zap} label="Tests Completed" value={testsCompleted} delay={0.2} />
        <StatCard
          icon={TrendingUp}
          label="Leaderboards"
          value={leaderboardRankings.filter((r) => typeof r.rank === "number").length}
          delay={0.25}
        />
      </div>

      {/* Leaderboard Rankings */}
      {leaderboardRankings.length > 0 && (
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
      )}
    </div>
  );
};

export default ProfileOverview;
