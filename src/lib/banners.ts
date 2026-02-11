/**
 * Banner component catalog, unlock logic, and utilities
 *
 * All banner components are defined here with their unlock requirements.
 * Unlock resolution checks user_badges for badge-based unlocks and
 * peak_rank_tier for rank-based unlocks.
 */

import type {
  BannerComponentDefinition,
  BannerComponentType,
  ActiveBanner,
} from "@/types/banner.types";
import type { BadgeTrigger } from "@/types/badges.types";

/** Ordered rank tiers for comparison (lowest to highest) */
export const RANK_ORDER = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Sonic",
  "Mach",
  "Tachyon",
] as const;

export type RankName = (typeof RANK_ORDER)[number];

/** Check if a user's peak rank is at least the required rank */
export function isRankAtLeast(
  userPeakRank: string | null | undefined,
  requiredRank: string
): boolean {
  if (!userPeakRank) return false;
  const userIndex = RANK_ORDER.indexOf(userPeakRank as RankName);
  const requiredIndex = RANK_ORDER.indexOf(requiredRank as RankName);
  if (userIndex === -1 || requiredIndex === -1) return false;
  return userIndex >= requiredIndex;
}

// ---------------------------------------------------------------------------
// Component Catalog
// ---------------------------------------------------------------------------

/** All background components */
export const BACKGROUNDS: BannerComponentDefinition[] = [
  {
    id: "bg_starter_fade",
    name: "Starter Fade",
    componentType: "background",
    unlock: { type: "default" },
  },
  {
    id: "bg_arcade_grid",
    name: "Arcade Grid",
    componentType: "background",
    unlock: { type: "badge", badgeId: "level_5" },
  },
  {
    id: "bg_neon_drift",
    name: "Neon Drift",
    componentType: "background",
    unlock: { type: "badge", badgeId: "first_multiplayer" },
  },
  {
    id: "bg_velocity_lines",
    name: "Velocity Lines",
    componentType: "background",
    unlock: { type: "badge", badgeId: "wpm_100" },
  },
  {
    id: "bg_precision_wave",
    name: "Precision Wave",
    componentType: "background",
    unlock: { type: "badge", badgeId: "perfect_accuracy" },
  },
  {
    id: "bg_grindstone",
    name: "Grindstone",
    componentType: "background",
    unlock: { type: "badge", badgeId: "tests_100" },
  },
  {
    id: "bg_elite_pulse",
    name: "Elite Pulse",
    componentType: "background",
    unlock: { type: "badge", badgeId: "leaderboard_top_10" },
  },
  {
    id: "bg_champion_aura",
    name: "Champion Aura",
    componentType: "background",
    unlock: { type: "badge", badgeId: "leaderboard_first" },
  },
  {
    id: "bg_mach_burst",
    name: "Mach Burst",
    componentType: "background",
    unlock: { type: "peak_rank", rank: "Mach" },
  },
];

/** All border components */
export const BORDERS: BannerComponentDefinition[] = [
  {
    id: "border_clean",
    name: "Clean",
    componentType: "border",
    unlock: { type: "default" },
  },
  {
    id: "border_victor",
    name: "Victor",
    componentType: "border",
    unlock: { type: "badge", badgeId: "first_win" },
  },
  {
    id: "border_unstoppable",
    name: "Unstoppable",
    componentType: "border",
    unlock: { type: "badge", badgeId: "win_streak_5" },
  },
  {
    id: "border_bronze",
    name: "Bronze",
    componentType: "border",
    unlock: { type: "peak_rank", rank: "Bronze" },
  },
  {
    id: "border_silver",
    name: "Silver",
    componentType: "border",
    unlock: { type: "peak_rank", rank: "Silver" },
  },
  {
    id: "border_gold",
    name: "Gold",
    componentType: "border",
    unlock: { type: "peak_rank", rank: "Gold" },
  },
  {
    id: "border_platinum",
    name: "Platinum",
    componentType: "border",
    unlock: { type: "peak_rank", rank: "Platinum" },
  },
  {
    id: "border_diamond",
    name: "Diamond",
    componentType: "border",
    unlock: { type: "peak_rank", rank: "Diamond" },
  },
  {
    id: "border_sonic",
    name: "Sonic",
    componentType: "border",
    unlock: { type: "peak_rank", rank: "Sonic" },
  },
  {
    id: "border_mach",
    name: "Mach",
    componentType: "border",
    unlock: { type: "peak_rank", rank: "Mach" },
  },
  {
    id: "border_tachyon",
    name: "Tachyon",
    componentType: "border",
    unlock: { type: "peak_rank", rank: "Tachyon" },
  },
];

