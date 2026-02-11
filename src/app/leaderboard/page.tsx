import LeaderboardClient from "@/components/leaderboard/LeaderboardClient";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Leaderboard | KeyRush",
  description:
    "See the top typists across daily, weekly, and all-time leaderboards.",
  path: "/leaderboard",
});

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
