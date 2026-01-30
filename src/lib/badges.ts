/**
 * Badge definitions and utilities
 *
 * This file contains all badge configurations. To add a new badge:
 * 1. Add the trigger type to BadgeTrigger in types/badges.types.ts
 * 2. Add the badge definition to BADGE_DEFINITIONS below
 * 3. Add the trigger check in services/badges.ts checkBadgeTriggers()
 */

import {
  BadgeDefinition,
  BadgeTrigger,
  BadgeCategory,
  BadgeRarity,
} from "@/types/badges.types";

/** XP rewards by rarity */
export const RARITY_XP_REWARDS: Record<BadgeRarity, number> = {
  common: 25,
  uncommon: 50,
  rare: 100,
  epic: 200,
  legendary: 500,
};

/** All badge definitions */
export const BADGE_DEFINITIONS: Record<BadgeTrigger, BadgeDefinition> = {
  // Milestone badges
  first_test: {
    id: "first_test",
    name: "First Steps",
    description: "Complete your first typing test",
    icon: "Keyboard",
    rarity: "common",
    category: "milestone",
    xpReward: 25,
  },
  first_multiplayer: {
    id: "first_multiplayer",
    name: "Challenger",
    description: "Play your first multiplayer match",
    icon: "Swords",
    rarity: "common",
    category: "milestone",
    xpReward: 25,
  },
  placement_complete: {
    id: "placement_complete",
    name: "Ranked Ready",
    description: "Complete 5 placement matches",
    icon: "Medal",
    rarity: "uncommon",
    category: "milestone",
    xpReward: 50,
    requiredValue: 5,
  },
  tests_100: {
    id: "tests_100",
    name: "Centurion",
    description: "Complete 100 typing tests",
    icon: "ScrollText",
    rarity: "rare",
    category: "milestone",
    xpReward: 150, // Extra XP for dedication
    requiredValue: 100,
  },

  // Level badges
  level_5: {
    id: "level_5",
    name: "Rising Star",
    description: "Reach level 5",
    icon: "Star",
    rarity: "common",
    category: "achievement",
    xpReward: 25,
    requiredValue: 5,
  },
  level_10: {
    id: "level_10",
    name: "Dedicated",
    description: "Reach level 10",
    icon: "Sparkles",
    rarity: "uncommon",
    category: "achievement",
    xpReward: 50,
    requiredValue: 10,
  },
  level_20: {
    id: "level_20",
    name: "Veteran",
    description: "Reach level 20",
    icon: "Flame",
    rarity: "rare",
    category: "achievement",
    xpReward: 100,
    requiredValue: 20,
  },
  level_50: {
    id: "level_50",
    name: "Legend",
    description: "Reach level 50",
    icon: "Crown",
    rarity: "epic",
    category: "achievement",
    xpReward: 250, // Extra XP for reaching level 50
    requiredValue: 50,
  },

  // Speed badges
  wpm_100: {
    id: "wpm_100",
    name: "Speed Demon",
    description: "Achieve 100+ WPM in any test",
    icon: "Zap",
    rarity: "uncommon",
    category: "speed",
    xpReward: 75, // Skill-based bonus
    requiredValue: 100,
  },
  wpm_150: {
    id: "wpm_150",
    name: "Lightning Fingers",
    description: "Achieve 150+ WPM in any test",
    icon: "Bolt",
    rarity: "epic",
    category: "speed",
    xpReward: 300, // High skill reward
    requiredValue: 150,
  },
  perfect_accuracy: {
    id: "perfect_accuracy",
    name: "Perfectionist",
    description: "Achieve 100% accuracy (min 15s test)",
    icon: "Target",
    rarity: "rare",
    category: "speed",
    xpReward: 100,
  },

  // Social badges
  first_friend: {
    id: "first_friend",
    name: "Social Butterfly",
    description: "Add your first friend",
    icon: "Heart",
    rarity: "common",
    category: "social",
    xpReward: 25,
  },

  // Competitive badges
  first_win: {
    id: "first_win",
    name: "Victor",
    description: "Win your first ranked match",
    icon: "Trophy",
    rarity: "common",
    category: "competitive",
    xpReward: 25,
  },
  win_streak_5: {
    id: "win_streak_5",
    name: "Unstoppable",
    description: "Win 5 ranked matches in a row",
    icon: "TrendingUp",
    rarity: "rare",
    category: "competitive",
    xpReward: 150, // Difficult achievement
    requiredValue: 5,
  },
  leaderboard_top_10: {
    id: "leaderboard_top_10",
    name: "Elite",
    description: "Reach top 10 on any leaderboard",
    icon: "Award",
    rarity: "epic",
    category: "competitive",
    xpReward: 250,
    requiredValue: 10,
  },
  leaderboard_first: {
    id: "leaderboard_first",
    name: "Champion",
    description: "Reach #1 on any leaderboard",
    icon: "Gem",
    rarity: "legendary",
    category: "competitive",
    xpReward: 500,
    requiredValue: 1,
  },
};

/** Get all badges as an array */
export function getAllBadges(): BadgeDefinition[] {
  return Object.values(BADGE_DEFINITIONS);
}

/** Get badges by category */
export function getBadgesByCategory(
  category: BadgeCategory
): BadgeDefinition[] {
  return getAllBadges().filter((badge) => badge.category === category);
}

/** Get badges by rarity */
export function getBadgesByRarity(rarity: BadgeRarity): BadgeDefinition[] {
  return getAllBadges().filter((badge) => badge.rarity === rarity);
}

/** Get a specific badge definition */
export function getBadgeDefinition(
  badgeId: BadgeTrigger
): BadgeDefinition | null {
  return BADGE_DEFINITIONS[badgeId] ?? null;
}

/** Rarity colors for styling */
export const RARITY_COLORS: Record<BadgeRarity, { bg: string; text: string; border: string }> = {
  common: {
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-600 dark:text-zinc-400",
    border: "border-zinc-300 dark:border-zinc-600",
  },
  uncommon: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-400 dark:border-green-600",
  },
  rare: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-400 dark:border-blue-600",
  },
  epic: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-400 dark:border-purple-600",
  },
  legendary: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-400 dark:border-amber-600",
  },
};

/** Category display names */
export const CATEGORY_NAMES: Record<BadgeCategory, string> = {
  milestone: "Milestones",
  achievement: "Achievements",
  speed: "Speed",
  social: "Social",
  competitive: "Competitive",
};

/** Category order for display */
export const CATEGORY_ORDER: BadgeCategory[] = [
  "milestone",
  "achievement",
  "speed",
  "social",
  "competitive",
];
