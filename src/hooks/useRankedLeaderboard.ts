import { useQuery } from "@tanstack/react-query";
import { RankedPlayer } from "@/lib/services/leaderboard";

async function fetchRankedLeaderboard(): Promise<RankedPlayer[]> {
  const response = await fetch("/api/leaderboard/ranked");
  if (!response.ok) {
    throw new Error(`Error fetching ranked leaderboard: ${response.statusText}`);
  }
  return response.json();
}

export function useRankedLeaderboard() {
  return useQuery({
    queryKey: ["ranked-leaderboard"],
    queryFn: fetchRankedLeaderboard,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
