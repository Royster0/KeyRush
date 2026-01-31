"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { motion } from "motion/react";
import { getLevelProgress } from "@/lib/xp";

interface ProfileOverviewProps {
  username: string;
  joinDate: string;
  totalXp?: number;
  isOwnProfile?: boolean;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  username,
  joinDate,
  totalXp = 0,
  isOwnProfile = false,
}) => {
  const level = getLevelProgress(totalXp).level;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative py-10"
    >
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.1,
          }}
          className="relative mb-5"
        >
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-xl shadow-primary/10">
            <span className="text-4xl font-black text-primary-foreground">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          {/* Level badge */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-background border-2 border-primary/50 flex items-center justify-center text-xs font-bold text-primary">
            {level}
          </div>
        </motion.div>

        {/* Username & Meta */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 justify-center mb-1">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {username}
            </h1>
            {isOwnProfile && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                You
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
            <Calendar className="h-3 w-3" />
            Joined {joinDate}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ProfileOverview;
