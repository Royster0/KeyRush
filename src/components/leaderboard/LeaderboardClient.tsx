"use client";

import React, { useState, useEffect } from "react";
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

export default function LeaderboardClient() {
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>("all");
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
        if (!response.ok) {
          throw new Error(`Error fetching leaderboard: ${response.statusText}`);
        }
        const data = await response.json();
        setLeaderboardData(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
        setLeaderboardData([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [timeframe]);

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

      <Tabs defaultValue={TIME_OPTIONS[2].toString()} className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-lg mx-auto mb-6">
          {TIME_OPTIONS.map((duration) => (
            <TabsTrigger key={duration} value={duration.toString()}>
              {formatDuration(duration)}
            </TabsTrigger>
          ))}
        </TabsList>

        {isLoading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-muted-foreground">
              Loading leaderboard data...
            </p>
          </div>
        ) : (
          TIME_OPTIONS.map((duration) => {
            const durationData = leaderboardData.find(
              (item) => item.duration === duration
            );
            return (
              <TabsContent key={duration} value={duration.toString()}>
                <LeaderboardTable
                  data={durationData?.data || []}
                  duration={duration}
                />
              </TabsContent>
            );
          })
        )}
      </Tabs>
    </div>
  );
}
