import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  // Get user profile with username
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, created_at, elo, rank_tier, matches_played, wins, losses, total_xp, level, friend_code")
    .eq("id", user.id)
    .single();
      
  return { ...user, profile };
}
