"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { RankIcon } from "@/components/RankIcon";
import { ChevronUp, ChevronDown, Sparkles, Flame, Star } from "lucide-react";

// Rank color schemes for dramatic backgrounds
const RANK_GRADIENTS: Record<string, { primary: string; secondary: string; glow: string }> = {
  Bronze: {
    primary: "from-amber-900/90 via-amber-800/80",
    secondary: "to-orange-950/95",
    glow: "shadow-amber-500/50",
  },
  Silver: {
    primary: "from-slate-600/90 via-slate-500/80",
    secondary: "to-zinc-800/95",
    glow: "shadow-slate-400/50",
  },
  Gold: {
    primary: "from-yellow-600/90 via-amber-500/80",
    secondary: "to-yellow-900/95",
    glow: "shadow-yellow-400/60",
  },
  Platinum: {
    primary: "from-cyan-600/90 via-teal-500/80",
    secondary: "to-cyan-900/95",
    glow: "shadow-cyan-400/60",
  },
  Diamond: {
    primary: "from-blue-600/90 via-indigo-500/80",
    secondary: "to-blue-950/95",
    glow: "shadow-blue-400/60",
  },
  Sonic: {
    primary: "from-purple-600/90 via-violet-500/80",
    secondary: "to-purple-950/95",
    glow: "shadow-purple-400/60",
  },
  Mach: {
    primary: "from-red-600/90 via-rose-500/80",
    secondary: "to-red-950/95",
    glow: "shadow-red-500/60",
  },
  Tachyon: {
    primary: "from-fuchsia-600/90 via-pink-500/80",
    secondary: "to-fuchsia-950/95",
    glow: "shadow-fuchsia-400/60",
  },
};

const RANK_ACCENT_COLORS: Record<string, string> = {
  Bronze: "text-amber-400",
  Silver: "text-slate-300",
  Gold: "text-yellow-400",
  Platinum: "text-cyan-300",
  Diamond: "text-blue-400",
  Sonic: "text-purple-400",
  Mach: "text-red-400",
  Tachyon: "text-fuchsia-400",
};

type RankChangeAnimationProps = {
  isOpen: boolean;
  onComplete: () => void;
  previousRank: string;
  newRank: string;
  isRankUp: boolean;
};

// Particle component for explosive effects
function Particle({ delay, isRankUp, index }: { delay: number; isRankUp: boolean; index: number }) {
  const angle = (index / 12) * 360;
  const distance = 150 + Math.random() * 100;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;

  return (
    <motion.div
      className={`absolute w-2 h-2 rounded-full ${isRankUp ? "bg-yellow-400" : "bg-slate-500"}`}
      initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
      animate={{
        x,
        y,
        scale: [0, 1.5, 0],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 1.2,
        delay: delay + 0.3,
        ease: "easeOut",
      }}
    />
  );
}

// Floating star for rank up celebration
function FloatingStar({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute text-yellow-400/80"
      style={{ left: `${x}%` }}
      initial={{ y: "100vh", opacity: 0, rotate: 0 }}
      animate={{
        y: "-20vh",
        opacity: [0, 1, 1, 0],
        rotate: 360,
      }}
      transition={{
        duration: 3,
        delay,
        ease: "easeOut",
      }}
    >
      <Star className="fill-current" style={{ width: size, height: size }} />
    </motion.div>
  );
}

// Descending ember for rank down
function FallingEmber({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-slate-500/60"
      style={{ left: `${x}%`, top: "-5%" }}
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: "110vh",
        opacity: [0, 0.6, 0.6, 0],
      }}
      transition={{
        duration: 4,
        delay,
        ease: "linear",
      }}
    />
  );
}

