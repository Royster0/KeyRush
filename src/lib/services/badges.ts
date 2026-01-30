import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import {
  UserBadgeSchema,
  mapDbUserBadgeToModel,
  type UserBadge,
} from "@/lib/schemas/badges";
import {
  BadgeTrigger,
  BadgeContext,
  BadgeWithStatus,
  BadgeNotification,
} from "@/types/badges.types";
import { BADGE_DEFINITIONS, getAllBadges } from "@/lib/badges";

/**
 * Get all badges a user has earned
 */
export async function getUserBadges(userId?: string): Promise<UserBadge[]> {
  const supabase = await createClient();

  // Get user ID if not provided
  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    targetUserId = user.id;
  }

  const { data, error } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", targetUserId)
    .order("earned_at", { ascending: true });

  if (error) {
    console.error("Error fetching user badges:", error);
    return [];
  }

  const parsed = z.array(UserBadgeSchema).safeParse(data);
  if (!parsed.success) {
    console.error("Invalid badge data:", parsed.error);
    return [];
  }

  return parsed.data.map(mapDbUserBadgeToModel);
}

/**
 * Get all badges with earned status for a user
 */
export async function getBadgesWithStatus(
  userId?: string
): Promise<BadgeWithStatus[]> {
  const userBadges = await getUserBadges(userId);
  const earnedBadgeIds = new Set(userBadges.map((b) => b.badgeId));

  return getAllBadges().map((badge) => {
    const earned = earnedBadgeIds.has(badge.id);
    const earnedBadge = earned
      ? userBadges.find((b) => b.badgeId === badge.id)
      : undefined;

    return {
      ...badge,
      earned,
      earnedAt: earnedBadge?.earnedAt,
    };
  });
}

/**
 * Award a badge to a user (idempotent - won't duplicate)
 * Also awards XP based on badge rarity
 */
export async function awardBadge(
  badgeId: BadgeTrigger
): Promise<{ awarded: boolean; alreadyHad: boolean; xpAwarded: number }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { awarded: false, alreadyHad: false, xpAwarded: 0 };
  }

  // Check if user already has this badge
  const { data: existing } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", user.id)
    .eq("badge_id", badgeId)
    .single();

  if (existing) {
    return { awarded: false, alreadyHad: true, xpAwarded: 0 };
  }

  // Award the badge
  const { error } = await supabase.from("user_badges").insert({
    user_id: user.id,
    badge_id: badgeId,
  });

  if (error) {
    console.error("Error awarding badge:", error);
    return { awarded: false, alreadyHad: false, xpAwarded: 0 };
  }

  // Award XP for earning the badge
  const badge = BADGE_DEFINITIONS[badgeId];
  let xpAwarded = 0;
  if (badge && badge.xpReward > 0) {
    const { error: xpError } = await supabase.rpc("award_xp", {
      p_user_id: user.id,
      p_xp_amount: badge.xpReward,
    });

    if (xpError) {
      console.error("Error awarding badge XP:", xpError);
    } else {
      xpAwarded = badge.xpReward;
    }
  }

  return { awarded: true, alreadyHad: false, xpAwarded };
}

/**
 * Award multiple badges at once (for batch processing)
 * Returns total XP awarded from all badges
 */
export async function awardBadges(
  badgeIds: BadgeTrigger[]
): Promise<BadgeNotification[]> {
  const notifications: BadgeNotification[] = [];

  for (const badgeId of badgeIds) {
    const result = await awardBadge(badgeId);
    if (result.awarded) {
      const badge = BADGE_DEFINITIONS[badgeId];
      if (badge) {
        notifications.push({
          badge,
          earnedAt: new Date().toISOString(),
          xpAwarded: result.xpAwarded,
        });
      }
    }
  }

  return notifications;
}

/**
 * Check which badges should be triggered based on context
 * Returns array of badge IDs that the user is now eligible for
 */
