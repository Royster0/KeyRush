"use server";

import * as leaderboardServices from "@/lib/services/leaderboard";

export type LeaderboardTimeframe = leaderboardServices.LeaderboardTimeframe;
export type LeaderboardEntry = leaderboardServices.LeaderboardEntry;

export async function getLeaderboardData(
  duration: number,
  timeframe: LeaderboardTimeframe
) {
  return leaderboardServices.getLeaderboardData(duration, timeframe);
}

export async function getAllLeaderboardDurations(
  timeframe: LeaderboardTimeframe
) {
  return leaderboardServices.getAllLeaderboardDurations(timeframe);
}
