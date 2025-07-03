import React, { Suspense } from "react";
import { getUser, getUserTestResults, getUserBestScores, getUserLeaderboardRankings } from "@/app/actions";
import ProfileOverview from "@/components/profile/ProfileOverview";
import BestScores from "@/components/profile/BestScores";
import ActivityGraph from "@/components/profile/ActivityGraph";
import WpmChart from "@/components/profile/WpmChart";
import LoadingProfile from "@/components/profile/LoadingProfile";
import { formatDate } from "@/lib/utils";

const ProfileContent = async () => {
  const user = await getUser();
  const testResults = await getUserTestResults();
  const bestScores = await getUserBestScores();
  const leaderboardRankings = await getUserLeaderboardRankings();
  
  const joinDate = user?.profile?.created_at 
    ? formatDate(new Date(user.profile.created_at))
    : "N/A";
  
  return (
    <div className="container mx-auto max-w-5xl p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <ProfileOverview 
        username={user?.profile?.username || "User"} 
        joinDate={joinDate}
        testsCompleted={testResults.length}
        leaderboardRankings={leaderboardRankings}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BestScores bestScores={bestScores} />
        <ActivityGraph testResults={testResults} />
      </div>
      <WpmChart testResults={testResults} />
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
