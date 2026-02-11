/**
 * Banner customization types
 *
 * Users have 3 banner presets with background, border, and title components.
 * Components are unlocked via badges or peak rank tier.
 */

import type { BadgeTrigger } from "./badges.types";

/** The three component categories in a banner preset */
export type BannerComponentType = "background" | "border" | "title";

/** Preset slot numbers */
export type PresetSlot = 1 | 2 | 3;

/** How a banner component is unlocked */
export type UnlockRequirement =
  | { type: "default" }
  | { type: "badge"; badgeId: BadgeTrigger }
  | { type: "peak_rank"; rank: string };

/** Static definition for a banner component */
export interface BannerComponentDefinition {
  id: string;
  name: string;
  componentType: BannerComponentType;
  unlock: UnlockRequirement;
}

/** A user's saved banner preset (from DB) */
export interface BannerPreset {
  id: string;
  userId: string;
  slot: PresetSlot;
  name: string;
  backgroundId: string;
  borderId: string;
  titleId: string;
}

/** A resolved preset with full component definitions and unlock state */
export interface ResolvedBannerPreset extends BannerPreset {
  background: BannerComponentDefinition;
  border: BannerComponentDefinition;
  title: BannerComponentDefinition;
}

/** Full customization state sent to the banner editor */
export interface BannerCustomizationState {
  presets: BannerPreset[];
  activeSlot: PresetSlot;
  unlockedComponentIds: Set<string>;
}

/** Active banner for display on profile/friends/lobby */
export interface ActiveBanner {
  backgroundId: string;
  borderId: string;
  titleId: string;
}
