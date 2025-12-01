"use server";

import { TestResults } from "@/types/game.types";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/auth/login");
}

export async function saveTestResult(result: Omit<TestResults, "user_id">) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // console.error("Error retrieving user from database");
    return null;
  }

  const { data, error } = await supabase
    .from("test_results")
    .insert([
      {
        user_id: user?.id,
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
    // toast.error("Error in saving test result");
    console.log(error);
  }

  return data;
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  
  // Get user profile with username
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, created_at")
      .eq("id", user.id)
      .single();
      
    return { ...user, profile };
  }

  return user;
}

export async function getUserTestResults() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
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
  
  return testResults;
}

export async function getUserBestScores() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }
  
  // Get best WPM for each duration
  const durations = [5, 15, 30, 60, 120];
  const bestScores = [];
  
  for (const duration of durations) {
    const { data, error } = await supabase
      .from("test_results")
      .select("*")
      .eq("user_id", user.id)
      .eq("duration", duration)
      .order("wpm", { ascending: false })
      .limit(1);
      
    if (!error && data.length > 0) {
      bestScores.push(data[0]);
    }
  }
  
  return bestScores;
}

export async function getBestScoresSafe() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }
  
  // Get best WPM for each duration
  const durations = [5, 15, 30, 60, 120];
  const bestScores = [];
  
  for (const duration of durations) {
    const { data, error } = await supabase
      .from("test_results")
      .select("*")
      .eq("user_id", user.id)
      .eq("duration", duration)
      .order("wpm", { ascending: false })
      .limit(1);
      
    if (!error && data.length > 0) {
      bestScores.push(data[0]);
    }
  }
  
  return bestScores;
}

export async function getUserLeaderboardRankings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }
  
  const durations = [5, 15, 30, 60, 120];
  const rankings = [];
  
  for (const duration of durations) {
    // Get all scores for this duration
    const { data: allScores, error } = await supabase
      .from("test_results")
      .select("user_id, wpm")
      .eq("duration", duration)
      .order("wpm", { ascending: false });
      
    if (error || !allScores.length) {
      rankings.push({ duration, rank: "N/A", totalUsers: 0 });
      continue;
    }
    
    // Group by user and get max wpm for each user
    const userBestScores = allScores.reduce<Record<string, number>>((acc, score) => {
      if (!acc[score.user_id] || acc[score.user_id] < score.wpm) {
        acc[score.user_id] = score.wpm;
      }
      return acc;
    }, {});
    
    // Convert to array and sort
    const sortedUsers = Object.entries(userBestScores)
      .map(([userId, wpm]) => ({ userId, wpm }))
      .sort((a, b) => b.wpm - a.wpm);
    
    // Find user's rank
    const userIndex = sortedUsers.findIndex(item => item.userId === user.id);
    const rank = userIndex !== -1 ? userIndex + 1 : "N/A";
    
    rankings.push({
      duration,
      rank,
      totalUsers: sortedUsers.length
    });
  }
  
  return rankings;
}
