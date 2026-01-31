import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { TestResults } from "@/types/game.types";
import { DbTestResultSchema } from "@/lib/schemas/test-results";

export interface DbTestResult {
  id: string;
  user_id: string;
  wpm: number;
  raw_wpm: number;
  accuracy: number;
  duration: number;
  created_at: string;
}

export interface BestScore extends TestResults {
  source: "singleplayer" | "multiplayer";
}

function mapDbToModel(db: DbTestResult): TestResults {
  return {
    id: db.id,
    user_id: db.user_id,
    wpm: db.wpm,
    rawWpm: db.raw_wpm,
    accuracy: db.accuracy,
    duration: db.duration,
    created_at: db.created_at,
  };
}

export async function saveTestResult(result: Omit<TestResults, "user_id">) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("test_results")
    .insert([
      {
        user_id: user.id,
        wpm: result.wpm,
        raw_wpm: result.rawWpm,
        accuracy: result.accuracy,
        duration: result.duration,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  const parsed = DbTestResultSchema.safeParse(data);
  if (!parsed.success) {
    return null;
  }

  return mapDbToModel(parsed.data);
}

export async function getUserTestResults(): Promise<TestResults[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }
  
  const { data: testResults, error } = await supabase
    .from("test_results")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
    
  if (error || !testResults) {
    return [];
  }

  const parsed = z.array(DbTestResultSchema).safeParse(testResults);
  if (!parsed.success) {
    return [];
  }

  return parsed.data.map(mapDbToModel);
}

export async function getTestResultsByUserId(
  userId: string
): Promise<TestResults[]> {
  const supabase = await createClient();

  if (!userId) {
    return [];
  }

  const { data: testResults, error } = await supabase
    .from("test_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !testResults) {
    return [];
  }

  const parsed = z.array(DbTestResultSchema).safeParse(testResults);
  if (!parsed.success) {
    return [];
  }

  return parsed.data.map(mapDbToModel);
}

export async function getUserBestScores(): Promise<BestScore[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Fetch singleplayer best scores
  const { data: singleplayerData, error: singleplayerError } = await supabase
    .rpc('get_user_best_scores_full', { target_user_id: user.id });

  let singleplayerScores: BestScore[] = [];
  if (!singleplayerError && singleplayerData) {
    const parsed = z.array(DbTestResultSchema).safeParse(singleplayerData);
    if (parsed.success) {
      singleplayerScores = parsed.data.map((db) => ({
        ...mapDbToModel(db),
        source: "singleplayer" as const,
      }));
    }
  }

  // Fetch multiplayer best scores (join with matches to get duration)
  const { data: multiplayerData, error: multiplayerError } = await supabase
    .from("match_results")
    .select(`
      id,
      user_id,
      wpm,
      raw_wpm,
      accuracy,
      created_at,
      matches!inner (
        duration
      )
    `)
    .eq("user_id", user.id)
    .eq("left_match", false)
    .order("wpm", { ascending: false });

  let multiplayerScores: BestScore[] = [];
  if (!multiplayerError && multiplayerData) {
    // Group by duration and get best for each
    const bestByDuration = new Map<number, BestScore>();

    for (const row of multiplayerData) {
      const matches = row.matches as unknown as { duration: number };
      const duration = matches.duration;
      const score: BestScore = {
        id: row.id,
        user_id: row.user_id,
        wpm: Number(row.wpm),
        rawWpm: Number(row.raw_wpm),
        accuracy: Number(row.accuracy),
        duration,
        created_at: row.created_at,
        source: "multiplayer",
      };

      const existing = bestByDuration.get(duration);
      if (!existing || score.wpm > existing.wpm) {
        bestByDuration.set(duration, score);
      }
    }

    multiplayerScores = Array.from(bestByDuration.values());
  }

  // Combine and keep best score per duration (regardless of source)
  const allScores = [...singleplayerScores, ...multiplayerScores];
  const bestByDuration = new Map<number, BestScore>();

  for (const score of allScores) {
    const existing = bestByDuration.get(score.duration);
    if (!existing || score.wpm > existing.wpm) {
      bestByDuration.set(score.duration, score);
    }
  }

  return Array.from(bestByDuration.values());
}

export async function getBestScoresByUserId(
  userId: string
): Promise<BestScore[]> {
  const supabase = await createClient();

  if (!userId) {
    return [];
  }

  // Fetch singleplayer best scores
  const { data: singleplayerData, error: singleplayerError } = await supabase
    .rpc("get_user_best_scores_full", { target_user_id: userId });

  let singleplayerScores: BestScore[] = [];
  if (!singleplayerError && singleplayerData) {
    const parsed = z.array(DbTestResultSchema).safeParse(singleplayerData);
    if (parsed.success) {
      singleplayerScores = parsed.data.map((db) => ({
        ...mapDbToModel(db),
        source: "singleplayer" as const,
      }));
    }
  }

  // Fetch multiplayer best scores (join with matches to get duration)
  const { data: multiplayerData, error: multiplayerError } = await supabase
    .from("match_results")
    .select(
      `
      id,
      user_id,
      wpm,
      raw_wpm,
      accuracy,
      created_at,
      matches!inner (
        duration
      )
    `
    )
    .eq("user_id", userId)
    .eq("left_match", false)
    .order("wpm", { ascending: false });

  let multiplayerScores: BestScore[] = [];
  if (!multiplayerError && multiplayerData) {
    // Group by duration and get best for each
    const bestByDuration = new Map<number, BestScore>();

    for (const row of multiplayerData) {
      const matches = row.matches as unknown as { duration: number };
      const duration = matches.duration;
      const score: BestScore = {
        id: row.id,
        user_id: row.user_id,
        wpm: Number(row.wpm),
        rawWpm: Number(row.raw_wpm),
        accuracy: Number(row.accuracy),
        duration,
        created_at: row.created_at,
        source: "multiplayer",
      };

      const existing = bestByDuration.get(duration);
      if (!existing || score.wpm > existing.wpm) {
        bestByDuration.set(duration, score);
      }
    }

    multiplayerScores = Array.from(bestByDuration.values());
  }

  // Combine and keep best score per duration (regardless of source)
  const allScores = [...singleplayerScores, ...multiplayerScores];
  const bestByDuration = new Map<number, BestScore>();

  for (const score of allScores) {
    const existing = bestByDuration.get(score.duration);
    if (!existing || score.wpm > existing.wpm) {
      bestByDuration.set(score.duration, score);
    }
  }

  return Array.from(bestByDuration.values());
}