export function RankChangeAnimation({
  isOpen,
  onComplete,
  previousRank,
  newRank,
  isRankUp,
}: RankChangeAnimationProps) {
  const [showContent, setShowContent] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [showText, setShowText] = useState(false);

  const gradient = RANK_GRADIENTS[newRank] ?? RANK_GRADIENTS.Bronze;
  const accentColor = RANK_ACCENT_COLORS[newRank] ?? "text-amber-400";

  useEffect(() => {
    if (isOpen) {
      // Staggered reveal timing
      const contentTimer = setTimeout(() => setShowContent(true), 200);
      const iconTimer = setTimeout(() => setShowIcon(true), 600);
      const textTimer = setTimeout(() => setShowText(true), 1000);

      // Auto-close after animation completes
      const closeTimer = setTimeout(() => {
        onComplete();
      }, 4500);

      return () => {
        clearTimeout(contentTimer);
        clearTimeout(iconTimer);
        clearTimeout(textTimer);
        clearTimeout(closeTimer);
      };
    } else {
      setShowContent(false);
      setShowIcon(false);
      setShowText(false);
    }
  }, [isOpen, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onComplete}
        >
          {/* Backdrop with rank-themed gradient */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-b ${gradient.primary} ${gradient.secondary}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Animated background pattern */}
          <div className="absolute inset-0 overflow-hidden">
            {isRankUp ? (
              // Rank Up: Rising stars
              <>
                {[...Array(15)].map((_, i) => (
                  <FloatingStar
                    key={i}
                    delay={i * 0.15}
                    x={5 + Math.random() * 90}
                    size={8 + Math.random() * 16}
                  />
                ))}
              </>
            ) : (
              // Rank Down: Falling embers
              <>
                {[...Array(20)].map((_, i) => (
                  <FallingEmber key={i} delay={i * 0.1} x={Math.random() * 100} />
                ))}
              </>
            )}
          </div>

          {/* Radial burst for rank up */}
          {isRankUp && showContent && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Expanding ring */}
              <motion.div
                className={`absolute w-32 h-32 rounded-full border-4 ${accentColor} border-current opacity-40`}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 8, opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <motion.div
                className={`absolute w-32 h-32 rounded-full border-2 ${accentColor} border-current opacity-30`}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 6, opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
              />

              {/* Particle explosion */}
              <div className="relative">
                {[...Array(12)].map((_, i) => (
                  <Particle key={i} delay={0} isRankUp={true} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Direction indicator */}
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ opacity: 0, y: isRankUp ? 30 : -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mb-4"
                >
                  {isRankUp ? (
                    <motion.div
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ChevronUp className={`w-12 h-12 ${accentColor}`} strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ y: [5, -5, 5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ChevronDown className="w-12 h-12 text-slate-400" strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Previous rank (small, fading out) */}
            <AnimatePresence>
              {showContent && !showIcon && (
                <motion.div
                  className="flex items-center gap-3 mb-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5, y: isRankUp ? -40 : 40 }}
                  transition={{ duration: 0.4 }}
                >
                  {previousRank === "Placement" ? (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-white/40">?</span>
                    </div>
                  ) : (
                    <RankIcon rank={previousRank} size={48} />
                  )}
                  <span className="text-2xl font-medium text-white/60">{previousRank}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* New rank icon - dramatic entrance */}
            <AnimatePresence>
              {showIcon && (
                <motion.div
                  className="relative"
                  initial={{
                    opacity: 0,
                    scale: isRankUp ? 0.3 : 1.5,
                    y: isRankUp ? 100 : -100,
                    rotate: isRankUp ? -15 : 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotate: 0,
                  }}
                  transition={{
                    type: "spring",
                    duration: 0.8,
                    bounce: isRankUp ? 0.4 : 0.2,
                  }}
                >
                  {/* Glow effect behind icon */}
                  {isRankUp && (
                    <motion.div
                      className={`absolute inset-0 blur-3xl rounded-full ${gradient.glow} shadow-2xl`}
                      style={{ width: 200, height: 200, left: -36, top: -36 }}
                      animate={{
                        opacity: [0.4, 0.7, 0.4],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  {/* Spinning accent ring for rank up */}
                  {isRankUp && (
                    <motion.div
                      className={`absolute inset-0 border-2 rounded-full ${accentColor} border-current`}
                      style={{ width: 160, height: 160, left: -16, top: -16 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                  )}

                  <motion.div
                    animate={
                      isRankUp
                        ? {
                            scale: [1, 1.05, 1],
                          }
                        : {}
                    }
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <RankIcon rank={newRank} size={128} className="relative z-10 drop-shadow-2xl" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rank name and message */}
            <AnimatePresence>
              {showText && (
                <motion.div
                  className="mt-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {/* New rank name */}
                  <motion.h2
                    className={`text-5xl md:text-6xl font-black tracking-tight mb-4 ${
                      isRankUp ? accentColor : "text-slate-300"
                    }`}
                    style={{
                      textShadow: isRankUp
                        ? "0 0 40px currentColor, 0 0 80px currentColor"
                        : "none",
                      fontFamily: "'Geist', 'Inter', sans-serif",
                    }}
                  >
                    {newRank}
                  </motion.h2>

                  {/* Celebratory / supportive message */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-2"
                  >
                    {isRankUp ? (
                      <>
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <p className="text-lg md:text-xl text-white/80 font-medium tracking-wide">
                          RANK ACHIEVED
                        </p>
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                      </>
                    ) : (
                      <>
                        <Flame className="w-5 h-5 text-slate-500" />
                        <p className="text-lg md:text-xl text-white/60 font-medium tracking-wide">
                          Keep pushing forward
                        </p>
                        <Flame className="w-5 h-5 text-slate-500" />
                      </>
                    )}
                  </motion.div>

                  {/* Rank transition label */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 text-sm text-white/40 font-mono tracking-widest uppercase"
                  >
                    {previousRank} → {newRank}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Click to continue hint */}
            <AnimatePresence>
              {showText && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ delay: 1.5 }}
                  className="absolute bottom-[-80px] text-xs text-white/40 tracking-wide"
                >
                  Click anywhere to continue
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
