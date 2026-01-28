"use client";

import { useState, useMemo } from "react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useRankedLeaderboard } from "@/hooks/useRankedLeaderboard";
import { LeaderboardTimeframe } from "@/app/leaderboard/actions";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import RankedLeaderboardTable from "@/components/leaderboard/RankedLeaderboardTable";
import { TIME_OPTIONS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, Crown, Clock, CalendarDays, Infinity as InfinityIcon } from "lucide-react";
import { getRankColor } from "@/components/multiplayer/multiplayer-utils";

interface LeaderboardClientProps {
  userId?: string;
}

type MainTab = "rankings" | "wpm";

const timeframeOptions = [
  { id: "daily" as const, label: "Today", icon: Clock },
  { id: "weekly" as const, label: "This Week", icon: CalendarDays },
  { id: "all" as const, label: "All-Time", icon: InfinityIcon },
];

export default function LeaderboardClient({ userId }: LeaderboardClientProps) {
  const [mainTab, setMainTab] = useState<MainTab>("rankings");
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>("all");
  const [selectedDuration, setSelectedDuration] = useState<(typeof TIME_OPTIONS)[number]>(TIME_OPTIONS[2]);

  const { data: leaderboardData = [], isLoading: isLoadingWpm } = useLeaderboard(timeframe);
  const { data: rankedData = [], isLoading: isLoadingRanked } = useRankedLeaderboard();

  const userRankInfo = useMemo(() => {
    if (!userId || rankedData.length === 0) return null;
    const index = rankedData.findIndex((player) => player.user_id === userId);
    if (index === -1) return null;
    return {
      position: index + 1,
      player: rankedData[index],
    };
  }, [userId, rankedData]);

  const mainTabs = [
    { id: "rankings" as const, label: "Rankings", icon: Trophy },
    { id: "wpm" as const, label: "WPM Records", icon: Zap },
  ];

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboards</h1>
        <p className="text-muted-foreground">See how you stack up against the competition</p>
      </div>

      {/* Main Tab Switcher */}
      <div className="relative">
        <div className="flex gap-2 p-1 rounded-xl bg-muted/50 w-fit">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = mainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
                className="relative px-6 py-3 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMainTab"
                    className="absolute inset-0 bg-background rounded-lg shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-2 ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {mainTab === "rankings" ? (
          <motion.div
            key="rankings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* User rank card */}
            {!isLoadingRanked && userId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-card to-card/50 p-6"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                {userRankInfo ? (
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Crown className={`h-6 w-6 ${getRankColor(userRankInfo.player.rank_tier)}`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Your Position</p>
                        <p className="text-2xl font-bold">
                          #{userRankInfo.position}
                          <span className="text-base font-normal text-muted-foreground ml-2">
                            of {rankedData.length}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Elo Rating</p>
                      <p className="text-2xl font-mono font-bold">{Math.round(userRankInfo.player.elo)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-muted">
                      <Trophy className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Start your ranked journey</p>
                      <p className="text-sm text-muted-foreground">
                        Complete 5 placement matches to appear on the leaderboard
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Rankings table */}
            {isLoadingRanked ? (
              <LoadingState message="Loading rankings..." />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <RankedLeaderboardTable data={rankedData} currentUserId={userId} />
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="wpm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Duration Selection - Card Style */}
              <div className="flex gap-2">
                {TIME_OPTIONS.map((duration) => {
                  const isActive = selectedDuration === duration;
                  return (
                    <motion.button
                      key={duration}
                      onClick={() => setSelectedDuration(duration)}
                      className={`
                        relative flex flex-col items-center justify-center
                        w-16 h-16 rounded-xl border transition-all
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                        ${isActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className={`text-lg font-bold tabular-nums ${isActive ? "text-primary" : "text-foreground"}`}>
                        {duration >= 60 ? Math.floor(duration / 60) : duration}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                        {duration >= 60 ? "min" : "sec"}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Timeframe Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border/50">
                {timeframeOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = timeframe === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setTimeframe(option.id)}
                      className={`
                        relative px-3 py-2 rounded-md text-sm font-medium transition-all
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                        ${isActive ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}
                      `}
                    >
                      <span className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{option.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* WPM table */}
            {isLoadingWpm ? (
              <LoadingState message="Loading leaderboard..." />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedDuration}-${timeframe}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <LeaderboardTable
                    data={leaderboardData.find((item) => item.duration === selectedDuration)?.data || []}
                    duration={selectedDuration}
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-16 text-center"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
        <motion.div
          className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </motion.div>
  );
}
