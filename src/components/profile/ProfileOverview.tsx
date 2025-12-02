"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Award, Trophy } from "lucide-react";
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
    <Card className="w-full border-none bg-muted/40 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold">Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Stats Column */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-background/50 transition-colors">
              <div className="p-2 bg-primary/10 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                <p className="text-xl font-bold">{username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-background/50 transition-colors">
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-xl font-bold">{joinDate}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-background/50 transition-colors">
              <div className="p-2 bg-primary/10 rounded-full">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tests Completed</p>
                <p className="text-xl font-bold">{testsCompleted}</p>
              </div>
            </div>
          </div>

          {/* Leaderboard Rankings Column */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="size-5 text-primary-background" />
              Leaderboard Rankings
            </h3>

            {leaderboardRankings.length === 0 ? (
              <p className="text-muted-foreground">No rankings yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {leaderboardRankings.map((ranking) => (
                  <div
                    key={ranking.duration}
                    className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 hover:bg-background/30 px-2 rounded-md transition-colors"
                  >
                    <div className="flex items-baseline gap-4">
                      <h4 className="text-xl font-bold text-primary w-16">
                        {formatDuration(ranking.duration)}
                      </h4>
                      <div className="flex items-baseline gap-1">
                        {typeof ranking.rank === 'number' ? (
                          <>
                            <span className="text-2xl font-bold">#{ranking.rank}</span>
                            <span className="text-sm text-muted-foreground">
                              / {ranking.totalUsers}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>

                    {typeof ranking.rank === 'number' && (
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          Top {Math.round((ranking.rank / ranking.totalUsers) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileOverview;