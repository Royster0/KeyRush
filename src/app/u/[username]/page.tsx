import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublicProfile,
  getPublicTestResults,
  getPublicBestScores,
  getPublicLeaderboardRankings,
  getUser,
} from "@/app/actions";
import ProfileOverview from "@/components/profile/ProfileOverview";
import BestScores from "@/components/profile/BestScores";
import ActivityGraph from "@/components/profile/ActivityGraph";
import WpmChart from "@/components/profile/WpmChart";
import LoadingProfile from "@/components/profile/LoadingProfile";
import RankedStatsCard from "@/components/profile/RankedStatsCard";
import LeaderboardRankings from "@/components/profile/LeaderboardRankings";
import { formatDate } from "@/lib/utils";

type PublicProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

function getSiteUrl() {
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl && process.env.NEXT_PUBLIC_VERCEL_URL) {
    siteUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  } else if (!siteUrl && process.env.VERCEL_URL) {
    siteUrl = `https://${process.env.VERCEL_URL}`;
  }

  if (!siteUrl) {
    siteUrl = "http://localhost:3000";
  }

  return siteUrl;
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    return {
      title: "Profile Not Found | KeyRush",
      description: "This user profile does not exist.",
    };
  }

  const displayName = profile.username || username;
  const rankTier = profile.rank_tier ?? "Unranked";
  const level = profile.level ?? 1;
  const title = `${displayName} | KeyRush`;
  const description = `View ${displayName}'s typing stats. Level ${level}, ${rankTier}.`;
  const url = `${getSiteUrl()}/u/${encodeURIComponent(displayName)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

const PublicProfileContent = async ({ username }: { username: string }) => {
  const profile = await getPublicProfile(username);
  if (!profile) {
    notFound();
  }

  const [testResults, bestScores, leaderboardRankings, currentUser] =
    await Promise.all([
      getPublicTestResults(profile.id),
      getPublicBestScores(profile.id),
      getPublicLeaderboardRankings(profile.id),
      getUser(),
    ]);

  const joinDate = profile.created_at
    ? formatDate(new Date(profile.created_at))
    : "N/A";
  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="relative py-10 overflow-x-hidden">
      <div className="container relative z-10 mx-auto max-w-6xl px-4 space-y-0">
        <ProfileOverview
          username={profile.username || "User"}
          joinDate={joinDate}
          testsCompleted={testResults.length}
          leaderboardRankings={leaderboardRankings}
          isOwnProfile={isOwnProfile}
        />

        <RankedStatsCard profile={profile} />

        <BestScores bestScores={bestScores} />

        <LeaderboardRankings leaderboardRankings={leaderboardRankings} />

        <ActivityGraph testResults={testResults} />

        <WpmChart testResults={testResults} />
      </div>
    </div>
  );
};

const PublicProfilePage = async ({ params }: PublicProfilePageProps) => {
  const { username } = await params;
  return (
    <Suspense fallback={<LoadingProfile />}>
      <PublicProfileContent username={username} />
    </Suspense>
  );
};

export default PublicProfilePage;
