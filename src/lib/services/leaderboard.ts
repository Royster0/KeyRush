import { createClient } from "@/utils/supabase/server";
import { TIME_OPTIONS } from "@/lib/constants";

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

  if (error) {
    console.error("Error fetching rankings:", error);
    return [];
  }

  return (data as any[]).map((row) => ({
    duration: row.duration,
    rank: row.rank ? Number(row.rank) : "N/A",
    totalUsers: Number(row.total_users)
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

  const { data, error } = await supabase.rpc('get_leaderboard', {
    duration_val: duration,
    min_date: minDate
  });

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }

  return data as LeaderboardEntry[];
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
