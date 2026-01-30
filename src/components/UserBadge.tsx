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
  Lock,
} from "lucide-react";
import { BadgeWithStatus } from "@/types/badges.types";
import { RARITY_COLORS } from "@/lib/badges";
import { cn } from "@/lib/utils";

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
      className={cn(
        sizeClasses[size],
        "rounded-full flex items-center justify-center transition-all duration-200",
        badge.earned
          ? `bg-gradient-to-br ${getGradient()} shadow-md hover:scale-110 cursor-pointer`
          : "bg-muted/50 opacity-40"
      )}
    >
      <Icon className={cn(iconSizeClasses[size], badge.earned ? "text-white" : "text-muted-foreground")} />
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

const rarityAccents: Record<string, string> = {
  common: "bg-zinc-500",
  uncommon: "bg-emerald-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-amber-500",
};

export function UserBadgeCard({ badge }: UserBadgeCardProps) {
  const Icon = ICON_MAP[badge.icon] || Star;
  const rarityColors = RARITY_COLORS[badge.rarity];

  const getIconBg = () => {
    if (!badge.earned) return "bg-muted/50";
    switch (badge.rarity) {
      case "legendary":
        return "bg-gradient-to-br from-amber-400/20 to-amber-600/20";
      case "epic":
        return "bg-gradient-to-br from-purple-400/20 to-purple-600/20";
      case "rare":
        return "bg-gradient-to-br from-blue-400/20 to-blue-600/20";
      case "uncommon":
        return "bg-gradient-to-br from-emerald-400/20 to-emerald-600/20";
      default:
        return "bg-muted/80";
    }
  };

  const getIconColor = () => {
    if (!badge.earned) return "text-muted-foreground/50";
    switch (badge.rarity) {
      case "legendary":
        return "text-amber-500";
      case "epic":
        return "text-purple-500";
      case "rare":
        return "text-blue-500";
      case "uncommon":
        return "text-emerald-500";
      default:
        return "text-foreground";
    }
  };

  return (
    <div
      className={cn(
        "group relative p-4 rounded-xl border transition-all duration-300",
        badge.earned
          ? "bg-card/80 border-border/50 hover:border-border hover:shadow-lg"
          : "bg-muted/20 border-transparent"
      )}
    >
      {/* Rarity indicator line */}
      {badge.earned && (
        <div
          className={cn(
            "absolute left-0 top-4 bottom-4 w-0.5 rounded-full",
            rarityAccents[badge.rarity]
          )}
        />
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "relative h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300",
            getIconBg(),
            badge.earned && "group-hover:scale-110"
          )}
        >
          {badge.earned ? (
            <Icon className={cn("h-6 w-6", getIconColor())} />
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground/40" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <h3
                className={cn(
                  "font-medium leading-tight",
                  !badge.earned && "text-muted-foreground/60"
                )}
              >
                {badge.name}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[11px] font-medium uppercase tracking-wide",
                    badge.earned ? rarityColors.text : "text-muted-foreground/40"
                  )}
                >
                  {badge.rarity}
                </span>
                {badge.earned && badge.earnedAt && (
                  <>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap",
                badge.earned
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/50 text-muted-foreground/50"
              )}
            >
              +{badge.xpReward} XP
            </span>
          </div>
          <p
            className={cn(
              "text-sm leading-relaxed",
              badge.earned ? "text-muted-foreground" : "text-muted-foreground/40"
            )}
          >
            {badge.description}
          </p>
        </div>
      </div>
    </div>
  );
}
