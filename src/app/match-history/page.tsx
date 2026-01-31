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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Match History</h1>
        <p className="text-muted-foreground">
          Your recent multiplayer matches
        </p>
      </div>
      <MatchHistoryClient
        initialMatches={matches}
        initialHasMore={hasMore}
        initialTotal={total}
      />
    </div>
  );
};

export default function MatchHistoryPage() {
  return (
    <Suspense fallback={<LoadingMatchHistory />}>
      <MatchHistoryContent />
    </Suspense>
  );
}
