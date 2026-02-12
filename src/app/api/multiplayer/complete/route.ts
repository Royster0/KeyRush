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

type CompletionAcquireResult = {
  acquired: boolean;
  status: "pending" | "completed";
};

type CompletionAcquireOutcome = {
  available: boolean;
  acquired: boolean;
  status: "pending" | "completed";
};

const COMPLETION_LOCK_STALE_SECONDS = 120;

function isMissingFunctionError(error: {
  message?: string;
  details?: string;
  hint?: string;
}) {
  const combined = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`;
  return combined.includes("acquire_multiplayer_completion");
}

async function acquireCompletionLock(
  supabase: Awaited<ReturnType<typeof createClient>>,
  matchId: string,
  userId: string
): Promise<CompletionAcquireOutcome> {
  const { data, error } = await supabase.rpc("acquire_multiplayer_completion", {
    p_match_id: matchId,
    p_user_id: userId,
    p_stale_after_seconds: COMPLETION_LOCK_STALE_SECONDS,
  });

  if (error) {
    if (isMissingFunctionError(error)) {
      console.warn(
        "acquire_multiplayer_completion RPC missing; running multiplayer completion without idempotency lock."
      );
      return {
        available: false,
        acquired: true,
        status: "pending",
      };
    }
    throw error;
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    | CompletionAcquireResult
    | null
    | undefined;

  return {
    available: true,
    acquired: Boolean(row?.acquired),
    status: row?.status === "completed" ? "completed" : "pending",
  };
}

async function markCompletionProcessed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  matchId: string,
  userId: string,
  xpAwarded: number
) {
  const { error } = await supabase.rpc("complete_multiplayer_completion", {
    p_match_id: matchId,
    p_user_id: userId,
    p_xp_awarded: xpAwarded,
  });

  if (error) {
    console.error("Completion finalize error:", error);
  }
}

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
  const rankedMatch = Boolean(isRanked);

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
        is_ranked: rankedMatch,
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

  let completionLock: CompletionAcquireOutcome;
  try {
    completionLock = await acquireCompletionLock(supabase, matchRow.id, user.id);
  } catch (error) {
    console.error("Completion lock error:", error);
    return NextResponse.json({ error: "Could not acquire completion lock" }, { status: 500 });
  }

  if (!completionLock.acquired) {
    return NextResponse.json({
      ok: true,
      deduped: true,
      inProgress: completionLock.status === "pending",
      matchId: matchRow.id,
      elo: null,
      xp: null,
      badges: [],
    });
  }

  const parsedPlayerWpm = Number(stats.wpm);
  const parsedOpponentWpm = Number(stats.opponentWpm);
  const playerWpm = Number.isFinite(parsedPlayerWpm) ? Math.max(0, parsedPlayerWpm) : 0;
  const opponentWpm = Number.isFinite(parsedOpponentWpm)
    ? Math.max(0, parsedOpponentWpm)
    : 0;

  // For ranked matches, calculate Elo server-side
  let eloResult: EloUpdateResult | null = null;
  if (rankedMatch && opponentId && result !== undefined) {
    const { data, error: eloError } = await supabase.rpc("calculate_elo_update", {
      p_user_id: user.id,
      p_opponent_id: opponentId,
      p_match_id: matchRow.id,
      p_result: result,
      p_player_wpm: Math.round(playerWpm),
      p_opponent_wpm: Math.round(opponentWpm),
    });

    if (eloError) {
      console.error("Elo calculation error:", eloError);
    } else {
      eloResult = data as EloUpdateResult;
    }
  }

  // Award XP for the match
  let xpResult: XpAwardResult | null = null;
  const activeTypingSeconds = (duration || 30) * (stats.accuracy / 100);
  const wpmMargin = result === 1 && opponentWpm > 0
    ? Math.max(0, playerWpm - opponentWpm)
    : 0;

  const xpAmount = calculateXpGain({
    activeTypingSeconds,
    accuracy: stats.accuracy,
    wpm: playerWpm,
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

  if (completionLock.available) {
    await markCompletionProcessed(
      supabase,
      matchRow.id,
      user.id,
      xpResult?.xpGained ?? 0
    );
  }

  return NextResponse.json({
    ok: true,
    matchId: matchRow.id,
    elo: eloResult,
    xp: xpResult,
    badges,
  });
}
