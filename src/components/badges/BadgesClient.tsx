"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserBadgeCard, UserBadgeIcon } from "@/components/UserBadge";
import { BadgeWithStatus, BadgeCategory } from "@/types/badges.types";
import { CATEGORY_NAMES, CATEGORY_ORDER } from "@/lib/badges";
import { cn } from "@/lib/utils";

interface BadgesClientProps {
  badges: BadgeWithStatus[];
}

export default function BadgesClient({ badges }: BadgesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | "all">("all");

  const earnedCount = useMemo(() => badges.filter((b) => b.earned).length, [badges]);
  const totalCount = badges.length;

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

  // Sort badges: earned first, then by rarity
  const sortBadges = (badges: BadgeWithStatus[]) => {
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    return [...badges].sort((a, b) => {
      // Earned badges first
      if (a.earned !== b.earned) return a.earned ? -1 : 1;
      // Then by rarity
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Badges</h1>
        <p className="text-muted-foreground">
          Unlock badges by completing achievements. Earned badges appear in color.
        </p>
      </header>

      {/* Progress summary */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Badges Earned</span>
                <span className="font-semibold">
                  {earnedCount} / {totalCount}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(earnedCount / totalCount) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
            <div className="text-3xl font-bold text-primary">
              {Math.round((earnedCount / totalCount) * 100)}%
            </div>
          </div>

          {/* Earned badges preview */}
          {earnedCount > 0 && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-3">Earned Badges</p>
              <div className="flex flex-wrap gap-2">
                {badges
                  .filter((b) => b.earned)
                  .slice(0, 12)
                  .map((badge) => (
                    <UserBadgeIcon key={badge.id} badge={badge} size="sm" />
                  ))}
                {earnedCount > 12 && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    +{earnedCount - 12}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          )}
        >
          All ({totalCount})
        </button>
        {CATEGORY_ORDER.map((category) => {
          const count = badges.filter((b) => b.category === category).length;
          const earnedInCategory = badges.filter(
            (b) => b.category === category && b.earned
          ).length;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
            >
              {CATEGORY_NAMES[category]} ({earnedInCategory}/{count})
            </button>
          );
        })}
      </div>

      {/* Badges by category */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >
          {selectedCategory === "all" ? (
            // Show all categories
            CATEGORY_ORDER.map((category) => {
              const categoryBadges = badgesByCategory[category];
              if (categoryBadges.length === 0) return null;
              return (
                <Card key={category} className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {CATEGORY_NAMES[category]}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({categoryBadges.filter((b) => b.earned).length}/
                        {categoryBadges.length})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sortBadges(categoryBadges).map((badge) => (
                        <UserBadgeCard key={badge.id} badge={badge} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            // Show single category
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {CATEGORY_NAMES[selectedCategory]}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({filteredBadges.filter((b) => b.earned).length}/
                    {filteredBadges.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sortBadges(filteredBadges).map((badge) => (
                    <UserBadgeCard key={badge.id} badge={badge} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
