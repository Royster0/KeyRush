"use server";

import { TestResults } from "@/types/game.types";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";

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
    toast.error("Error retrieving user from database");
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

export async function getUserAndUsername() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    toast.error("Error retrieving user");
  }

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user?.id)
      .single();

    if (profileError) {
      toast.error("Error retrieving user profile");
    }

    return {
      ...user,
      username: profile?.username,
    };
  }

  return null;
}

export async function getUserTypingResults() {}
