"use server";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import {
  MatchResultRowSchema,
  OpponentResultSchema,
} from "@/lib/schemas/match-history";
import type {
  MatchHistoryEntry,
  MatchHistoryResponse,
} from "@/types/match-history.types";

const PAGE_SIZE = 10;

export async function getMatchHistory(
  page: number = 0
): Promise<MatchHistoryResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { matches: [], hasMore: false, total: 0 };
  }

  // Get total count for pagination
  const { count } = await supabase
    .from("match_results")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const total = count ?? 0;

  // Fetch user's match results with match details
  const { data: matchResults, error } = await supabase
    .from("match_results")
    .select(
      `
      id,
      match_id,
      user_id,
      wpm,
      raw_wpm,
      accuracy,
      progress,
      left_match,
      elo_before,
      elo_after,
      created_at,
      matches!inner (
        id,
        player1_id,
        player2_id,
        winner_id,
        duration,
        is_ranked,
        ended_at
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (error || !matchResults) {
    console.error("Error fetching match history:", error);
    return { matches: [], hasMore: false, total: 0 };
  }

  const parsed = z.array(MatchResultRowSchema).safeParse(matchResults);
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    return { matches: [], hasMore: false, total: 0 };
  }

  // Get all match IDs to fetch opponent data
  const matchIds = parsed.data.map((r) => r.match_id);

  // Fetch opponent results for all matches in one query
  const { data: opponentResults } = await supabase
    .from("match_results")
    .select(
      `
      user_id,
      wpm,
      raw_wpm,
      accuracy,
      match_id,
      profiles!inner (
        username
      )
    `
    )
    .in("match_id", matchIds)
    .neq("user_id", user.id);

  // Create a map of match_id -> opponent data
  const opponentMap = new Map<
    string,
    { wpm: number; rawWpm: number | null; accuracy: number; username: string; userId: string }
  >();

  if (opponentResults) {
    const opponentParsed = z
      .array(
        OpponentResultSchema.extend({
          match_id: z.string(),
        })
      )
      .safeParse(opponentResults);

    if (opponentParsed.success) {
      for (const opp of opponentParsed.data) {
        opponentMap.set(opp.match_id, {
          wpm: opp.wpm,
          rawWpm: opp.raw_wpm,
          accuracy: opp.accuracy,
          username: opp.profiles.username ?? "Unknown",
          userId: opp.user_id,
        });
      }
    }
  }

  // Map results to match history entries
  const matches: MatchHistoryEntry[] = parsed.data.map((row) => {
    const matchData = row.matches as unknown as {
      id: string;
      player1_id: string;
      player2_id: string;
      winner_id: string | null;
      duration: number;
      is_ranked: boolean | null;
      ended_at: string | null;
    };

    const opponent = opponentMap.get(row.match_id) ?? {
      wpm: 0,
      rawWpm: null,
      accuracy: 0,
      username: "Unknown",
      userId: "",
    };

    let result: "win" | "loss" | "draw";
    if (matchData.winner_id === null) {
      result = "draw";
    } else if (matchData.winner_id === user.id) {
      result = "win";
    } else {
      result = "loss";
    }

    // Calculate ELO change for ranked matches
    const eloChange =
      row.elo_before !== null && row.elo_after !== null
        ? row.elo_after - row.elo_before
        : null;

    return {
      id: row.id,
      matchId: row.match_id,
      date: matchData.ended_at ?? row.created_at,
      duration: matchData.duration,
      // Default to "ranked" for backward compatibility (old matches have null)
      mode: matchData.is_ranked === false ? "unranked" : "ranked",
      result,
      userWpm: row.wpm,
      userRawWpm: row.raw_wpm,
      userAccuracy: row.accuracy,
      userProgress: row.progress,
      eloChange,
      opponentWpm: opponent.wpm,
      opponentRawWpm: opponent.rawWpm,
      opponentAccuracy: opponent.accuracy,
      opponentName: opponent.username,
      opponentId: opponent.userId,
    };
  });

  const hasMore = (page + 1) * PAGE_SIZE < total;

  return { matches, hasMore, total };
}
