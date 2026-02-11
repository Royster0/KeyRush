"use client";

import { cn } from "@/lib/utils";
import { COMPONENT_MAP } from "@/lib/banners";
import { RankIcon } from "@/components/RankIcon";
import type { ActiveBanner } from "@/types/banner.types";

const BG_STYLES: Record<string, React.CSSProperties> = {
  bg_starter_fade: {
    background: "linear-gradient(135deg, #18181b 0%, #27272a 50%, #1c1c1f 100%)",
  },
  bg_arcade_grid: {
    background:
      "linear-gradient(135deg, #0c0a1a 0%, #1a1a2e 100%)",
    backgroundImage:
      "linear-gradient(135deg, #0c0a1a 0%, #1a1a2e 100%), repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(99, 102, 241, 0.08) 24px, rgba(99, 102, 241, 0.08) 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(99, 102, 241, 0.08) 24px, rgba(99, 102, 241, 0.08) 25px)",
  },
  bg_neon_drift: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 30%, #0e7490 70%, #06b6d4 100%)",
  },
  bg_velocity_lines: {
    background:
      "repeating-linear-gradient(135deg, #18181b 0px, #18181b 8px, #27272a 8px, #27272a 9px, #18181b 9px, #18181b 20px), linear-gradient(135deg, #18181b 0%, #1f1f23 100%)",
  },
  bg_precision_wave: {
    background:
      "linear-gradient(135deg, #042f2e 0%, #0d3d38 25%, #0f766e 50%, #14b8a6 75%, #0d9488 100%)",
  },
  bg_grindstone: {
    background:
      "linear-gradient(160deg, #1c1917 0%, #292524 30%, #1c1917 60%, #292524 100%)",
  },
  bg_elite_pulse: {
    background:
      "radial-gradient(ellipse at 30% 50%, #854d0e 0%, #422006 40%, #1c1917 70%)",
  },
  bg_champion_aura: {
    background:
      "linear-gradient(135deg, #422006 0%, #a16207 30%, #facc15 50%, #a16207 70%, #422006 100%)",
  },
  bg_mach_burst: {
    background:
      "radial-gradient(ellipse at 50% 50%, #991b1b 0%, #7f1d1d 30%, #450a0a 60%, #1c1917 90%)",
  },
};

const BORDER_STYLES: Record<string, string> = {
  border_clean: "border border-zinc-700/50",
  border_victor: "border-2 border-amber-500/60",
  border_unstoppable: "border-2 border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.3)]",
  border_bronze: "border-2 border-amber-700/70",
  border_silver: "border-2 border-zinc-400/70",
  border_gold: "border-2 border-yellow-500/70",
  border_platinum: "border-2 border-cyan-400/70",
  border_diamond: "border-2 border-blue-400/70",
  border_sonic: "border-2 border-emerald-400/70",
  border_mach: "border-2 border-red-500/70",
  border_tachyon: "border-2 border-fuchsia-400/70 shadow-[0_0_16px_rgba(232,121,249,0.25)]",
};

interface BannerDisplayProps {
  banner: ActiveBanner;
  size?: "sm" | "md" | "lg";
  username?: string;
  rank?: string | null;
  level?: number | null;
  className?: string;
}

export default function BannerDisplay({ banner, size = "md", username, rank, level, className }: BannerDisplayProps) {
  const bgStyle = BG_STYLES[banner.backgroundId] ?? BG_STYLES.bg_starter_fade;
  const borderClass = BORDER_STYLES[banner.borderId] ?? BORDER_STYLES.border_clean;
  const titleDef = COMPONENT_MAP[banner.titleId];

  const showRank = rank && rank !== "Unranked" && rank !== "Placement";
  const showMeta = showRank || (level != null && level > 0);

  // Size-based classes
  const avatarSize =
    size === "sm" ? "h-10 w-10 rounded-lg" : size === "lg" ? "h-20 w-20 rounded-2xl" : "h-14 w-14 rounded-xl";
  const avatarText =
    size === "sm" ? "text-base" : size === "lg" ? "text-4xl" : "text-2xl";
  const levelBadgeClass =
    size === "sm"
      ? "w-5 h-5 -bottom-1 -right-1 rounded text-[8px]"
      : size === "lg"
        ? "w-9 h-9 -bottom-1.5 -right-1.5 rounded-lg text-xs"
        : "w-7 h-7 -bottom-1 -right-1 rounded-md text-[10px]";
  const paddingClass =
    size === "sm" ? "py-3 px-3" : size === "lg" ? "py-8 px-6" : "py-5 px-5";
  const gapClass =
    size === "sm" ? "gap-2.5" : size === "lg" ? "gap-5" : "gap-3.5";
  const usernameClass =
    size === "sm"
      ? "text-sm font-bold leading-tight"
      : size === "lg"
        ? "text-xl md:text-2xl font-bold leading-tight"
        : "text-lg font-bold leading-tight";
  const titleClass =
    size === "sm"
      ? "text-[10px] font-semibold uppercase tracking-widest text-white/50"
      : size === "lg"
        ? "text-xs font-semibold uppercase tracking-widest text-white/45"
        : "text-[11px] font-semibold uppercase tracking-widest text-white/45";
  const rankIconSize = size === "sm" ? 11 : size === "lg" ? 16 : 13;
  const metaClass =
    size === "sm"
      ? "text-[10px] font-medium text-white/40"
      : size === "lg"
        ? "text-sm font-medium text-white/40"
        : "text-xs font-medium text-white/40";

  return (
    <div
      className={cn("rounded-xl overflow-hidden", borderClass, className)}
      style={bgStyle}
    >
      <div className={cn("flex items-center text-left", paddingClass, gapClass)}>
        {/* Avatar */}
        {username && (
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "bg-gradient-to-br from-white/20 to-white/5 border border-white/15 flex items-center justify-center",
                avatarSize
              )}
            >
              <span className={cn("font-black text-white drop-shadow-sm", avatarText)}>
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            {level != null && level > 0 && (
              <div
                className={cn(
                  "absolute bg-black/70 border border-white/20 flex items-center justify-center font-bold text-white",
                  levelBadgeClass
                )}
              >
                {level}
              </div>
            )}
          </div>
        )}

        {/* Text content */}
        <div className="flex flex-col min-w-0">
          {username && (
            <span className={cn("text-white drop-shadow-md truncate", usernameClass)}>
              {username}
            </span>
          )}
          <span className={cn("drop-shadow-md", titleClass)}>
            {titleDef?.name ?? "Rookie"}
          </span>
          {showMeta && (
            <span className={cn("flex items-center gap-1 mt-0.5", metaClass)}>
              {showRank && (
                <>
                  <RankIcon rank={rank} size={rankIconSize} />
                  {rank}
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
