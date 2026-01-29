import { createClient } from "@/utils/supabase/server";
import { calculateXpGain } from "@/lib/xp";
import {
  XpAwardResultSchema,
  UserXpProgressSchema,
  mapDbXpAwardToModel,
  mapDbXpProgressToModel,
  type XpAwardResult,
  type UserXpProgress,
} from "@/lib/schemas/xp";

/**
 * Award XP to a user after completing a typing test or match
 *
 * @param activeTypingSeconds - Actual seconds spent typing (excluding AFK time)
 * @param accuracy - Accuracy percentage (0-100)
 * @param isMultiplayer - Whether this is from a multiplayer match
 * @param wpmMargin - WPM margin over opponent (for multiplayer wins)
 */
export async function awardXp({
  activeTypingSeconds,
  accuracy,
  isMultiplayer = false,
  wpmMargin = 0,
}: {
  activeTypingSeconds: number;
  accuracy: number;
  isMultiplayer?: boolean;
  wpmMargin?: number;
}): Promise<XpAwardResult | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Calculate XP amount using shared formula
  const xpAmount = calculateXpGain({
    activeTypingSeconds,
    accuracy,
    isMultiplayer,
    wpmMargin,
  });

  // Don't bother with RPC call if no XP to award
  if (xpAmount <= 0) {
    return null;
  }

  // Call server-side RPC for authoritative XP update
  const { data, error } = await supabase.rpc("award_xp", {
    p_user_id: user.id,
    p_xp_amount: xpAmount,
  });

  if (error) {
    console.error("Error awarding XP:", error);
    return null;
  }

  // RPC returns an array with one row
  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    return null;
  }

  // Validate response with Zod
  const parsed = XpAwardResultSchema.safeParse(row);
  if (!parsed.success) {
    console.error("Invalid XP award response:", parsed.error);
    return null;
  }

  return mapDbXpAwardToModel(parsed.data);
}

/**
 * Get user's current XP progress
 */
export async function getUserXpProgress(): Promise<UserXpProgress | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase.rpc("get_user_xp_progress", {
    p_user_id: user.id,
  });

  if (error) {
    console.error("Error getting XP progress:", error);
    return null;
  }

  // RPC returns an array with one row
  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    return null;
  }

  // Validate response with Zod
  const parsed = UserXpProgressSchema.safeParse(row);
  if (!parsed.success) {
    console.error("Invalid XP progress response:", parsed.error);
    return null;
  }

  return mapDbXpProgressToModel(parsed.data);
}
