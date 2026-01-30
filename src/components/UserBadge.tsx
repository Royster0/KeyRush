"use client";

import {
  Award,
  Crown,
  Flame,
  Gem,
  Heart,
  Keyboard,
  Medal,
  ScrollText,
  Sparkles,
  Star,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  LucideIcon,
} from "lucide-react";
import { BadgeWithStatus } from "@/types/badges.types";
import { RARITY_COLORS } from "@/lib/badges";

// Map icon names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  Crown,
  Flame,
  Gem,
  Heart,
  Keyboard,
  Medal,
  ScrollText,
  Sparkles,
  Star,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  Bolt: Zap,
};

interface UserBadgeIconProps {
  badge: BadgeWithStatus;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function UserBadgeIcon({
  badge,
  size = "md",
  showTooltip = true,
}: UserBadgeIconProps) {
  const Icon = ICON_MAP[badge.icon] || Star;
  const rarityColors = RARITY_COLORS[badge.rarity];

  const getGradient = () => {
    if (!badge.earned) {
      return "from-zinc-400 to-zinc-500";
    }
    switch (badge.rarity) {
      case "legendary":
        return "from-amber-400 via-yellow-500 to-amber-600";
      case "epic":
        return "from-purple-400 via-purple-500 to-purple-600";
      case "rare":
        return "from-blue-400 via-blue-500 to-blue-600";
      case "uncommon":
        return "from-green-400 via-green-500 to-green-600";
      default:
        return "from-zinc-400 via-zinc-500 to-zinc-600";
    }
  };

  const badgeContent = (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-gradient-to-br ${getGradient()}
        flex items-center justify-center
        shadow-md
        transition-all duration-200
        ${badge.earned ? "hover:scale-110 cursor-pointer" : "opacity-40 grayscale"}
      `}
    >
      <Icon className={`${iconSizeClasses[size]} text-white`} />
    </div>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <div className="relative group">
      {badgeContent}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-48 pointer-events-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{badge.name}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded capitalize ${rarityColors.bg} ${rarityColors.text}`}
            >
              {badge.rarity}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{badge.description}</p>
          {badge.earned && badge.earnedAt && (
            <p className="text-xs text-muted-foreground">
              Earned {new Date(badge.earnedAt).toLocaleDateString()}
            </p>
          )}
          {!badge.earned && (
            <p className="text-xs text-muted-foreground italic">Not yet earned</p>
          )}
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-border" />
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover" />
      </div>
    </div>
  );
}

interface UserBadgeCardProps {
  badge: BadgeWithStatus;
}

export function UserBadgeCard({ badge }: UserBadgeCardProps) {
  const Icon = ICON_MAP[badge.icon] || Star;
  const rarityColors = RARITY_COLORS[badge.rarity];

  const getGradient = () => {
    if (!badge.earned) {
      return "from-zinc-400 to-zinc-500";
    }
    switch (badge.rarity) {
      case "legendary":
        return "from-amber-400 via-yellow-500 to-amber-600";
      case "epic":
        return "from-purple-400 via-purple-500 to-purple-600";
      case "rare":
        return "from-blue-400 via-blue-500 to-blue-600";
      case "uncommon":
        return "from-green-400 via-green-500 to-green-600";
      default:
        return "from-zinc-400 via-zinc-500 to-zinc-600";
    }
  };

  return (
    <div
      className={`
        relative p-4 rounded-xl border
        ${badge.earned ? rarityColors.border : "border-zinc-200 dark:border-zinc-800"}
        ${badge.earned ? "" : "opacity-60"}
        bg-background
        transition-all duration-200
        ${badge.earned ? "hover:shadow-md hover:scale-[1.02]" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            h-12 w-12 rounded-full
            bg-gradient-to-br ${getGradient()}
            flex items-center justify-center
            shadow-md flex-shrink-0
            ${!badge.earned ? "grayscale" : ""}
          `}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold ${!badge.earned ? "text-muted-foreground" : ""}`}>
                {badge.name}
              </h3>
              <span
                className={`text-xs px-1.5 py-0.5 rounded capitalize ${rarityColors.bg} ${rarityColors.text}`}
              >
                {badge.rarity}
              </span>
            </div>
            <span className={`text-xs font-medium ${badge.earned ? "text-primary" : "text-muted-foreground"}`}>
              +{badge.xpReward} XP
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {badge.description}
          </p>
          {badge.earned && badge.earnedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Earned {new Date(badge.earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