export async function checkBadgeTriggers(
  context: BadgeContext
): Promise<BadgeTrigger[]> {
  const userBadges = await getUserBadges(context.userId);
  const earnedBadgeIds = new Set(userBadges.map((b) => b.badgeId));
  const newBadges: BadgeTrigger[] = [];

  // Helper to check if badge can be triggered
  const canTrigger = (badgeId: BadgeTrigger) => !earnedBadgeIds.has(badgeId);

  // First test badge
  if (canTrigger("first_test") && context.wpm !== undefined) {
    newBadges.push("first_test");
  }

  // First multiplayer badge
  if (canTrigger("first_multiplayer") && context.isMultiplayer) {
    newBadges.push("first_multiplayer");
  }

  // Placement complete (5 matches)
  if (
    canTrigger("placement_complete") &&
    context.matchesPlayed !== undefined &&
    context.matchesPlayed >= 5
  ) {
    newBadges.push("placement_complete");
  }

  // Level badges
  if (context.newLevel !== undefined) {
    if (canTrigger("level_5") && context.newLevel >= 5) {
      newBadges.push("level_5");
    }
    if (canTrigger("level_10") && context.newLevel >= 10) {
      newBadges.push("level_10");
    }
    if (canTrigger("level_20") && context.newLevel >= 20) {
      newBadges.push("level_20");
    }
    if (canTrigger("level_50") && context.newLevel >= 50) {
      newBadges.push("level_50");
    }
  }

  // WPM badges
  if (context.wpm !== undefined) {
    if (canTrigger("wpm_100") && context.wpm >= 100) {
      newBadges.push("wpm_100");
    }
    if (canTrigger("wpm_150") && context.wpm >= 150) {
      newBadges.push("wpm_150");
    }
  }

  // Perfect accuracy (minimum 15s test)
  if (
    canTrigger("perfect_accuracy") &&
    context.accuracy === 100 &&
    context.duration !== undefined &&
    context.duration >= 15
  ) {
    newBadges.push("perfect_accuracy");
  }

  // First friend
  if (
    canTrigger("first_friend") &&
    context.friendCount !== undefined &&
    context.friendCount >= 1
  ) {
    newBadges.push("first_friend");
  }

  // First win
  if (canTrigger("first_win") && context.isWin) {
    newBadges.push("first_win");
  }

  // Win streak badges
  if (context.currentWinStreak !== undefined) {
    if (canTrigger("win_streak_5") && context.currentWinStreak >= 5) {
      newBadges.push("win_streak_5");
    }
  }

  // 100 tests badge
  if (
    canTrigger("tests_100") &&
    context.totalTests !== undefined &&
    context.totalTests >= 100
  ) {
    newBadges.push("tests_100");
  }

  // Leaderboard badges
  if (context.leaderboardRank !== undefined) {
    if (
      canTrigger("leaderboard_top_10") &&
      context.leaderboardRank <= 10 &&
      context.leaderboardRank >= 1
    ) {
      newBadges.push("leaderboard_top_10");
    }
    if (canTrigger("leaderboard_first") && context.leaderboardRank === 1) {
      newBadges.push("leaderboard_first");
    }
  }

  return newBadges;
}

/**
 * Check and award badges based on context
 * Combines trigger checking and awarding into one call
 */
export async function checkAndAwardBadges(
  context: BadgeContext
): Promise<BadgeNotification[]> {
  const triggeredBadges = await checkBadgeTriggers(context);
  if (triggeredBadges.length === 0) {
    return [];
  }
  return awardBadges(triggeredBadges);
}

/**
 * Get badge count for a user
 */
export async function getUserBadgeCount(userId?: string): Promise<number> {
  const badges = await getUserBadges(userId);
  return badges.length;
}

/**
 * Get user stats needed for badge context
 * Fetches test count and other relevant stats
 */
export async function getUserStatsForBadges(): Promise<{
  totalTests: number;
  friendCount: number;
  matchesPlayed: number;
  wins: number;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { totalTests: 0, friendCount: 0, matchesPlayed: 0, wins: 0 };
  }

  // Fetch test count
  const { count: testCount } = await supabase
    .from("test_results")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Fetch friend count
  const { count: friendCount } = await supabase
    .from("friendships")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Fetch profile for matches played and wins
  const { data: profile } = await supabase
    .from("profiles")
    .select("matches_played, wins")
    .eq("id", user.id)
    .single();

  return {
    totalTests: testCount ?? 0,
    friendCount: friendCount ?? 0,
    matchesPlayed: profile?.matches_played ?? 0,
    wins: profile?.wins ?? 0,
  };
}
