import { z } from "zod";

/**
 * Schema for user badge records from database
 */
export const UserBadgeSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  badge_id: z.string(),
  earned_at: z.string(),
});

export type DbUserBadge = z.infer<typeof UserBadgeSchema>;

/**
 * Schema for badge award RPC response
 */
export const BadgeAwardResultSchema = z.object({
  badge_id: z.string(),
  already_had: z.boolean(),
});

export type DbBadgeAwardResult = z.infer<typeof BadgeAwardResultSchema>;

/**
 * Client-side user badge (camelCase)
 */
export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
}

/**
 * Map database user badge to client model
 */
export function mapDbUserBadgeToModel(db: DbUserBadge): UserBadge {
  return {
    id: db.id,
    userId: db.user_id,
    badgeId: db.badge_id,
    earnedAt: db.earned_at,
  };
}
