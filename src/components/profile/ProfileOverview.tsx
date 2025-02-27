"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Award } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface ProfileOverviewProps {
  username: string;
  joinDate: string;
  testsCompleted: number;
  leaderboardRankings: Array<{
    duration: number;
    rank: number | string;
    totalUsers: number;
  }>;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  username,
  joinDate,
  testsCompleted,
  leaderboardRankings,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Profile Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="text-xl font-semibold">{username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-xl font-semibold">{joinDate}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Award className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tests Completed</p>
                <p className="text-xl font-semibold">{testsCompleted}</p>
              </div>
            </div>
          </div>
          
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-3">Leaderboard Rankings</h3>
            <div className="grid grid-cols-5 gap-3">
              {leaderboardRankings.map((ranking) => (
                <div key={ranking.duration} className="p-3 border rounded-lg text-center">
                  <h4 className="text-sm text-muted-foreground mb-1">
                    {formatDuration(ranking.duration)}
                  </h4>
                  <p className="text-lg font-bold">
                    {typeof ranking.rank === 'number' ? (
                      <>
                        #{ranking.rank}
                        <span className="text-xs text-muted-foreground"> / {ranking.totalUsers}</span>
                      </>
                    ) : (
                      ranking.rank
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileOverview;