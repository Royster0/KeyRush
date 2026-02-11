"use client";

import { useState, useMemo, useEffect } from "react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useRankedLeaderboard } from "@/hooks/useRankedLeaderboard";
import { LeaderboardTimeframe } from "@/app/leaderboard/actions";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import RankedLeaderboardTable from "@/components/leaderboard/RankedLeaderboardTable";
import { TIME_OPTIONS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, Clock, CalendarDays, Infinity as InfinityIcon } from "lucide-react";
import { RankIcon } from "@/components/RankIcon";
import { createClient } from "@/utils/supabase/client";

type MainTab = "rankings" | "wpm";

const timeframeOptions = [
  { id: "daily" as const, label: "Today", icon: Clock },
  { id: "weekly" as const, label: "This Week", icon: CalendarDays },
  { id: "all" as const, label: "All-Time", icon: InfinityIcon },
];

export default function LeaderboardClient() {
  const [mainTab, setMainTab] = useState<MainTab>("rankings");
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>("all");
  const [selectedDuration, setSelectedDuration] = useState<(typeof TIME_OPTIONS)[number]>(TIME_OPTIONS[2]);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-12 space-y-0">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 pb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Leaderboards
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            See how you stack up against the competition
          </p>
        </motion.header>

        {/* Main Tab Switcher */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="relative border-b border-primary/30 pb-10"
        >
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center rounded-full border border-border/60 bg-background/70 p-1">
              {[
                { id: "rankings" as MainTab, label: "Rankings", icon: Trophy },
                { id: "wpm" as MainTab, label: "WPM Records", icon: Zap },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = mainTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setMainTab(tab.id)}
                    className={`px-5 py-2 text-[11px] font-mono uppercase tracking-[0.2em] rounded-full transition-colors flex items-center gap-2 ${
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
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
                    className="relative overflow-hidden rounded-2xl border border-border/40 bg-muted/20 p-6"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                    {userRankInfo ? (
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <RankIcon
                              rank={userRankInfo.player.rank_tier}
                              size={28}
                              title={userRankInfo.player.rank_tier}
                            />
                          </div>
                          <div>
                            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Your Position</p>
                            <p className="text-2xl font-bold">
                              #{userRankInfo.position}
                              <span className="text-base font-normal text-muted-foreground ml-2">
                                of {rankedData.length}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Elo Rating</p>
                          <p className="text-2xl font-mono font-bold">{Math.round(userRankInfo.player.elo)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                          <Trophy className="h-5 w-5 text-muted-foreground" />
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
                  {/* Duration Selection */}
                  <div className="inline-flex items-center rounded-full border border-border/60 bg-background/70 p-1">
                    {TIME_OPTIONS.map((duration) => {
                      const isActive = selectedDuration === duration;
                      const label = duration >= 60 ? `${Math.floor(duration / 60)}m` : `${duration}s`;
                      return (
                        <button
                          key={duration}
                          onClick={() => setSelectedDuration(duration)}
                          className={`px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] rounded-full transition-colors ${
                            isActive
                              ? "bg-primary/20 text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Timeframe Toggle */}
                  <div className="inline-flex items-center rounded-full border border-border/60 bg-background/70 p-1">
                    {timeframeOptions.map((option) => {
                      const Icon = option.icon;
                      const isActive = timeframe === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setTimeframe(option.id)}
                          className={`px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] rounded-full transition-colors flex items-center gap-1.5 ${
                            isActive
                              ? "bg-primary/20 text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span className="hidden sm:inline">{option.label}</span>
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
        </motion.section>
      </div>
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
