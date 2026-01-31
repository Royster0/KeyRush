import LeaderboardClient from "@/components/leaderboard/LeaderboardClient";
import { getUser } from "@/app/actions";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Leaderboard | KeyRush",
  description:
    "See the top typists across daily, weekly, and all-time leaderboards.",
  path: "/leaderboard",
});

export default async function LeaderboardPage() {
  const user = await getUser();
  return <LeaderboardClient userId={user?.id} />;
}
