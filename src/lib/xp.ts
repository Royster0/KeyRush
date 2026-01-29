/**
 * XP and Level calculation utilities
 *
 * XP Formula:
 * - Base: 2 XP per active typing second × accuracy%
 * - Multiplayer bonus: +5% of base
 * - WPM margin bonus: +1% per 5 WPM margin (max +10%)
 *
 * Level Formula (polynomial curve):
 * - XP needed for level N: 100 × N^1.8
 * - Creates smooth progression that rewards sustained play
 */

/**
 * Calculate XP gained from a typing test or match
 */
export function calculateXpGain({
  activeTypingSeconds,
  accuracy,
  isMultiplayer = false,
  wpmMargin = 0,
}: {
  activeTypingSeconds: number;
  accuracy: number;
  isMultiplayer?: boolean;
  wpmMargin?: number;
}): number {
  // Base XP: 2 × active seconds × accuracy%
  const baseXp = 2 * activeTypingSeconds * (accuracy / 100);

  let totalXp = baseXp;

  if (isMultiplayer) {
    // Multiplayer base bonus: +5%
    const multiplayerBonus = baseXp * 0.05;
    totalXp += multiplayerBonus;

    // WPM margin bonus for wins: +1% per 5 WPM margin (max +10%)
    if (wpmMargin > 0) {
      const marginPercent = Math.min(0.1, Math.floor(wpmMargin / 5) * 0.01);
      const marginBonus = baseXp * marginPercent;
      totalXp += marginBonus;
    }
  }

  return Math.round(Math.max(0, totalXp));
}

/**
 * Get XP required for a specific level (polynomial curve: 100 × level^1.8)
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level, 1.8));
}

/**
 * Get cumulative XP needed to reach a specific level
 */
export function getCumulativeXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXpForLevel(i);
  }
  return total;
}

/**
 * Calculate level from total XP
 */
export function calculateLevelFromXp(totalXp: number): number {
  // Handle invalid input (NaN, Infinity, negative)
  if (!Number.isFinite(totalXp) || totalXp < 0) {
    return 1;
  }

  let level = 1;
  let cumulativeXp = 0;

  while (level <= 100) {
    const threshold = getXpForLevel(level);
    if (cumulativeXp + threshold > totalXp) {
      break;
    }
    cumulativeXp += threshold;
    level++;
  }

  return level;
}

/**
 * Get progress within current level
 */
export function getLevelProgress(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
} {
  // Handle invalid input
  const safeXp = Number.isFinite(totalXp) && totalXp >= 0 ? totalXp : 0;

  const level = calculateLevelFromXp(safeXp);
  const levelStartXp = getCumulativeXpForLevel(level);
  const nextLevelXp = getXpForLevel(level);
  const currentLevelXp = safeXp - levelStartXp;

  const progress = nextLevelXp > 0 ? (currentLevelXp / nextLevelXp) * 100 : 0;

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progress: Math.min(100, Math.max(0, progress)),
  };
}

/**
 * Check if XP gain would result in a level up
 */
export function wouldLevelUp(
  currentTotalXp: number,
  xpGain: number
): { leveledUp: boolean; oldLevel: number; newLevel: number } {
  const oldLevel = calculateLevelFromXp(currentTotalXp);
  const newLevel = calculateLevelFromXp(currentTotalXp + xpGain);

  return {
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
  };
}

/**
 * Level thresholds for reference:
 * Level 1→2:    100 XP
 * Level 5→6:    631 XP
 * Level 10→11:  1,585 XP
 * Level 25→26:  6,310 XP
 * Level 50→51:  16,595 XP
 */
