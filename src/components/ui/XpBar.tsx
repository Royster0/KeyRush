"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface XpBarProps {
  level: number;
  progress: number; // 0-100
  animated?: boolean;
}

/**
 * XP progress bar displayed under username in Nav
 * Shows level progress with spring animation on XP gain
 */
export function XpBar({ level, progress, animated = true }: XpBarProps) {
  const [displayProgress, setDisplayProgress] = useState(progress);

  // Spring animation for smooth progress updates
  const springProgress = useSpring(displayProgress, {
    stiffness: 100,
    damping: 20,
    mass: 1,
  });

  // Transform spring value to width percentage
  const width = useTransform(springProgress, (value) => `${Math.min(100, Math.max(0, value))}%`);

  // Update spring target when progress changes
  useEffect(() => {
    if (animated) {
      springProgress.set(progress);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, animated, springProgress]);

  // Pulse animation on level up (when progress resets to low value)
  const [justLeveled, setJustLeveled] = useState(false);

  useEffect(() => {
    // Detect level up: progress drops significantly (new level started)
    if (progress < 20 && displayProgress > 80) {
      setJustLeveled(true);
      setTimeout(() => setJustLeveled(false), 1000);
    }
    setDisplayProgress(progress);
  }, [progress, displayProgress]);

  return (
    <div className="flex items-center gap-2 w-full min-w-[100px]">
      {/* Level indicator */}
      <motion.span
        className="text-xs font-medium text-muted-foreground min-w-[24px]"
        animate={justLeveled ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {level}
      </motion.span>

      {/* Progress bar container */}
      <div className="relative flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
        {/* Animated fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/80 to-primary rounded-full"
          style={{ width: animated ? width : `${progress}%` }}
        />

        {/* Glow effect on gain */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: animated ? width : `${progress}%`,
            boxShadow: "0 0 8px var(--primary)",
            opacity: 0,
          }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          key={Math.floor(progress)} // Re-trigger on significant progress changes
        />
      </div>
    </div>
  );
}
