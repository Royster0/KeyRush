import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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
    profileUpdate,
  } = payload ?? {};

  if (!partyMatchId || !player1Id || !player2Id || !stats?.userId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (stats.userId !== user.id || (user.id !== player1Id && user.id !== player2Id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: matchRow, error: matchError } = await supabase
    .from("matches")
    .upsert(
      {
        party_match_id: partyMatchId,
        player1_id: player1Id,
        player2_id: player2Id,
        winner_id: winnerId,
        duration,
        mode: duration,
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
        rank_tier: stats.rankTier,
        elo_before: stats.eloBefore,
        elo_after: stats.eloAfter,
      },
      { onConflict: "match_id,user_id" }
    );

  if (resultError) {
    return NextResponse.json({ error: resultError.message }, { status: 500 });
  }

  if (profileUpdate) {
    await supabase
      .from("profiles")
      .update({
        elo: profileUpdate.elo,
        rank_tier: profileUpdate.rank_tier,
        matches_played: profileUpdate.matches_played,
        wins: profileUpdate.wins,
        losses: profileUpdate.losses,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  }

  return NextResponse.json({ ok: true });
}
