import { z } from "zod";

export const FriendProfileSchema = z.object({
  id: z.string(),
  username: z.string().nullable(),
  level: z.number().nullable(),
  rank_tier: z.string().nullable(),
  elo: z.number().nullable(),
  last_active_at: z.string().nullable().optional(),
});

export const FriendshipRowSchema = z.object({
  friend_id: z.string(),
  friend: FriendProfileSchema,
});

export const FriendRequestRowSchema = z.object({
  id: z.string(),
  sender_id: z.string(),
  receiver_id: z.string(),
  status: z.string(),
  created_at: z.string(),
  sender: FriendProfileSchema,
});

export const FriendMatchRowSchema = z.object({
  id: z.string(),
  party_match_id: z.string().nullable(),
  player1_id: z.string().nullable(),
  player2_id: z.string().nullable(),
  winner_id: z.string().nullable(),
});

export const FriendPresenceRowSchema = z.object({
  user_id: z.string(),
  last_active_at: z.string().nullable(),
});

export type FriendProfileRow = z.infer<typeof FriendProfileSchema>;
export type FriendshipRow = z.infer<typeof FriendshipRowSchema>;
export type FriendRequestRow = z.infer<typeof FriendRequestRowSchema>;
export type FriendMatchRow = z.infer<typeof FriendMatchRowSchema>;
export type FriendPresenceRow = z.infer<typeof FriendPresenceRowSchema>;
