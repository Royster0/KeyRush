import { z } from "zod";
import type { BannerPreset, PresetSlot } from "@/types/banner.types";

/**
 * Schema for banner preset rows from database
 */
export const BannerPresetRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  slot: z.number().int().min(1).max(3),
  name: z.string(),
  background_id: z.string(),
  border_id: z.string(),
  title_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type DbBannerPresetRow = z.infer<typeof BannerPresetRowSchema>;

/**
 * Map database banner preset to client model
 */
export function mapDbBannerPresetToModel(db: DbBannerPresetRow): BannerPreset {
  return {
    id: db.id,
    userId: db.user_id,
    slot: db.slot as PresetSlot,
    name: db.name,
    backgroundId: db.background_id,
    borderId: db.border_id,
    titleId: db.title_id,
  };
}
