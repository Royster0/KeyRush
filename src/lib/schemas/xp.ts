import { z } from "zod";

/**
 * Schema for the award_xp RPC response
 */
export const XpAwardResultSchema = z.object({
  previous_xp: z.number(),
  new_xp: z.number(),
  xp_gained: z.number(),
  previous_level: z.number(),
  new_level: z.number(),
  leveled_up: z.boolean(),
  current_level_xp: z.number(),
  next_level_xp: z.number(),
  progress: z.number(),
});

export type DbXpAwardResult = z.infer<typeof XpAwardResultSchema>;

/**
 * Schema for user XP progress query
 */
export const UserXpProgressSchema = z.object({
  total_xp: z.number(),
  level: z.number(),
  current_level_xp: z.number(),
  next_level_xp: z.number(),
  progress: z.number(),
});

export type DbUserXpProgress = z.infer<typeof UserXpProgressSchema>;

/**
 * Client-side XP award result (camelCase)
 */
export interface XpAwardResult {
  previousXp: number;
  newXp: number;
  xpGained: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
}

/**
 * Client-side user XP progress (camelCase)
 */
export interface UserXpProgress {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
}

/**
 * Map database result to client model
 */
export function mapDbXpAwardToModel(db: DbXpAwardResult): XpAwardResult {
  return {
    previousXp: db.previous_xp,
    newXp: db.new_xp,
    xpGained: db.xp_gained,
    previousLevel: db.previous_level,
    newLevel: db.new_level,
    leveledUp: db.leveled_up,
    currentLevelXp: db.current_level_xp,
    nextLevelXp: db.next_level_xp,
    progress: db.progress,
  };
}

/**
 * Map database XP progress to client model
 */
export function mapDbXpProgressToModel(db: DbUserXpProgress): UserXpProgress {
  return {
    totalXp: db.total_xp,
    level: db.level,
    currentLevelXp: db.current_level_xp,
    nextLevelXp: db.next_level_xp,
    progress: db.progress,
  };
}
