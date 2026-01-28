import { NextResponse } from "next/server";
import { getRankedLeaderboard } from "@/lib/services/leaderboard";

export async function GET() {
  try {
    const data = await getRankedLeaderboard();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch ranked leaderboard" },
      { status: 500 }
    );
  }
}
