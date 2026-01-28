"use client";

import React from "react";
import { Flame, Clock } from "lucide-react";
import { motion } from "motion/react";

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
  const sortedScores = [...bestScores].sort((a, b) => a.duration - b.duration);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="h-full rounded-2xl bg-muted/30 border border-border/30 p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-xl bg-primary/10">
          <Flame className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Best Scores</h3>
      </div>

      {sortedScores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No test results yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Complete some typing tests to see your best scores
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedScores.map((score, index) => {
            const rawWpm = score.rawWpm || score.raw_wpm || 0;
            return (
              <motion.div
                key={score.duration}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                className="group relative rounded-xl bg-background/40 border border-border/50 p-4 hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Duration Badge */}
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-primary">{score.duration}</span>
                      <span className="text-[10px] text-primary/70 -mt-1">sec</span>
                    </div>

                    {/* WPM */}
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold group-hover:text-primary transition-colors">
                          {Math.round(score.wpm)}
                        </span>
                        <span className="text-sm text-muted-foreground">wpm</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Raw: {Math.round(rawWpm)} wpm
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-lg font-semibold">{Math.round(score.accuracy)}%</p>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {score.created_at
                        ? new Date(score.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </div>
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default BestScores;
