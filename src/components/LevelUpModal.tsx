"use client";

import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  xpGained: number;
}

interface LevelUpModalProps {
  open: boolean;
  onClose: () => void;
  data: LevelUpData | null;
}

/**
 * Level-up notification modal
 * Appears in bottom-right corner when user levels up
 * Styled similarly to CongratsModal for consistency
 */
export function LevelUpModal({ open, onClose, data }: LevelUpModalProps) {
  if (!data) return null;

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
          <div className="relative w-80 rounded-xl border-2 border-amber-500/30 bg-background/95 backdrop-blur-sm shadow-xl overflow-hidden">
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
                  className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg flex-shrink-0"
                >
                  <Zap className="h-7 w-7 text-white" />
                </motion.div>

                <div>
                  <motion.h3
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent"
                  >
                    Level Up!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-muted-foreground"
                  >
                    Keep typing!
                  </motion.p>
                </div>
              </div>

              {/* Level transition display */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {data.oldLevel}
                  </span>
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.35, type: "spring" }}
                    className="text-3xl font-bold text-amber-600 dark:text-amber-400"
                  >
                    {data.newLevel}
                  </motion.span>
                </div>
                <p className="text-sm text-muted-foreground">
                  +{data.xpGained} XP earned
                </p>
              </motion.div>

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
