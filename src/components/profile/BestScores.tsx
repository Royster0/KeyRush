"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils";

interface BestScoreProps {
  bestScores: Array<{
    id?: string;
    user_id: string;
    wpm: number;
    rawWpm?: number;
    raw_wpm?: number;
    accuracy: number;
    duration: number;
    created_at?: string;
  }>;
}

const BestScores: React.FC<BestScoreProps> = ({ bestScores }) => {
  // Sort scores by duration for consistent display
  const sortedScores = [...bestScores].sort((a, b) => a.duration - b.duration);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">Your Best Scores</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedScores.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No test results yet. Complete some typing tests to see your best scores!
          </p>
        ) : (
          <div className="space-y-4">
            {sortedScores.map((score) => {
              const rawWpm = score.rawWpm || score.raw_wpm || 0;
              return (
                <div
                  key={score.duration}
                  className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{formatDuration(score.duration)} Test</h3>
                    <span className="text-sm text-muted-foreground">
                      {score.created_at
                        ? new Date(score.created_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-primary/10 rounded">
                      <p className="text-sm text-muted-foreground">WPM</p>
                      <p className="text-2xl font-bold">{Math.round(score.wpm)}</p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded">
                      <p className="text-sm text-muted-foreground">Raw WPM</p>
                      <p className="text-2xl font-bold">{Math.round(rawWpm)}</p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded">
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                      <p className="text-2xl font-bold">{Math.round(score.accuracy)}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BestScores;