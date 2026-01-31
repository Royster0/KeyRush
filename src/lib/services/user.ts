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

export type PublicProfile = {
  id: string;
  username: string;
  created_at: string;
  elo?: number | null;
  rank_tier?: string | null;
  matches_played?: number | null;
  wins?: number | null;
  losses?: number | null;
  total_xp?: number | null;
  level?: number | null;
};

export async function getProfileByUsername(
  username: string
): Promise<PublicProfile | null> {
  const supabase = await createClient();
  if (!username) {
    return null;
  }

  const cleanedUsername = username.trim();

  if (!cleanedUsername) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, username, created_at, elo, rank_tier, matches_played, wins, losses, total_xp, level"
    )
    .ilike("username", cleanedUsername)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as PublicProfile;
}
