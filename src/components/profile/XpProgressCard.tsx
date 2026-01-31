"use client";

import React from "react";
import { Sparkles, Zap, Star } from "lucide-react";
import { motion } from "motion/react";
import { getLevelProgress } from "@/lib/xp";

interface XpProgressCardProps {
  totalXp: number;
}

const XpProgressCard: React.FC<XpProgressCardProps> = ({ totalXp }) => {
  const progress = getLevelProgress(totalXp);
  const level = progress.level;
  const xpInCurrentLevel = Math.round(progress.currentLevelXp);
  const xpForNextLevel = progress.nextLevelXp;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3 }}
      className="relative border-b border-primary/30 py-10"
    >
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-[-5%] h-44 w-44 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-xl font-mono uppercase tracking-[0.15em]">
            Level Progress
          </h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono tabular-nums">
          {totalXp.toLocaleString()} total XP
        </span>
      </div>

      <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)]">
        {/* Level Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
              <div className="text-center">
                <Zap className="h-5 w-5 text-primary mx-auto mb-1" />
                <span className="text-3xl font-bold text-primary">{level}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Current Level</p>
        </motion.div>

        {/* Progress to Next Level */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          className="flex flex-col justify-center space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                Level {level + 1}
              </span>
            </div>
            <span className="text-lg font-bold tabular-nums">
              {Math.round(progress.progress)}%
            </span>
          </div>

          <div className="relative">
            <div className="h-4 rounded-full bg-muted/40 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.progress}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
              </motion.div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="tabular-nums">
              {xpInCurrentLevel.toLocaleString()} XP
            </span>
            <span className="tabular-nums">
              {xpForNextLevel.toLocaleString()} XP
            </span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default XpProgressCard;
