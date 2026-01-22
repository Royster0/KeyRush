"use client";

import { useState } from "react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
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
import { TIME_OPTIONS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function LeaderboardClient() {
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>("all");
  const [selectedTab, setSelectedTab] = useState(TIME_OPTIONS[2].toString());

  const { data: leaderboardData = [], isLoading } = useLeaderboard(timeframe);

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leaderboards</h1>

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
      </div>

      <Tabs
        defaultValue={TIME_OPTIONS[2].toString()}
        className="w-full"
        onValueChange={setSelectedTab}
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
          {isLoading ? (
            <motion.div
              key="loading"
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
    </div>
  );
}
