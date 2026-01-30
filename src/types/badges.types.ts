/**
 * Badge system types and definitions
 *
 * Badges are earned through specific triggers (events) and are displayed
 * in the user's profile. Earned badges appear in color, unearned in grayscale.
 */

/** Badge trigger types - extensible for future badges */
export type BadgeTrigger =
  | "first_test" // Complete first typing test
  | "first_multiplayer" // Play first multiplayer match
  | "placement_complete" // Finish 5 placement matches
  | "level_5" // Reach level 5
  | "level_10" // Reach level 10
  | "level_20" // Reach level 20
  | "level_50" // Reach level 50
  | "wpm_100" // Achieve 100+ WPM
  | "wpm_150" // Achieve 150+ WPM
  | "perfect_accuracy" // 100% accuracy in a test (min 15s)
  | "first_friend" // Add first friend
  | "first_win" // Win first ranked match
  | "win_streak_5" // Win 5 ranked matches in a row
  | "tests_100" // Complete 100 tests
  | "leaderboard_top_10" // Reach top 10 on any leaderboard
  | "leaderboard_first"; // Reach #1 on any leaderboard

/** Badge rarity levels */
export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

/** Badge category for organization */
export type BadgeCategory =
  | "milestone"
  | "achievement"
  | "speed"
  | "social"
  | "competitive";

/** Badge definition - static configuration */
export interface BadgeDefinition {
  id: BadgeTrigger;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  rarity: BadgeRarity;
  category: BadgeCategory;
  /** XP reward for earning this badge */
  xpReward: number;
  /** Optional: specific value required (e.g., level 5, wpm 100) */
  requiredValue?: number;
}

/** User's earned badge record */
export interface UserBadge {
  id: string;
  userId: string;
  badgeId: BadgeTrigger;
  earnedAt: string; // ISO timestamp
}

/** Badge with earned status for display */
export interface BadgeWithStatus extends BadgeDefinition {
  earned: boolean;
  earnedAt?: string;
}

/** Badge notification data */
export interface BadgeNotification {
  badge: BadgeDefinition;
  earnedAt: string;
  xpAwarded: number;
}

/** Context for checking badge eligibility */
export interface BadgeContext {
  userId: string;
  // Test context
  wpm?: number;
  accuracy?: number;
  duration?: number;
  // Level context
  newLevel?: number;
  previousLevel?: number;
  // Multiplayer context
  isMultiplayer?: boolean;
  isWin?: boolean;
  matchesPlayed?: number;
  // Social context
  friendCount?: number;
  // Stats context
  totalTests?: number;
  currentWinStreak?: number;
  leaderboardRank?: number;
}
