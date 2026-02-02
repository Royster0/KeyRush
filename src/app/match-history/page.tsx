import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser, getMatchHistory } from "@/app/actions";
import MatchHistoryClient from "@/components/match_history/MatchHistoryClient";
import LoadingMatchHistory from "@/components/match_history/LoadingMatchHistory";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Match History | KeyRush",
  description: "View your multiplayer match history.",
  path: "/match-history",
  noIndex: true,
});

const MatchHistoryContent = async () => {
  const user = await getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const { matches, hasMore, total } = await getMatchHistory(0);

  return (
    <MatchHistoryClient
      initialMatches={matches}
      initialHasMore={hasMore}
      initialTotal={total}
    />
  );
};

export default function MatchHistoryPage() {
  return (
    <Suspense fallback={<LoadingMatchHistory />}>
      <MatchHistoryContent />
    </Suspense>
  );
}
