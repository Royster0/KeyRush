import Image from "next/image";
import React from "react";
import { cn } from "@/lib/utils";

const RANK_ICON_SOURCES: Record<string, string> = {
  bronze: "/rank_icons/bronze_icon.svg",
  silver: "/rank_icons/silver_icon.svg",
  gold: "/rank_icons/gold_icon.svg",
  platinum: "/rank_icons/platinum_icon.svg",
  diamond: "/rank_icons/diamond_icon.svg",
  sonic: "/rank_icons/sonic_icon.svg",
  mach: "/rank_icons/mach_icon.svg",
  tachyon: "/rank_icons/tachyon_icon.svg",
};

function normalizeRank(rank?: string | null) {
  return rank?.trim().toLowerCase() ?? "";
}

export function getRankIconSrc(rank?: string | null) {
  const normalized = normalizeRank(rank);
  if (!normalized || normalized === "placement" || normalized === "unranked") {
    return null;
  }
  const key = normalized.split(/\s+/)[0];
  return RANK_ICON_SOURCES[key] ?? null;
}

type RankIconProps = {
  rank?: string | null;
  size?: number;
  className?: string;
  alt?: string;
  title?: string;
  fallback?: React.ReactNode;
};

export function RankIcon({
  rank,
  size = 24,
  className,
  alt,
  title,
  fallback,
}: RankIconProps) {
  const src = getRankIconSrc(rank);
  if (!src) {
    return fallback ?? null;
  }

  const label = rank?.trim() || "Rank";
  return (
    <Image
      src={src}
      alt={alt ?? `${label} rank`}
      title={title ?? label}
      width={size}
      height={size}
      className={cn("inline-block select-none", className)}
    />
  );
}
