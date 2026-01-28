"use client";

import { useState, useMemo } from "react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useRankedLeaderboard } from "@/hooks/useRankedLeaderboard";
import { LeaderboardTimeframe } from "@/app/leaderboard/actions";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDuration } from "@/lib/utils";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import RankedLeaderboardTable from "@/components/leaderboard/RankedLeaderboardTable";
import { TIME_OPTIONS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { getRankColor } from "@/components/multiplayer/multiplayer-utils";

interface LeaderboardClientProps {
  userId?: string;
}

export default function LeaderboardClient({ userId }: LeaderboardClientProps) {
  const [mainTab, setMainTab] = useState("rankings");
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>("all");
  const [selectedDuration, setSelectedDuration] = useState(TIME_OPTIONS[2].toString());

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
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leaderboards</h1>

        {mainTab === "wpm" && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Time period:</span>
              <Select
                value={timeframe}
                onValueChange={(value) =>
                  setTimeframe(value as LeaderboardTimeframe)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="all">All-Time</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="rankings" value={mainTab} onValueChange={setMainTab} className="w-full">
        <div className="w-full max-w-md mx-auto mb-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="rankings" className="transition-all duration-200">
              Rankings
            </TabsTrigger>
            <TabsTrigger value="wpm" className="transition-all duration-200">
              WPM Leaderboard
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="rankings">
          {/* User rank summary */}
          {!isLoadingRanked && userId && (
            <div className="mb-4 p-4 rounded-lg border bg-muted/30">
              {userRankInfo ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className={`h-5 w-5 ${getRankColor(userRankInfo.player.rank_tier)}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Your Ranking</p>
                      <p className="font-semibold">
                        #{userRankInfo.position} of {rankedData.length}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="font-mono font-semibold">{Math.round(userRankInfo.player.elo)}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Play 5 ranked matches to appear on the leaderboard
                  </p>
                </div>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {isLoadingRanked ? (
              <motion.div
                key="loading-ranked"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="py-12 text-center"
              >
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-muted-foreground">
                  Loading rankings...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="ranked-table"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <RankedLeaderboardTable data={rankedData} currentUserId={userId} />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="wpm">
          <Tabs
            defaultValue={TIME_OPTIONS[2].toString()}
            value={selectedDuration}
            onValueChange={setSelectedDuration}
            className="w-full"
          >
            <div className="w-full max-w-lg mx-auto mb-6">
              <TabsList className="grid grid-cols-5 w-full max-w-lg mx-auto">
                {TIME_OPTIONS.map((duration) => (
                  <TabsTrigger
                    key={duration}
                    value={duration.toString()}
                    className="transition-all duration-200"
                  >
                    {formatDuration(duration)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              {isLoadingWpm ? (
                <motion.div
                  key="loading-wpm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="py-12 text-center"
                >
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-4 text-muted-foreground">
                    Loading leaderboard data...
                  </p>
                </motion.div>
              ) : (
                TIME_OPTIONS.map((duration) => {
                  const durationData = leaderboardData.find(
                    (item) => item.duration === duration
                  );
                  return (
                    <TabsContent key={duration} value={duration.toString()} asChild>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      >
                        <LeaderboardTable
                          data={durationData?.data || []}
                          duration={duration}
                        />
                      </motion.div>
                    </TabsContent>
                  );
                })
              )}
            </AnimatePresence>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
