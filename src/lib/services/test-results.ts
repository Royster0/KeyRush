import { createClient } from "@/utils/supabase/server";
import { TestResults } from "@/types/game.types";

export interface DbTestResult {
  id: string;
  user_id: string;
  wpm: number;
  raw_wpm: number;
  accuracy: number;
  duration: number;
  created_at: string;
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

  if (error) {
    console.error("Error saving test result:", error);
    return null;
  }

  return mapDbToModel(data as DbTestResult);
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
    
  if (error) {
    console.error("Error fetching test results:", error);
    return [];
  }
  
  return (testResults as DbTestResult[]).map(mapDbToModel);
}

export async function getUserBestScores(): Promise<TestResults[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }
  
  const { data, error } = await supabase
    .rpc('get_user_best_scores_full', { target_user_id: user.id });
      
  if (error) {
    console.error("Error fetching best scores:", error);
    return [];
  }
  
  return ((data as DbTestResult[]) || []).map(mapDbToModel);
}
