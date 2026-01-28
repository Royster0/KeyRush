import { z } from "zod";

export const DbTestResultSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  wpm: z.number(),
  raw_wpm: z.number(),
  accuracy: z.number(),
  duration: z.number(),
  created_at: z.string(),
});

export type DbTestResultRow = z.infer<typeof DbTestResultSchema>;
