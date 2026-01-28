import { Suspense } from "react";
import GameWrapper from "@/components/typing_test/GameWrapper";
import { GameSkeleton } from "@/components/skeletons/GameSkeleton";

export default function Home() {
  return (
    <div className="min-h-[calc(75vh)] flex items-center justify-center p-4">
      <Suspense fallback={<GameSkeleton />}>
        <GameWrapper />
      </Suspense>
    </div>
  );
}
