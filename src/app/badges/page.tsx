import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser, getBadgesWithStatus } from "@/app/actions";
import BadgesClient from "@/components/badges/BadgesClient";
import LoadingBadges from "@/components/badges/LoadingBadges";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Badges | KeyRush",
  description: "View your earned and unearned KeyRush badges.",
  path: "/badges",
  noIndex: true,
});

const BadgesContent = async () => {
  const user = await getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const badges = await getBadgesWithStatus();

  return <BadgesClient badges={badges} />;
};

export default function BadgesPage() {
  return (
    <Suspense fallback={<LoadingBadges />}>
      <BadgesContent />
    </Suspense>
  );
}