/** All title components */
export const TITLES: BannerComponentDefinition[] = [
  {
    id: "title_rookie",
    name: "Rookie",
    componentType: "title",
    unlock: { type: "default" },
  },
  {
    id: "title_slowpoke",
    name: "Slowpoke",
    componentType: "title",
    unlock: { type: "default" },
  },
  {
    id: "title_challenger",
    name: "Challenger",
    componentType: "title",
    unlock: { type: "badge", badgeId: "first_multiplayer" },
  },
  {
    id: "title_speedster",
    name: "Speedster",
    componentType: "title",
    unlock: { type: "badge", badgeId: "wpm_100" },
  },
  {
    id: "title_lightning_fingers",
    name: "Lightning Fingers",
    componentType: "title",
    unlock: { type: "badge", badgeId: "wpm_150" },
  },
  {
    id: "title_perfectionist",
    name: "Perfectionist",
    componentType: "title",
    unlock: { type: "badge", badgeId: "perfect_accuracy" },
  },
  {
    id: "title_rising_star",
    name: "Rising Star",
    componentType: "title",
    unlock: { type: "badge", badgeId: "level_5" },
  },
  {
    id: "title_dedicated",
    name: "Dedicated",
    componentType: "title",
    unlock: { type: "badge", badgeId: "level_10" },
  },
  {
    id: "title_veteran",
    name: "Veteran",
    componentType: "title",
    unlock: { type: "badge", badgeId: "level_20" },
  },
  {
    id: "title_legend",
    name: "Legend",
    componentType: "title",
    unlock: { type: "badge", badgeId: "level_50" },
  },
  {
    id: "title_victor",
    name: "Victor",
    componentType: "title",
    unlock: { type: "badge", badgeId: "first_win" },
  },
  {
    id: "title_unstoppable",
    name: "Unstoppable",
    componentType: "title",
    unlock: { type: "badge", badgeId: "win_streak_5" },
  },
  {
    id: "title_elite",
    name: "Elite",
    componentType: "title",
    unlock: { type: "badge", badgeId: "leaderboard_top_10" },
  },
  {
    id: "title_champion",
    name: "Champion",
    componentType: "title",
    unlock: { type: "badge", badgeId: "leaderboard_first" },
  },
];

/** All components in a flat array */
export const ALL_COMPONENTS: BannerComponentDefinition[] = [
  ...BACKGROUNDS,
  ...BORDERS,
  ...TITLES,
];

/** Lookup map: component ID -> definition */
export const COMPONENT_MAP: Record<string, BannerComponentDefinition> =
  Object.fromEntries(ALL_COMPONENTS.map((c) => [c.id, c]));

/** Get all components by type */
export function getComponentsByType(
  type: BannerComponentType
): BannerComponentDefinition[] {
  switch (type) {
    case "background":
      return BACKGROUNDS;
    case "border":
      return BORDERS;
    case "title":
      return TITLES;
  }
}

/** Valid component IDs set for fast validation */
const VALID_COMPONENT_IDS = new Set(ALL_COMPONENTS.map((c) => c.id));

export function isValidComponentId(id: string): boolean {
  return VALID_COMPONENT_IDS.has(id);
}

// ---------------------------------------------------------------------------
// Unlock Resolution
// ---------------------------------------------------------------------------

/**
 * Compute the set of unlocked component IDs for a user.
 *
 * @param earnedBadgeIds - Set of badge IDs the user has earned
 * @param peakRankTier - The user's peak rank tier (e.g. "Gold"), or null
 */
export function getUnlockedComponentIds(
  earnedBadgeIds: Set<BadgeTrigger>,
  peakRankTier: string | null | undefined
): Set<string> {
  const unlocked = new Set<string>();

  for (const component of ALL_COMPONENTS) {
    const { unlock } = component;
    switch (unlock.type) {
      case "default":
        unlocked.add(component.id);
        break;
      case "badge":
        if (earnedBadgeIds.has(unlock.badgeId)) {
          unlocked.add(component.id);
        }
        break;
      case "peak_rank":
        if (isRankAtLeast(peakRankTier, unlock.rank)) {
          unlocked.add(component.id);
        }
        break;
    }
  }

  return unlocked;
}

// ---------------------------------------------------------------------------
// Default Preset Constants (for lazy initialization)
// ---------------------------------------------------------------------------

export const DEFAULT_PRESET_NAMES = ["Preset 1", "Preset 2", "Preset 3"];

export const DEFAULT_BACKGROUND_ID = "bg_starter_fade";
export const DEFAULT_BORDER_ID = "border_clean";
export const DEFAULT_TITLE_ID = "title_rookie";

export const DEFAULT_ACTIVE_BANNER: ActiveBanner = {
  backgroundId: DEFAULT_BACKGROUND_ID,
  borderId: DEFAULT_BORDER_ID,
  titleId: DEFAULT_TITLE_ID,
};

/** Preset name validation */
const PRESET_NAME_PATTERN = /^[A-Za-z0-9 _-]+$/;
export const PRESET_NAME_MAX_LENGTH = 24;

export function isValidPresetName(name: string): boolean {
  const trimmed = name.trim();
  return (
    trimmed.length >= 1 &&
    trimmed.length <= PRESET_NAME_MAX_LENGTH &&
    PRESET_NAME_PATTERN.test(trimmed)
  );
}
