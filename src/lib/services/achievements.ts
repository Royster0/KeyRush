import { getUserBestScores } from "./test-results";
import { getUserLeaderboardRankings, LeaderboardRanking } from "./leaderboard";
import { TestResults } from "@/types/game.types";

export interface AchievementData {
  type: "personal_best" | "leaderboard";
  oldWpm: number;
  newWpm: number;
  improvement: number;
  duration: number;
  leaderboardRank?: number;
  previousRank?: number;
  totalUsers?: number;
}

export interface PreSaveState {
  bestScores: TestResults[];
  rankings: LeaderboardRanking[];
}

/**
 * Fetch the user's current best scores and rankings BEFORE saving a new result.
 * This must be called before saveTestResult() to get accurate "before" state.
 */
export async function getPreSaveState(): Promise<PreSaveState> {
  const [bestScores, rankings] = await Promise.all([
    getUserBestScores(),
    getUserLeaderboardRankings(),
  ]);
  return { bestScores, rankings };
}

/**
 * Check for achievements by comparing pre-save state with the new result.
 * For leaderboard, fetches current rankings to compare with pre-save state.
 */
export async function checkAchievements(
  wpm: number,
  duration: number,
  preSaveState: PreSaveState
): Promise<AchievementData[]> {
  try {
    const { bestScores: preSaveBestScores, rankings: preSaveRankings } = preSaveState;

    // Get the previous best for this duration (before saving)
    const previousBest = preSaveBestScores.find((s) => s.duration === duration);
    const previousBestWpm = previousBest?.wpm ?? 0;

    // Check if this is a personal best
    const isPersonalBest = wpm > previousBestWpm;

    // Get current rankings (after save) to check leaderboard position
    const currentRankings = await getUserLeaderboardRankings();
    const currentRanking = currentRankings.find((r) => r.duration === duration);
    const currentRank = typeof currentRanking?.rank === "number" ? currentRanking.rank : null;
    const isCurrentlyTop100 = currentRank !== null && currentRank <= 100;

    // Get previous ranking for this duration
    const previousRanking = preSaveRankings.find((r) => r.duration === duration);
    const previousRank = typeof previousRanking?.rank === "number" ? previousRanking.rank : null;
    const wasPreviouslyTop100 = previousRank !== null && previousRank <= 100;

    // Determine if leaderboard achievement should trigger:
    // - First time entering top 100, OR
    // - Rank improved (moved up)
    const isNewLeaderboardEntry = isCurrentlyTop100 && !wasPreviouslyTop100;
    const isRankImproved = isCurrentlyTop100 && wasPreviouslyTop100 && currentRank < previousRank!;
    const showLeaderboardAchievement = isNewLeaderboardEntry || isRankImproved;

    const achievements: AchievementData[] = [];

    // Add personal best achievement first
    if (isPersonalBest) {
      achievements.push({
        type: "personal_best",
        oldWpm: previousBestWpm,
        newWpm: wpm,
        improvement: wpm - previousBestWpm,
        duration,
      });
    }

    // Add leaderboard achievement second (only if new entry or rank improved)
    if (showLeaderboardAchievement && currentRank !== null) {
      achievements.push({
        type: "leaderboard",
        oldWpm: previousBestWpm,
        newWpm: wpm,
        improvement: wpm - previousBestWpm,
        duration,
        leaderboardRank: currentRank,
        previousRank: wasPreviouslyTop100 ? previousRank! : undefined,
        totalUsers: currentRanking?.totalUsers,
      });
    }

    return achievements;
  } catch {
    return [];
  }
}
