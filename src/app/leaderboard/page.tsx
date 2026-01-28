import LeaderboardClient from "@/components/leaderboard/LeaderboardClient";
import { getUser } from "@/app/actions";

export default async function LeaderboardPage() {
  const user = await getUser();
  return <LeaderboardClient userId={user?.id} />;
}
