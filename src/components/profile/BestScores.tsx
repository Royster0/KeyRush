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
    <Card className="h-full border-none bg-muted/40 shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Your Best Scores</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedScores.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No test results yet. Complete some typing tests to see your best scores!
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedScores.map((score) => {
              const rawWpm = score.rawWpm || score.raw_wpm || 0;
              return (
                <div
                  key={score.duration}
                  className="group flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-baseline gap-4">
                    <h3 className="text-2xl font-bold text-primary w-16">
                      {score.duration}s
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold group-hover:hidden">{Math.round(score.wpm)}</span>
                      <span className="text-3xl font-bold hidden group-hover:inline">{score.wpm.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground font-medium">WPM</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                      <p className="text-lg font-semibold">{Math.round(score.accuracy)}%</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-muted-foreground">Raw</p>
                      <p className="text-lg font-semibold group-hover:hidden">{Math.round(rawWpm)}</p>
                      <p className="text-lg font-semibold hidden group-hover:inline">{rawWpm.toFixed(2)}</p>
                    </div>
                    <div className="text-xs text-muted-foreground text-right min-w-[80px]">
                      {score.created_at
                        ? new Date(score.created_at).toLocaleDateString()
                        : "N/A"}
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