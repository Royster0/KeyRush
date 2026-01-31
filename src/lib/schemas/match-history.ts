import { z } from "zod";

export const MatchResultRowSchema = z.object({
  id: z.string(),
  match_id: z.string(),
  user_id: z.string(),
  wpm: z.number(),
  raw_wpm: z.number().nullable(),
  accuracy: z.number(),
  progress: z.number().nullable(),
  left_match: z.boolean().nullable(),
  created_at: z.string(),
  matches: z.object({
    id: z.string(),
    player1_id: z.string(),
    player2_id: z.string(),
    winner_id: z.string().nullable(),
    duration: z.number(),
    mode: z.union([z.string(), z.number()]),
    ended_at: z.string().nullable(),
  }),
});

export const OpponentResultSchema = z.object({
  user_id: z.string(),
  wpm: z.number(),
  raw_wpm: z.number().nullable(),
  accuracy: z.number(),
  profiles: z.object({
    username: z.string().nullable(),
  }),
});

export type MatchResultRow = z.infer<typeof MatchResultRowSchema>;
export type OpponentResult = z.infer<typeof OpponentResultSchema>;
