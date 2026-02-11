import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export const getUser = cache(async () => {
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
    .select("username, created_at, elo, rank_tier, matches_played, wins, losses, total_xp, level, friend_code, active_banner_slot, peak_rank_tier")
    .eq("id", user.id)
    .single();

  return { ...user, profile };
});

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
  active_banner_slot?: number | null;
  peak_rank_tier?: string | null;
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
      "id, username, created_at, elo, rank_tier, matches_played, wins, losses, total_xp, level, active_banner_slot, peak_rank_tier"
    )
    .ilike("username", cleanedUsername)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as PublicProfile;
}

export async function getPublicProfileUsernames(): Promise<string[]> {
  const supabase = await createClient();
  const pageSize = 1000;
  let from = 0;
  let to = pageSize - 1;
  const usernames: string[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .not("username", "is", null)
      .neq("username", "")
      .range(from, to);

    if (error || !data) {
      break;
    }

    for (const row of data) {
      if (row.username) {
        usernames.push(row.username);
      }
    }

    if (data.length < pageSize) {
      break;
    }

    from += pageSize;
    to += pageSize;
  }

  return usernames;
}
