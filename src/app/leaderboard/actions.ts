"use server";

import { createClient } from "@/utils/supabase/server";
import { TIME_OPTIONS } from "@/lib/constants";

export type LeaderboardTimeframe = "daily" | "weekly" | "all";
export type LeaderboardEntry = {
  username: string;
  wpm: number;
  accuracy: number;
  user_id: string;
  test_id: string;
  created_at: string;
};

export async function getLeaderboardData(
  duration: number,
  timeframe: LeaderboardTimeframe
): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();

  // get all the test results for the given duration
  let query = supabase
    .from("test_results")
    .select(
      `
      id,
      user_id,
      wpm,
      accuracy,
      created_at
    `
    )
    .eq("duration", duration)
    .order("wpm", { ascending: false })
    .limit(50);

  const now = new Date();

  if (timeframe === "daily") {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    query = query.gte("created_at", yesterday.toISOString());
  } else if (timeframe === "weekly") {
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    query = query.gte("created_at", lastWeek.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching leaderboard data:", error);
    return [];
  }

  if (!data.length) {
    return [];
  }

  // Get usernames for all user_ids in a separate query
  const userIds = [...new Set(data.map((entry) => entry.user_id))];
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", userIds);

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
  }

  // Create a map of user_id to username
  const usernameMap = new Map();
  if (profilesData) {
    profilesData.forEach((profile) => {
      usernameMap.set(profile.id, profile.username);
    });
  }

  // Process data to include username from the joined profiles table
  const processedData = data.map((entry) => ({
    username: usernameMap.get(entry.user_id) || "Anonymous",
    wpm: entry.wpm,
    accuracy: entry.accuracy,
    user_id: entry.user_id,
    test_id: entry.id,
    created_at: entry.created_at,
  }));

  // Filter unique users (keep only best score per user)
  const uniqueUsers = new Map<string, LeaderboardEntry>();

  processedData.forEach((entry) => {
    if (
      !uniqueUsers.has(entry.user_id) ||
      uniqueUsers.get(entry.user_id)!.wpm < entry.wpm
    ) {
      uniqueUsers.set(entry.user_id, entry);
    }
  });

  return Array.from(uniqueUsers.values());
}

export async function getAllLeaderboardDurations(
  timeframe: LeaderboardTimeframe
) {
  const leaderboards = await Promise.all(
    TIME_OPTIONS.map(async (duration) => {
      const data = await getLeaderboardData(duration, timeframe);
      return { duration, data };
    })
  );

  return leaderboards;
}
