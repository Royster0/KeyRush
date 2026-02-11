"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { motion } from "motion/react";
import { getLevelProgress } from "@/lib/xp";
import BannerDisplay from "@/components/banner/BannerDisplay";
import type { ActiveBanner } from "@/types/banner.types";

interface ProfileOverviewProps {
  username: string;
  joinDate: string;
  totalXp?: number;
  isOwnProfile?: boolean;
  banner?: ActiveBanner | null;
  rankTier?: string | null;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  username,
  joinDate,
  totalXp = 0,
  isOwnProfile = false,
  banner,
  rankTier,
}) => {
  const level = getLevelProgress(totalXp).level;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative py-16"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Banner (includes avatar, username, rank, level) */}
        {banner ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg mb-4"
            >
              <BannerDisplay banner={banner} size="lg" username={username} rank={rankTier} level={level} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex items-center gap-2"
            >
              {isOwnProfile && (
                <span className="text-[10px] uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full font-medium">
                  You
                </span>
              )}
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Joined {joinDate}
              </p>
            </motion.div>
          </>
        ) : (
          <>
            {/* Avatar (no banner fallback) */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.1,
              }}
              className="relative mb-6"
            >
              <div className="absolute -inset-1.5 rounded-[22px] bg-gradient-to-br from-primary/40 via-primary/20 to-transparent" />
              <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-primary via-primary/85 to-primary/70 flex items-center justify-center shadow-2xl shadow-primary/20">
                <span className="text-5xl font-black text-primary-foreground drop-shadow-sm">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-background border-2 border-primary/60 flex items-center justify-center text-sm font-bold text-primary shadow-lg"
              >
                {level}
              </motion.div>
            </motion.div>

            {/* Username & Meta */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-3 justify-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {username}
                </h1>
                {isOwnProfile && (
                  <span className="text-[10px] uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full font-medium">
                    You
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Joined {joinDate}
              </p>
            </motion.div>
          </>
        )}
      </div>
    </motion.section>
  );
};

export default ProfileOverview;
