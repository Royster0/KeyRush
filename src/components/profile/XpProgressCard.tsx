"use client";

import React from "react";
import { Sparkles, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { getLevelProgress, getXpForLevel } from "@/lib/xp";

interface XpProgressCardProps {
  totalXp: number;
}

const XpProgressCard: React.FC<XpProgressCardProps> = ({ totalXp }) => {
  const progress = getLevelProgress(totalXp);
  const level = progress.level;
  const xpToNextLevel = progress.nextLevelXp - progress.currentLevelXp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/30 p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-xl bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Level Progress</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Level Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-5 border border-primary/20"
        >
          <div className="absolute top-3 right-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Current Level
          </p>
          <p className="text-4xl font-bold text-primary">
            {level}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {totalXp.toLocaleString()} total XP
          </p>
        </motion.div>

        {/* Progress to Next Level */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="rounded-xl bg-background/40 border border-border/50 p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Progress to Level {level + 1}
            </p>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-end gap-2 mb-3">
            <p className="text-3xl font-bold">{Math.round(progress.progress)}%</p>
            <p className="text-sm text-muted-foreground mb-1">
              ({Math.round(progress.currentLevelXp).toLocaleString()} / {progress.nextLevelXp.toLocaleString()} XP)
            </p>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.progress}%` }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {xpToNextLevel.toLocaleString()} XP needed
          </p>
        </motion.div>

      </div>

    </motion.div>
  );
};

export default XpProgressCard;
