import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { calculateXpGain } from "@/lib/xp";
import { XpAwardResultSchema, mapDbXpAwardToModel, type XpAwardResult } from "@/lib/schemas/xp";
import * as badgeServices from "@/lib/services/badges";
import type { BadgeNotification } from "@/types/badges.types";

type EloUpdateResult = {
  previous_elo: number;
  new_elo: number;
  delta: number;
  rank_tier: string;
  matches_played: number;
  k_factor: number;
  expected_score: number;
  margin_bonus: number;
  peak_rank_tier: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const {
    partyMatchId,
    duration,
    text,
    startAt,
    endAt,
    player1Id,
    player2Id,
    winnerId,
    stats,
    isRanked,
    opponentId,
    result, // 0 = loss, 0.5 = draw, 1 = win
  } = payload ?? {};

  if (!partyMatchId || !player1Id || !player2Id || !stats?.userId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (stats.userId !== user.id || (user.id !== player1Id && user.id !== player2Id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Upsert match record
  const { data: matchRow, error: matchError } = await supabase
    .from("matches")
    .upsert(
      {
        party_match_id: partyMatchId,
        player1_id: player1Id,
        player2_id: player2Id,
        winner_id: winnerId,
        duration,
        is_ranked: isRanked ?? false,
        text,
        started_at: startAt ? new Date(startAt).toISOString() : null,
        ended_at: endAt ? new Date(endAt).toISOString() : null,
      },
      { onConflict: "party_match_id" }
    )
    .select("id")
    .single();

  if (matchError || !matchRow) {
    return NextResponse.json({ error: matchError?.message ?? "Match error" }, { status: 500 });
  }

  // Upsert match results (without elo data - that's set by the RPC)
  const { error: resultError } = await supabase
    .from("match_results")
    .upsert(
      {
        match_id: matchRow.id,
        user_id: stats.userId,
        wpm: stats.wpm,
        raw_wpm: stats.rawWpm,
        accuracy: stats.accuracy,
        progress: stats.progress,
        left_match: stats.leftMatch ?? false,
      },
      { onConflict: "match_id,user_id" }
    );

  if (resultError) {
    return NextResponse.json({ error: resultError.message }, { status: 500 });
  }

  // For ranked matches, calculate Elo server-side
  let eloResult: EloUpdateResult | null = null;
  if (isRanked && opponentId && result !== undefined) {
    const playerWpm = Number.isFinite(stats.wpm) ? Math.round(stats.wpm) : 0;
    const opponentWpm = Number.isFinite(stats.opponentWpm)
      ? Math.round(stats.opponentWpm)
      : 0;
    const { data, error: eloError } = await supabase.rpc("calculate_elo_update", {
      p_user_id: user.id,
      p_opponent_id: opponentId,
      p_match_id: matchRow.id,
      p_result: result,
      p_player_wpm: playerWpm,
      p_opponent_wpm: opponentWpm,
    });

    if (eloError) {
      console.error("Elo calculation error:", eloError);
      // Don't fail the request, just log the error
    } else {
      eloResult = data as EloUpdateResult;
    }
  }

  // Award XP for the match
  let xpResult: XpAwardResult | null = null;
  const activeTypingSeconds = (duration || 30) * (stats.accuracy / 100);
  const wpmMargin = result === 1 && stats.opponentWpm
    ? Math.max(0, stats.wpm - stats.opponentWpm)
    : 0;

  const xpAmount = calculateXpGain({
    activeTypingSeconds,
    accuracy: stats.accuracy,
    isMultiplayer: true,
    wpmMargin,
  });

  if (xpAmount > 0) {
    const { data: xpData, error: xpError } = await supabase.rpc("award_xp", {
      p_user_id: user.id,
      p_xp_amount: xpAmount,
    });

    if (xpError) {
      console.error("XP award error:", xpError);
      // Don't fail the request, just log the error
    } else {
      const row = Array.isArray(xpData) ? xpData[0] : xpData;
      if (row) {
        const parsed = XpAwardResultSchema.safeParse(row);
        if (parsed.success) {
          xpResult = mapDbXpAwardToModel(parsed.data);
        }
      }
    }
  }

  // Check for badges
  let badges: BadgeNotification[] = [];
  try {
    // Get user stats for badge context
    const userStats = await badgeServices.getUserStatsForBadges();

    badges = await badgeServices.checkAndAwardBadges({
      userId: user.id,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      duration,
      isMultiplayer: true,
      isWin: result === 1,
      matchesPlayed: eloResult?.matches_played ?? userStats.matchesPlayed,
      newLevel: xpResult?.newLevel,
      previousLevel: xpResult?.previousLevel,
      friendCount: userStats.friendCount,
      totalTests: userStats.totalTests,
    });
  } catch (badgeError) {
    console.error("Badge check error:", badgeError);
    // Don't fail the request, just log the error
  }

  return NextResponse.json({
    ok: true,
    matchId: matchRow.id,
    elo: eloResult,
    xp: xpResult,
    badges,
  });
}
