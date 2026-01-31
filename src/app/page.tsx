import { Suspense } from "react";
import GameWrapper from "@/components/typing_test/GameWrapper";
import { GameSkeleton } from "@/components/skeletons/GameSkeleton";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "KeyRush | Typing with Ranked Multiplayer",
  description:
    "KeyRush is a modern typing test with multiplayer races, ranked play, and deep stats.",
  path: "/",
});

export default function Home() {
  return (
    <div className="min-h-[calc(75vh)] flex items-center justify-center p-4">
      <Suspense fallback={<GameSkeleton />}>
        <GameWrapper />
      </Suspense>
    </div>
  );
}
