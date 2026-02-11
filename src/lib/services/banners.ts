import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { BannerPresetRowSchema, mapDbBannerPresetToModel } from "@/lib/schemas/banners";
import type { BannerPreset, PresetSlot, BannerCustomizationState, ActiveBanner } from "@/types/banner.types";
import type { BadgeTrigger } from "@/types/badges.types";
import {
  getUnlockedComponentIds,
  isValidComponentId,
  isValidPresetName,
  DEFAULT_PRESET_NAMES,
  DEFAULT_BACKGROUND_ID,
  DEFAULT_BORDER_ID,
  DEFAULT_TITLE_ID,
  DEFAULT_ACTIVE_BANNER,
} from "@/lib/banners";

/**
 * Ensure default banner presets exist for a user (lazy initialization).
 * Uses ON CONFLICT to be idempotent.
 */
async function ensureDefaultPresets(userId: string): Promise<void> {
  const supabase = await createClient();

  const rows = DEFAULT_PRESET_NAMES.map((name, i) => ({
    user_id: userId,
    slot: (i + 1) as PresetSlot,
    name,
    background_id: DEFAULT_BACKGROUND_ID,
    border_id: DEFAULT_BORDER_ID,
    title_id: DEFAULT_TITLE_ID,
  }));

  // Upsert with ON CONFLICT DO NOTHING via ignoreDuplicates
  await supabase
    .from("banner_presets")
    .upsert(rows, { onConflict: "user_id,slot", ignoreDuplicates: true });
}

/**
 * Load a user's banner presets (with lazy init).
 */
async function loadUserPresets(userId: string): Promise<BannerPreset[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("banner_presets")
    .select("*")
    .eq("user_id", userId)
    .order("slot", { ascending: true });

  if (error || !data || data.length === 0) {
    // Lazy init: create defaults and retry
    await ensureDefaultPresets(userId);

    const { data: retryData } = await supabase
      .from("banner_presets")
      .select("*")
      .eq("user_id", userId)
      .order("slot", { ascending: true });

    if (!retryData) return [];
    const parsed = z.array(BannerPresetRowSchema).safeParse(retryData);
    if (!parsed.success) return [];
    return parsed.data.map(mapDbBannerPresetToModel);
  }

  const parsed = z.array(BannerPresetRowSchema).safeParse(data);
  if (!parsed.success) return [];
  return parsed.data.map(mapDbBannerPresetToModel);
}

/**
 * Get full banner customization state for the authenticated user.
 */
export async function getBannerCustomizationState(): Promise<BannerCustomizationState | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const presets = await loadUserPresets(user.id);

  // Fetch active slot from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("active_banner_slot, peak_rank_tier")
    .eq("id", user.id)
    .single();

  const activeSlot = (profile?.active_banner_slot ?? 1) as PresetSlot;
  const peakRankTier = profile?.peak_rank_tier as string | null;

  // Fetch user badges for unlock resolution
  const { data: badgeData } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", user.id);

  const earnedBadgeIds = new Set<BadgeTrigger>(
    (badgeData ?? []).map((row) => row.badge_id as BadgeTrigger)
  );

  const unlockedComponentIds = getUnlockedComponentIds(earnedBadgeIds, peakRankTier);

  return { presets, activeSlot, unlockedComponentIds };
}

/**
 * Get another user's active banner preset for display.
 */
export async function getActiveBanner(userId: string): Promise<ActiveBanner | null> {
  const supabase = await createClient();

  // Fetch active slot
  const { data: profile } = await supabase
    .from("profiles")
    .select("active_banner_slot")
    .eq("id", userId)
    .single();

  if (!profile) return null;

  const activeSlot = profile.active_banner_slot as number;

  // RLS public read policy allows reading the active preset
  const { data } = await supabase
    .from("banner_presets")
    .select("background_id, border_id, title_id")
    .eq("user_id", userId)
    .eq("slot", activeSlot)
    .single();

  if (!data) return DEFAULT_ACTIVE_BANNER;

  return {
    backgroundId: data.background_id,
    borderId: data.border_id,
    titleId: data.title_id,
  };
}

/**
 * Update a banner preset's components.
 */
export async function updateBannerPreset(
  slot: PresetSlot,
  backgroundId: string,
  borderId: string,
  titleId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  // Validate component IDs exist
  if (!isValidComponentId(backgroundId)) return { ok: false, error: "Invalid background." };
  if (!isValidComponentId(borderId)) return { ok: false, error: "Invalid border." };
  if (!isValidComponentId(titleId)) return { ok: false, error: "Invalid title." };

  // Validate components are unlocked
  const { data: badgeData } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("peak_rank_tier")
    .eq("id", user.id)
    .single();

  const earnedBadgeIds = new Set<BadgeTrigger>(
    (badgeData ?? []).map((row) => row.badge_id as BadgeTrigger)
  );
  const unlocked = getUnlockedComponentIds(earnedBadgeIds, profile?.peak_rank_tier ?? null);

  if (!unlocked.has(backgroundId)) return { ok: false, error: "Background is locked." };
  if (!unlocked.has(borderId)) return { ok: false, error: "Border is locked." };
  if (!unlocked.has(titleId)) return { ok: false, error: "Title is locked." };

  // Ensure presets exist
  await ensureDefaultPresets(user.id);

  const { error } = await supabase
    .from("banner_presets")
    .update({
      background_id: backgroundId,
      border_id: borderId,
      title_id: titleId,
    })
    .eq("user_id", user.id)
    .eq("slot", slot);

  if (error) return { ok: false, error: "Failed to update preset." };
  return { ok: true };
}

/**
 * Set the active banner preset slot.
 */
export async function setActiveBannerPreset(
  slot: PresetSlot
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  if (slot < 1 || slot > 3) return { ok: false, error: "Invalid slot." };

  const { error } = await supabase
    .from("profiles")
    .update({ active_banner_slot: slot })
    .eq("id", user.id);

  if (error) return { ok: false, error: "Failed to set active preset." };
  return { ok: true };
}

/**
 * Rename a banner preset.
 */
export async function renameBannerPreset(
  slot: PresetSlot,
  name: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const trimmed = name.trim();
  if (!isValidPresetName(trimmed)) {
    return { ok: false, error: "Invalid name. Use 1-24 alphanumeric characters, spaces, underscores, or hyphens." };
  }

  // Ensure presets exist
  await ensureDefaultPresets(user.id);

  const { error } = await supabase
    .from("banner_presets")
    .update({ name: trimmed })
    .eq("user_id", user.id)
    .eq("slot", slot);

  if (error) return { ok: false, error: "Failed to rename preset." };
  return { ok: true };
}
