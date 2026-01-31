"use client";

import React from "react";
import { Flame, Clock, User, Users } from "lucide-react";
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
    source?: "singleplayer" | "multiplayer";
  }>;
}

const BestScores: React.FC<BestScoreProps> = ({ bestScores }) => {
  const sortedScores = [...bestScores].sort((a, b) => a.duration - b.duration);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.25 }}
      className="relative border-b border-primary/40 py-10"
    >
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <Flame className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-2xl font-mono uppercase tracking-[0.2em]">
              Best Scores
            </h3>
          </div>
        </div>
      </div>

      {sortedScores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full border border-border/60 flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No test results yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Complete some typing tests to see your best scores
          </p>
        </div>
      ) : (
        <div className="relative mt-8">
          <div className="grid snap-x snap-mandatory grid-flow-col auto-cols-[minmax(220px,1fr)] gap-8 overflow-x-auto pb-6">
            {sortedScores.map((score, index) => {
              const rawWpm = score.rawWpm || score.raw_wpm || 0;
              return (
                <motion.div
                  key={score.duration}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
                  className="relative border p-4 border-r-4 rounded-lg snap-start pl-6"
                >
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">
                    {score.duration} sec
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-semibold">
                      {Math.round(score.wpm)}
                    </span>
                    <span className="text-sm text-muted-foreground">wpm</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Raw {Math.round(rawWpm)} wpm
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span>Accuracy {Math.round(score.accuracy)}%</span>
                    <span>
                      {score.created_at
                        ? new Date(score.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "-"}
                    </span>
                  </div>
                  {score.source && (
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                      {score.source === "multiplayer" ? (
                        <Users className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      {score.source === "multiplayer" ? "Multiplayer" : "Solo"}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default BestScores;
