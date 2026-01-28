import { z } from "zod";

export const UserRankingRowSchema = z.object({
  duration: z.number(),
  rank: z.number().nullable(),
  total_users: z.number(),
});

export const LeaderboardEntrySchema = z.object({
  username: z.string(),
  wpm: z.number(),
  accuracy: z.number(),
  user_id: z.string(),
  test_id: z.string(),
  created_at: z.string(),
});

export const RankedPlayerRowSchema = z.object({
  id: z.string(),
  username: z.string().nullable(),
  elo: z.number().nullable(),
  rank_tier: z.string().nullable(),
  matches_played: z.number().nullable(),
  wins: z.number().nullable(),
  losses: z.number().nullable(),
});

// Schema for multiplayer match result rows (complex nested structure from Supabase join)
export const MultiplayerResultRowSchema = z.object({
  user_id: z.string(),
  wpm: z.number(),
  accuracy: z.number(),
  match_id: z.string(),
  matches: z.object({
    id: z.string(),
    duration: z.number(),
    ended_at: z.string().nullable(),
  }),
  profiles: z.object({
    username: z.string().nullable(),
  }),
});

export type UserRankingRow = z.infer<typeof UserRankingRowSchema>;
export type LeaderboardEntryRow = z.infer<typeof LeaderboardEntrySchema>;
export type RankedPlayerRow = z.infer<typeof RankedPlayerRowSchema>;
export type MultiplayerResultRow = z.infer<typeof MultiplayerResultRowSchema>;
