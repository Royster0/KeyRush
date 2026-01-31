"use client";

import React from "react";
import { Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import { getLevelProgress } from "@/lib/xp";

interface XpProgressCardProps {
  totalXp: number;
}

const XpProgressCard: React.FC<XpProgressCardProps> = ({ totalXp }) => {
  const progress = getLevelProgress(totalXp);
  const level = progress.level;
  const xpToNextLevel = progress.nextLevelXp - progress.currentLevelXp;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3 }}
      className="relative border-b border-primary/40 py-10"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-[-5%] h-44 w-44 rounded-full bg-primary/12 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-2xl font-mono uppercase tracking-[0.2em]">
            Level Progress
          </h3>
        </div>
      </div>

      <div className="relative z-10 mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Level Display */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-muted-foreground">
                Current Level
              </p>
              <p className="text-4xl font-semibold text-primary">{level}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {totalXp.toLocaleString()} total XP
          </p>
        </motion.div>

        {/* Progress to Next Level */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          className="space-y-3 md:col-span-1 lg:col-span-2"
        >
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.3em]">
              Level {level + 1}
            </span>
            <span className="text-lg font-semibold text-foreground">
              {Math.round(progress.progress)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.progress}%` }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary/50"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {Math.round(progress.currentLevelXp).toLocaleString()} /{" "}
            {progress.nextLevelXp.toLocaleString()} XP
          </p>
          <p className="text-xs text-muted-foreground">
            {xpToNextLevel.toLocaleString()} XP needed
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default XpProgressCard;
