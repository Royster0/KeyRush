"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { UserBadgeCard } from "@/components/UserBadge";
import { BadgeWithStatus, BadgeCategory } from "@/types/badges.types";
import { CATEGORY_NAMES, CATEGORY_ORDER } from "@/lib/badges";
import { cn } from "@/lib/utils";

interface BadgesClientProps {
  badges: BadgeWithStatus[];
}

export default function BadgesClient({ badges }: BadgesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    BadgeCategory | "all"
  >("all");

  const earnedCount = useMemo(
    () => badges.filter((b) => b.earned).length,
    [badges],
  );
  const totalCount = badges.length;
  const progressPercent = Math.round((earnedCount / totalCount) * 100);

  const recentBadges = useMemo(() => {
    return badges
      .filter((b) => b.earned && b.earnedAt)
      .sort(
        (a, b) =>
          new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime(),
      )
      .slice(0, 4);
  }, [badges]);

  const filteredBadges = useMemo(() => {
    if (selectedCategory === "all") return badges;
    return badges.filter((b) => b.category === selectedCategory);
  }, [badges, selectedCategory]);

  const badgesByCategory = useMemo(() => {
    const grouped: Record<BadgeCategory, BadgeWithStatus[]> = {
      milestone: [],
      achievement: [],
      speed: [],
      social: [],
      competitive: [],
    };
    filteredBadges.forEach((badge) => {
      grouped[badge.category].push(badge);
    });
    return grouped;
  }, [filteredBadges]);

  const sortBadges = (badges: BadgeWithStatus[]) => {
    const rarityOrder = {
      legendary: 0,
      epic: 1,
      rare: 2,
      uncommon: 3,
      common: 4,
    };
    return [...badges].sort((a, b) => {
      if (a.earned !== b.earned) return a.earned ? -1 : 1;
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });
  };

  const getCategoryStats = (category: BadgeCategory) => {
    const categoryBadges = badges.filter((b) => b.category === category);
    const earned = categoryBadges.filter((b) => b.earned).length;
    return { earned, total: categoryBadges.length };
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-12 space-y-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Badges
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Unlock achievements and build your collection. Each badge tells a
            story of your typing journey.
          </p>
        </motion.header>

        {/* Progress Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="relative inline-flex items-center gap-8 px-8 py-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/40">
            {/* Progress Circle */}
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/30"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="text-primary"
                  initial={{ strokeDasharray: "0 264" }}
                  animate={{
                    strokeDasharray: `${(progressPercent / 100) * 264} 264`,
                  }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{progressPercent}%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div>
                <div className="text-3xl font-bold tracking-tight">
                  {earnedCount}
                  <span className="text-muted-foreground font-normal text-lg">
                    /{totalCount}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Badges Earned
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Badges */}
        {recentBadges.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-center">Recent Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {recentBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                >
                  <UserBadgeCard badge={badge} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="inline-flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl bg-muted/30">
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "relative px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                selectedCategory === "all"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {selectedCategory === "all" && (
                <motion.div
                  layoutId="categoryPill"
                  className="absolute inset-0 bg-background rounded-xl shadow-sm"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">All</span>
            </button>
            {CATEGORY_ORDER.map((category) => {
              const stats = getCategoryStats(category);
              const isComplete = stats.earned === stats.total;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "relative px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    selectedCategory === category
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {selectedCategory === category && (
                    <motion.div
                      layoutId="categoryPill"
                      className="absolute inset-0 bg-background rounded-xl shadow-sm"
                      transition={{
                        type: "spring",
                        bounce: 0.15,
                        duration: 0.5,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {CATEGORY_NAMES[category]}
                    {isComplete && <span className="text-primary">✓</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Badges Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-10"
          >
            {selectedCategory === "all" ? (
              CATEGORY_ORDER.map((category) => {
                const categoryBadges = badgesByCategory[category];
                if (categoryBadges.length === 0) return null;
                const stats = getCategoryStats(category);

                return (
                  <section key={category} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold">
                          {CATEGORY_NAMES[category]}
                        </h2>
                        <span className="text-sm text-muted-foreground">
                          {stats.earned}/{stats.total}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedCategory(category)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        View all
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sortBadges(categoryBadges)
                        .slice(0, 4)
                        .map((badge, index) => (
                          <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <UserBadgeCard badge={badge} />
                          </motion.div>
                        ))}
                    </div>
                  </section>
                );
              })
            ) : (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">
                    {CATEGORY_NAMES[selectedCategory]}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {filteredBadges.filter((b) => b.earned).length}/
                    {filteredBadges.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sortBadges(filteredBadges).map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <UserBadgeCard badge={badge} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
