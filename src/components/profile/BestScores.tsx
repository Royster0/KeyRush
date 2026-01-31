"use client";

import React from "react";
import { Flame, Clock, User, Users, Zap } from "lucide-react";
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
  const highestWpm =
    sortedScores.length > 0 ? Math.max(...sortedScores.map((s) => s.wpm)) : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.25 }}
      className="relative border-b border-primary/30 py-10"
    >
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Flame className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-xl font-mono uppercase tracking-[0.15em]">
            Personal Bests
          </h3>
        </div>
        {highestWpm > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>
              Peak:{" "}
              <span className="font-semibold text-primary">
                {Math.round(highestWpm)} WPM
              </span>
            </span>
          </div>
        )}
      </div>

      {sortedScores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl border border-border/40 bg-muted/30 flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">
            No test results yet
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Complete some typing tests to see your best scores
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedScores.map((score, index) => {
              const rawWpm = score.rawWpm || score.raw_wpm || 0;
              const isTopScore = score.wpm === highestWpm;
              return (
                <motion.div
                  key={score.duration}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
                  className={`relative rounded-xl border p-5 transition-colors ${
                    isTopScore
                      ? "border-primary/10"
                      : "border-border/60 bg-muted/20 hover:border-border"
                  }`}
                >
                  {isTopScore && (
                    <div className="absolute top-3 right-3">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-sm font-mono tracking-wider px-2 py-0.5 rounded-md ${
                        isTopScore
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {score.duration} s
                    </span>
                    {score.source && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        {score.source === "multiplayer" ? (
                          <Users className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className={`text-4xl font-bold tabular-nums ${
                        isTopScore ? "text-primary" : ""
                      }`}
                    >
                      {Math.round(score.wpm)}
                    </span>
                    <span className="text-sm text-muted-foreground">WPM</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-3">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      {Math.round(rawWpm)} raw
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                      {Math.round(score.accuracy)}% acc
                    </span>
                  </div>
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
