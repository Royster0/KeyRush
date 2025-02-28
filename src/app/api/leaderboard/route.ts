import { NextResponse } from "next/server";
import { getAllLeaderboardDurations, LeaderboardTimeframe } from "@/app/leaderboard/actions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let timeframe = searchParams.get("timeframe") as LeaderboardTimeframe;
    
    // Validate timeframe
    const validTimeframes: LeaderboardTimeframe[] = ["daily", "weekly", "all"];
    if (!timeframe || !validTimeframes.includes(timeframe)) {
      timeframe = "all";
    }
    
    const data = await getAllLeaderboardDurations(timeframe);
    
    // Log the response size
    console.log(`Leaderboard API returning data for timeframe: ${timeframe}, with ${data.length} duration groups`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in leaderboard API:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard data" }, { status: 500 });
  }
}