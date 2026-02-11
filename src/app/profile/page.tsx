import React, { Suspense } from "react";
import {
  getUser,
  getUserTestResults,
  getUserBestScores,
  getUserLeaderboardRankings,
  getActiveBanner,
} from "@/app/actions";
import ProfileOverview from "@/components/profile/ProfileOverview";
import BestScores from "@/components/profile/BestScores";
import ActivityGraph from "@/components/profile/ActivityGraph";
import WpmChart from "@/components/profile/WpmChart";
import LoadingProfile from "@/components/profile/LoadingProfile";
import RankedStatsCard from "@/components/profile/RankedStatsCard";
import XpProgressCard from "@/components/profile/XpProgressCard";
import LeaderboardRankings from "@/components/profile/LeaderboardRankings";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Your Profile | KeyRush",
  description:
    "An overview of your typing stats, rank, and leaderboard status.",
  path: "/profile",
  noIndex: true,
});

const ProfileContent = async () => {
  const user = await getUser();
  const [testResults, bestScores, leaderboardRankings] = await Promise.all([
    getUserTestResults(),
    getUserBestScores(),
    getUserLeaderboardRankings(),
  ]);
  const banner = user ? await getActiveBanner(user.id) : null;

  const joinDate = user?.profile?.created_at
    ? formatDate(new Date(user.profile.created_at))
    : "N/A";

  return (
    <div className="relative py-10 overflow-x-hidden">
      <div className="container relative z-10 mx-auto max-w-6xl px-4 space-y-0">
        <ProfileOverview
          username={user?.profile?.username || "User"}
          joinDate={joinDate}
          totalXp={user?.profile?.total_xp ?? 0}
          banner={banner}
          rankTier={user?.profile?.rank_tier ?? null}
        />

        <RankedStatsCard profile={user?.profile ?? null} />

        <BestScores bestScores={bestScores} />

        <LeaderboardRankings leaderboardRankings={leaderboardRankings} />

        <XpProgressCard totalXp={user?.profile?.total_xp ?? 0} />

        <ActivityGraph testResults={testResults} />

        <WpmChart testResults={testResults} />
      </div>
    </div>
  );
};

const ProfilePage = () => {
  return (
    <Suspense fallback={<LoadingProfile />}>
      <ProfileContent />
    </Suspense>
  );
};

export default ProfilePage;
