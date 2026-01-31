import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { TIME_OPTIONS } from "@/lib/constants";
import {
  UserRankingRowSchema,
  LeaderboardEntrySchema,
  RankedPlayerRowSchema,
  MultiplayerResultRowSchema,
} from "@/lib/schemas/leaderboard";

export interface LeaderboardRanking {
  duration: number;
  rank: number | "N/A";
  totalUsers: number;
}

export type LeaderboardTimeframe = "daily" | "weekly" | "all";

export type LeaderboardEntry = {
  username: string;
  wpm: number;
  accuracy: number;
  user_id: string;
  test_id: string;
  created_at: string;
  source?: "singleplayer" | "multiplayer";
};

export async function getUserLeaderboardRankings(): Promise<LeaderboardRanking[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase.rpc('get_user_rankings', {
    target_user_id: user.id
  });

  if (error || !data) {
    return [];
  }

  const parsed = z.array(UserRankingRowSchema).safeParse(data);
  if (!parsed.success) {
    return [];
  }

  return parsed.data.map((row) => ({
    duration: row.duration,
    rank: row.rank ? Number(row.rank) : "N/A",
    totalUsers: Number(row.total_users),
  }));
}

export async function getLeaderboardRankingsByUserId(
  userId: string
): Promise<LeaderboardRanking[]> {
  const supabase = await createClient();

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase.rpc("get_user_rankings", {
    target_user_id: userId,
  });

  if (error || !data) {
    return [];
  }

  const parsed = z.array(UserRankingRowSchema).safeParse(data);
  if (!parsed.success) {
    return [];
  }

  return parsed.data.map((row) => ({
    duration: row.duration,
    rank: row.rank ? Number(row.rank) : "N/A",
    totalUsers: Number(row.total_users),
  }));
}

export async function getLeaderboardData(
  duration: number,
  timeframe: LeaderboardTimeframe
): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();

  let minDate: string | null = null;
  const now = new Date();

  if (timeframe === "daily") {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    minDate = yesterday.toISOString();
  } else if (timeframe === "weekly") {
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    minDate = lastWeek.toISOString();
  }

  // Fetch singleplayer scores from existing RPC
  const { data: singleplayerData, error: singleplayerError } = await supabase.rpc('get_leaderboard', {
    duration_val: duration,
    min_date: minDate
  });

  let singleplayerEntries: LeaderboardEntry[] = [];
  if (!singleplayerError && singleplayerData) {
    const parsed = z.array(LeaderboardEntrySchema).safeParse(singleplayerData);
    if (parsed.success) {
      singleplayerEntries = parsed.data.map((entry) => ({
        ...entry,
        source: "singleplayer" as const,
      }));
    }
  }

  // Fetch multiplayer scores (only for 30s and 60s durations)
  let multiplayerEntries: LeaderboardEntry[] = [];
  if (duration === 30 || duration === 60) {
    let multiplayerQuery = supabase
      .from("match_results")
      .select(`
        user_id,
        wpm,
        accuracy,
        match_id,
        matches!inner (
          id,
          duration,
          ended_at
        ),
        profiles!inner (
          username
        )
      `)
      .eq("matches.duration", duration)
      .eq("left_match", false)
      .order("wpm", { ascending: false })
      .limit(100);

    if (minDate) {
      multiplayerQuery = multiplayerQuery.gte("matches.ended_at", minDate);
    }

    const { data: multiplayerData, error: multiplayerError } = await multiplayerQuery;

    if (!multiplayerError && multiplayerData) {
      const parsed = z.array(MultiplayerResultRowSchema).safeParse(multiplayerData);
      if (parsed.success) {
        multiplayerEntries = parsed.data.map((row) => ({
          username: row.profiles.username || "Anonymous",
          wpm: row.wpm,
          accuracy: row.accuracy,
          user_id: row.user_id,
          test_id: `match-${row.match_id}`,
          created_at: row.matches.ended_at || new Date().toISOString(),
          source: "multiplayer" as const,
        }));
      }
    }
  }

  // Combine and deduplicate (keep best score per user)
  const allEntries = [...singleplayerEntries, ...multiplayerEntries];
  const bestByUser = new Map<string, LeaderboardEntry>();

  for (const entry of allEntries) {
    const existing = bestByUser.get(entry.user_id);
    if (!existing || entry.wpm > existing.wpm) {
      bestByUser.set(entry.user_id, entry);
    }
  }

  // Sort by WPM descending and return top 100
  return Array.from(bestByUser.values())
    .sort((a, b) => b.wpm - a.wpm)
    .slice(0, 100);
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

// Ranked Leaderboard Types and Functions
export type RankedPlayer = {
  user_id: string;
  username: string;
  elo: number;
  rank_tier: string;
  matches_played: number;
  wins: number;
  losses: number;
};

export async function getRankedLeaderboard(): Promise<RankedPlayer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, elo, rank_tier, matches_played, wins, losses")
    .gte("matches_played", 5)
    .not("elo", "is", null)
    .order("elo", { ascending: false })
    .limit(100);

  if (error || !data) {
    return [];
  }

  const parsed = z.array(RankedPlayerRowSchema).safeParse(data);
  if (!parsed.success) {
    return [];
  }

  return parsed.data.map((profile) => ({
    user_id: profile.id,
    username: profile.username || "Anonymous",
    elo: profile.elo || 1000,
    rank_tier: profile.rank_tier || "Bronze",
    matches_played: profile.matches_played || 0,
    wins: profile.wins || 0,
    losses: profile.losses || 0,
  }));
}
