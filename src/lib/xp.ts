/**
 * XP and Level calculation utilities
 *
 * XP Formula:
 * - Base: 2.5 XP per active typing second × accuracy%
 * - WPM bonus: +1% per 10 WPM above 40 (max +12%)
 * - Multiplayer bonus: +5% of base
 * - WPM margin bonus: +1% per 5 WPM margin (max +10%)
 *
 * Level Formula (polynomial curve):
 * - XP needed for level N: 100 × (N-1)^1.5
 * - Gentler curve that balances accessibility with late-game prestige
 */

/**
 * Calculate XP gained from a typing test or match
 */
export function calculateXpGain({
  activeTypingSeconds,
  accuracy,
  wpm = 0,
  isMultiplayer = false,
  wpmMargin = 0,
}: {
  activeTypingSeconds: number;
  accuracy: number;
  wpm?: number;
  isMultiplayer?: boolean;
  wpmMargin?: number;
}): number {
  // Base XP: 2.5 × active seconds × accuracy%
  const baseXp = 2.5 * activeTypingSeconds * (accuracy / 100);

  let totalXp = baseXp;

  // WPM performance bonus: +1% per 10 WPM above 40 (max +12%)
  if (Number.isFinite(wpm) && wpm > 40) {
    const wpmBonusPercent = Math.min(0.12, Math.floor((wpm - 40) / 10) * 0.01);
    totalXp += baseXp * wpmBonusPercent;
  }

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
 * Get XP required to advance from level (level-1) to level.
 * Uses polynomial curve: 100 × (level-1)^1.5
 *
 * Examples:
 * - Level 1→2: 100 XP
 * - Level 2→3: 282 XP
 * - Level 3→4: 519 XP
 * - Level 4→5: 800 XP
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.5));
}

/**
 * Get cumulative XP needed to reach a specific level
 */
export function getCumulativeXpForLevel(level: number): number {
  let total = 0;
  // Sum XP thresholds from level 2 to target level
  for (let i = 2; i <= level; i++) {
    total += getXpForLevel(i);
  }
  return total;
}

/**
 * Calculate level from total XP
 */
export function calculateLevelFromXp(totalXp: number): number {
  // Handle invalid input (NaN, Infinity, negative, or zero)
  if (!Number.isFinite(totalXp) || totalXp <= 0) {
    return 1;
  }

  let level = 1;
  let cumulativeXp = 0;

  while (level < 100) {
    // XP needed to advance from current level to next
    const threshold = getXpForLevel(level + 1);
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
  // XP needed to advance from current level to next level
  const nextLevelXp = getXpForLevel(level + 1);
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
  xpGain: number,
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
 * Level thresholds for reference (XP needed to complete level N and reach N+1):
 * Level 1→2:    100 XP    (100 × 1^1.5)
 * Level 2→3:    282 XP    (100 × 2^1.5)
 * Level 3→4:    519 XP    (100 × 3^1.5)
 * Level 4→5:    800 XP    (100 × 4^1.5)
 * Level 5→6:    1,118 XP  (100 × 5^1.5)
 * Level 10→11:  3,162 XP  (100 × 10^1.5)
 * Level 25→26:  12,500 XP (100 × 25^1.5)
 * Level 50→51:  35,355 XP (100 × 50^1.5)
 */
