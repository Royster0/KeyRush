import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser, getBannerCustomizationState } from "@/app/actions";
import BannerClient from "@/components/banner/BannerClient";
import { getLevelProgress } from "@/lib/xp";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Banner | KeyRush",
  description: "Customize your banner with backgrounds, borders, and titles.",
  path: "/banner",
  noIndex: true,
});

const BannerContent = async () => {
  const user = await getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const state = await getBannerCustomizationState();
  if (!state) {
    redirect("/auth/login");
  }

  // Convert Set to array for serialization across server/client boundary
  const unlockedIds = Array.from(state.unlockedComponentIds);

  return (
    <BannerClient
      presets={state.presets}
      activeSlot={state.activeSlot}
      unlockedIds={unlockedIds}
      username={user.profile?.username || "User"}
      rankTier={user.profile?.rank_tier ?? null}
      level={getLevelProgress(user.profile?.total_xp ?? 0).level}
    />
  );
};

function LoadingBanner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    </div>
  );
}

export default function BannerPage() {
  return (
    <Suspense fallback={<LoadingBanner />}>
      <BannerContent />
    </Suspense>
  );
}
