"use client";

import { Button } from "@/components/ui/button";
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
  X,
  Zap,
  LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeNotification as BadgeNotificationData } from "@/types/badges.types";
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
  // Bolt doesn't exist in lucide, use Zap as fallback
  Bolt: Zap,
};

interface BadgeNotificationProps {
  open: boolean;
  onClose: () => void;
  notification: BadgeNotificationData | null;
}

export function BadgeNotification({
  open,
  onClose,
  notification,
}: BadgeNotificationProps) {
  if (!notification) return null;

  const { badge } = notification;
  const Icon = ICON_MAP[badge.icon] || Star;
  const rarityColors = RARITY_COLORS[badge.rarity];

  const getGradient = () => {
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

  const getBorderColor = () => {
    switch (badge.rarity) {
      case "legendary":
        return "border-amber-500/50";
      case "epic":
        return "border-purple-500/50";
      case "rare":
        return "border-blue-500/50";
      case "uncommon":
        return "border-green-500/50";
      default:
        return "border-zinc-500/30";
    }
  };

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
                  className={`h-14 w-14 rounded-full bg-gradient-to-br ${getGradient()} flex items-center justify-center shadow-lg flex-shrink-0`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </motion.div>

                <div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xs uppercase tracking-wider text-muted-foreground mb-1"
                  >
                    Badge Unlocked
                  </motion.p>
                  <motion.h3
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={`text-xl font-bold bg-gradient-to-r ${getGradient()} bg-clip-text text-transparent`}
                  >
                    {badge.name}
                  </motion.h3>
                </div>
              </div>

              {/* Badge description */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-3"
              >
                <p className="text-sm text-muted-foreground">
                  {badge.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${rarityColors.bg} ${rarityColors.text}`}
                    >
                      {badge.rarity}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {badge.category}
                    </span>
                  </div>
                  {notification.xpAwarded > 0 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 }}
                      className="text-sm font-semibold text-primary"
                    >
                      +{notification.xpAwarded} XP
                    </motion.span>
                  )}
                </div>
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
