import { Suspense } from "react";
import { getUser } from "@/app/actions";
import MultiplayerClient from "@/components/multiplayer/MultiplayerClient";
import LoadingMultiplayer from "@/components/multiplayer/LoadingMultiplayer";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Multiplayer | KeyRush",
  description: "Race in real-time 1v1 typing matches and climb the ladder.",
  path: "/multiplayer",
});

const MultiplayerContent = async () => {
  const user = await getUser();
  return <MultiplayerClient user={user} />;
};

export default function MultiplayerPage() {
  return (
    <Suspense fallback={<LoadingMultiplayer />}>
      <MultiplayerContent />
    </Suspense>
  );
}
