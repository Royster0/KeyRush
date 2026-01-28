"use client";

import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Medal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AchievementData } from "@/lib/services/achievements";

interface CongratsModalProps {
  open: boolean;
  onClose: () => void;
  achievement: AchievementData | null;
}

export function CongratsModal({
  open,
  onClose,
  achievement,
}: CongratsModalProps) {
  if (!achievement) return null;

  const isPersonalBest = achievement.type === "personal_best";
  const isLeaderboard = achievement.type === "leaderboard";

  const getIconGradient = () => {
    if (isLeaderboard) {
      return "from-purple-400 via-purple-500 to-purple-600";
    }
    return "from-emerald-400 via-emerald-500 to-emerald-600";
  };

  const getBorderColor = () => {
    if (isLeaderboard) {
      return "border-purple-500/30";
    }
    return "border-emerald-500/30";
  };

  const getTitle = () => {
    if (isLeaderboard) {
      return achievement.previousRank ? "Rank Improved!" : "Top 100!";
    }
    return "New Record!";
  };

  const Icon = isLeaderboard ? Medal : Trophy;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="fixed bottom-6 right-6 z-50 pointer-events-auto"
        >
          <div
            className={`relative w-80 rounded-xl border-2 ${getBorderColor()} bg-background/95 backdrop-blur-sm shadow-xl overflow-hidden`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors z-10"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="p-5">
              {/* Header with icon and title */}
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
                  className={`h-14 w-14 rounded-full bg-gradient-to-br ${getIconGradient()} flex items-center justify-center shadow-lg flex-shrink-0`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </motion.div>

                <div>
                  <motion.h3
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={`text-xl font-bold bg-gradient-to-r ${getIconGradient()} bg-clip-text text-transparent`}
                  >
                    {getTitle()}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-muted-foreground"
                  >
                    {achievement.duration}s Test
                  </motion.p>
                </div>
              </div>

              {/* Personal Best Content */}
              {isPersonalBest && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Previous</span>
                    <span className="font-mono text-muted-foreground line-through">
                      {achievement.oldWpm > 0
                        ? `${achievement.oldWpm.toFixed(1)} WPM`
                        : "--"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">New Best</span>
                    <span className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">
                      {achievement.newWpm.toFixed(1)} WPM
                    </span>
                  </div>
                  {achievement.improvement > 0 && (
                    <div className="flex items-center justify-center gap-1 pt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                      +{achievement.improvement.toFixed(1)} WPM
                    </div>
                  )}
                </motion.div>
              )}

              {/* Leaderboard Content */}
              {isLeaderboard && achievement.leaderboardRank && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-center"
                >
                  {achievement.previousRank && (
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-lg text-muted-foreground line-through">
                        #{achievement.previousRank}
                      </span>
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                    </div>
                  )}
                  <motion.p
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.35, type: "spring" }}
                    className="text-3xl font-bold text-purple-600 dark:text-purple-400"
                  >
                    #{achievement.leaderboardRank}
                  </motion.p>
                  {achievement.totalUsers && (
                    <p className="text-xs text-muted-foreground mt-1">
                      of {achievement.totalUsers.toLocaleString()} players
                    </p>
                  )}
                </motion.div>
              )}

              {/* Dismiss button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  Dismiss
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
