import { useQuery } from "@tanstack/react-query";
import { LeaderboardTimeframe, LeaderboardEntry } from "@/app/leaderboard/actions";

interface LeaderboardData {
  duration: number;
  data: LeaderboardEntry[];
}

async function fetchLeaderboard(timeframe: LeaderboardTimeframe): Promise<LeaderboardData[]> {
  const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
  if (!response.ok) {
    throw new Error(`Error fetching leaderboard: ${response.statusText}`);
  }
  return response.json();
}

export function useLeaderboard(timeframe: LeaderboardTimeframe) {
  return useQuery({
    queryKey: ["leaderboard", timeframe],
    queryFn: () => fetchLeaderboard(timeframe),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false
  });
}
